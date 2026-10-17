-- A receipt can be submitted before the Host knows the Whish transaction reference.
-- Admin records a verified reference before activating a boost; existing grants and RLS remain.
ALTER TABLE public.boost_payment ALTER COLUMN reference DROP NOT NULL;
ALTER TABLE public.boost_payment ADD CONSTRAINT boost_payment_verified_reference_required
  CHECK (status <> 'verified' OR reference IS NOT NULL);
CREATE OR REPLACE FUNCTION public.submit_host_boost_payment(
  p_boost_id uuid, p_reference text, p_receipt_path text
) RETURNS public.boost_payment
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_property_id uuid;
  v_property public.property%ROWTYPE;
  v_boost public.property_boosting%ROWTYPE;
  v_plan public.boosting_plan%ROWTYPE;
  v_payment public.boost_payment%ROWTYPE;
  v_reference text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Host access required' USING ERRCODE = '42501';
  END IF;
  SELECT property_id INTO v_property_id FROM public.property_boosting
    WHERE property_boosting_id = p_boost_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Boost not found' USING ERRCODE = 'M4040'; END IF;
  -- Match the existing lifecycle lock order: property, then boost/payment.
  SELECT * INTO v_property FROM public.property WHERE property_id = v_property_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Property not found' USING ERRCODE = 'M4040'; END IF;
  SELECT * INTO v_boost FROM public.property_boosting
    WHERE property_boosting_id = p_boost_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Boost not found' USING ERRCODE = 'M4040'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.host h
    WHERE h.host_id = v_property.host_id AND h.user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;
  IF v_property.approval_status <> 'approved' OR v_boost.status <> 'pending'
    OR v_boost.is_paid OR v_boost.review_status = 'rejected' THEN
    RAISE EXCEPTION 'Boost is not eligible for payment submission' USING ERRCODE = 'M4090';
  END IF;

  v_reference := nullif(btrim(p_reference), '');
  IF v_reference IS NOT NULL AND v_reference !~ '^[A-Za-z0-9][A-Za-z0-9 /_-]{2,99}$' THEN
    RAISE EXCEPTION 'Invalid transaction reference' USING ERRCODE = '22023';
  END IF;
  IF p_receipt_path IS NULL OR p_receipt_path !~
    '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{64}\.(jpg|png|pdf)$'
    OR split_part(p_receipt_path, '/', 1) <> p_boost_id::text
    OR NOT EXISTS (SELECT 1 FROM storage.objects
      WHERE bucket_id = 'boost-payment-receipts' AND name = p_receipt_path) THEN
    RAISE EXCEPTION 'Uploaded receipt required' USING ERRCODE = '22023';
  END IF;

  -- Serialize claims on one Whish reference across different properties too.
  IF v_reference IS NOT NULL THEN
    PERFORM pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('boost-payment:' || lower(v_reference), 0));
  END IF;
  -- Exact retries return the same pending row. Changed evidence conflicts until
  -- rejection; after rejection, a new receipt may reuse the reference.
  SELECT * INTO v_payment FROM public.boost_payment
    WHERE property_boosting_id = p_boost_id AND status IN ('pending','verified') FOR UPDATE;
  IF FOUND THEN
    IF v_payment.status = 'pending' AND v_payment.reference IS NOT DISTINCT FROM v_reference
      AND v_payment.receipt_path = p_receipt_path THEN RETURN v_payment; END IF;
    RAISE EXCEPTION 'An open payment already exists for this boost' USING ERRCODE = 'M4090';
  END IF;
  IF EXISTS (SELECT 1 FROM public.boost_payment
    WHERE receipt_path = p_receipt_path) THEN
    RAISE EXCEPTION 'Receipt evidence is already submitted' USING ERRCODE = 'M4090';
  END IF;
  IF v_reference IS NOT NULL AND EXISTS (SELECT 1 FROM public.boost_payment
    WHERE lower(reference) = lower(v_reference) AND status IN ('pending','verified')) THEN
    RAISE EXCEPTION 'Transaction reference is already claimed' USING ERRCODE = 'M4090';
  END IF;

  SELECT * INTO v_plan FROM public.boosting_plan
    WHERE boosting_plan_id = v_boost.boosting_plan_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Boosting plan not found' USING ERRCODE = 'M4041'; END IF;
  IF v_plan.currency IS NULL OR v_plan.price <= 0 OR v_plan.price <> round(v_plan.price, 2)
    OR v_plan.duration_days <= 0 THEN
    RAISE EXCEPTION 'Boosting plan price, currency or duration needs configuration' USING ERRCODE = 'M4092';
  END IF;
  IF v_boost.amount_due IS NOT NULL AND
    (v_boost.amount_due <> v_plan.price OR v_boost.currency IS DISTINCT FROM v_plan.currency
      OR v_boost.duration_days IS DISTINCT FROM v_plan.duration_days) THEN
    RAISE EXCEPTION 'Boost quote no longer matches its plan' USING ERRCODE = 'M4092';
  END IF;
  IF v_boost.amount_due IS NULL THEN
    UPDATE public.property_boosting SET amount_due = v_plan.price,
      currency = v_plan.currency, duration_days = v_plan.duration_days
      WHERE property_boosting_id = p_boost_id;
  END IF;
  INSERT INTO public.boost_payment
    (property_boosting_id, submitted_by, reference, amount, currency, receipt_path)
  VALUES (p_boost_id, auth.uid(), v_reference, v_plan.price, v_plan.currency, p_receipt_path)
  RETURNING * INTO v_payment;
  RETURN v_payment;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_decide_boost_payment(
  p_boost_id uuid, p_payment_id uuid, p_reference text,
  p_decision text, p_whish_confirmed boolean, p_reason text DEFAULT NULL
) RETURNS public.property_boosting
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_property_id uuid;
  v_property public.property%ROWTYPE;
  v_boost public.property_boosting%ROWTYPE;
  v_payment public.boost_payment%ROWTYPE;
  v_plan public.boosting_plan%ROWTYPE;
  v_start timestamptz;
BEGIN
  PERFORM public.require_admin();
  IF p_decision IS NULL OR p_decision NOT IN ('approved','rejected')
    OR (p_decision = 'approved' AND (p_reference IS NULL
      OR btrim(p_reference) !~ '^[A-Za-z0-9][A-Za-z0-9 /_-]{2,99}$'))
    OR (p_decision = 'rejected' AND p_reference IS NOT NULL
      AND length(btrim(p_reference)) NOT BETWEEN 3 AND 100)
    OR (p_decision = 'approved' AND (p_whish_confirmed IS DISTINCT FROM true OR p_reason IS NOT NULL))
    OR (p_decision = 'rejected' AND (p_whish_confirmed IS DISTINCT FROM false
      OR p_reason IS NULL OR length(btrim(p_reason)) NOT BETWEEN 1 AND 1000)) THEN
    RAISE EXCEPTION 'Valid decision, Whish confirmation and reason required' USING ERRCODE = '22023';
  END IF;
  SELECT property_id INTO v_property_id FROM public.property_boosting
    WHERE property_boosting_id = p_boost_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Boost not found' USING ERRCODE = 'M4040'; END IF;
  SELECT * INTO v_property FROM public.property
    WHERE property_id = v_property_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Property not found' USING ERRCODE = 'M4040'; END IF;
  SELECT * INTO v_boost FROM public.property_boosting
    WHERE property_boosting_id = p_boost_id FOR UPDATE;
  IF NOT FOUND OR v_boost.property_id <> v_property_id THEN
    RAISE EXCEPTION 'Boost changed during review' USING ERRCODE = 'M4090';
  END IF;
  SELECT * INTO v_payment FROM public.boost_payment
    WHERE payment_id = p_payment_id AND property_boosting_id = p_boost_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Payment not found for boost' USING ERRCODE = 'M4040'; END IF;
  IF v_payment.reference IS NOT NULL
    AND v_payment.reference IS DISTINCT FROM btrim(p_reference) THEN
    RAISE EXCEPTION 'Payment reference changed; refresh before deciding' USING ERRCODE = 'M4090';
  END IF;
  IF EXISTS (SELECT 1 FROM public.host h
    WHERE h.host_id = v_property.host_id AND h.user_id = auth.uid())
    OR v_payment.submitted_by = auth.uid() THEN
    RAISE EXCEPTION 'Cannot review your own payment or property' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.host h
    WHERE h.host_id = v_property.host_id AND h.user_id = v_payment.submitted_by) THEN
    RAISE EXCEPTION 'Payment was not submitted by the property Host' USING ERRCODE = 'M4090';
  END IF;

  IF p_decision = 'rejected' THEN
    IF v_payment.status = 'rejected' AND v_payment.rejection_reason = btrim(p_reason)
      AND NOT EXISTS (SELECT 1 FROM public.boost_payment current_payment
        WHERE current_payment.property_boosting_id = p_boost_id
          AND current_payment.payment_id <> p_payment_id
          AND current_payment.status IN ('pending','verified')) THEN
      RETURN v_boost;
    END IF;
    IF v_payment.status <> 'pending' OR v_boost.status <> 'pending'
      OR v_boost.is_paid THEN
      RAISE EXCEPTION 'Payment is no longer pending' USING ERRCODE = 'M4090';
    END IF;
    UPDATE public.boost_payment SET status = 'rejected', reviewed_at = now(),
      reviewed_by = auth.uid(), rejection_reason = btrim(p_reason)
      WHERE payment_id = p_payment_id;
    PERFORM public.record_admin_activity('payment.rejected','property',v_property_id,
      btrim(p_reason),pg_catalog.jsonb_build_object('payment_id',p_payment_id,'boost_id',p_boost_id));
    RETURN v_boost;
  END IF;

  IF v_payment.status = 'verified' AND v_boost.status IN ('active','expired')
    AND v_boost.is_paid AND v_boost.review_status = 'approved' THEN
    RETURN v_boost;
  END IF;
  IF v_property.approval_status <> 'approved' OR v_boost.status <> 'pending'
    OR v_boost.is_paid OR v_boost.review_status = 'rejected'
    OR v_payment.status NOT IN ('pending','verified') THEN
    RAISE EXCEPTION 'Approved property and pending boost required' USING ERRCODE = 'M4090';
  END IF;
  IF v_payment.receipt_path IS NULL OR NOT EXISTS (
    SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'boost-payment-receipts'
      AND o.name = v_payment.receipt_path) THEN
    RAISE EXCEPTION 'Payment receipt is missing' USING ERRCODE = 'M4090';
  END IF;
  SELECT * INTO v_plan FROM public.boosting_plan
    WHERE boosting_plan_id = v_boost.boosting_plan_id FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Boosting plan not found' USING ERRCODE = 'M4041'; END IF;
  IF v_plan.currency IS NULL OR v_plan.price <= 0 OR v_plan.duration_days <= 0
    OR v_boost.amount_due IS DISTINCT FROM v_plan.price
    OR v_boost.currency IS DISTINCT FROM v_plan.currency
    OR v_boost.duration_days IS DISTINCT FROM v_plan.duration_days
    OR v_payment.amount <> v_plan.price OR v_payment.currency <> v_plan.currency THEN
    RAISE EXCEPTION 'Payment and selected plan quote differ' USING ERRCODE = 'M4092';
  END IF;
  IF v_payment.reference IS NULL THEN
    -- Coordinate with Host submissions claiming the same transfer reference.
    PERFORM pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('boost-payment:' || lower(btrim(p_reference)), 0));
    IF EXISTS (
      SELECT 1 FROM public.boost_payment other_payment
      WHERE other_payment.payment_id <> p_payment_id
        AND lower(other_payment.reference) = lower(btrim(p_reference))
        AND other_payment.status IN ('pending','verified')
    ) THEN
      RAISE EXCEPTION 'Transaction reference is already claimed' USING ERRCODE = 'M4090';
    END IF;
  END IF;
  IF v_payment.status = 'pending' THEN
    UPDATE public.boost_payment SET status = 'verified',
      reference = coalesce(reference, btrim(p_reference)), reviewed_at = now(),
      reviewed_by = auth.uid(), rejection_reason = NULL
      WHERE payment_id = p_payment_id;
    PERFORM public.record_admin_activity('payment.verified','property',v_property_id,
      NULL,pg_catalog.jsonb_build_object('payment_id',p_payment_id,'boost_id',p_boost_id,
        'whish_transfer_confirmed',true));
  END IF;
  v_start := pg_catalog.clock_timestamp();
  UPDATE public.property_boosting SET review_status = 'approved',
    status = 'active', is_paid = true, start_date = v_start,
    end_date = v_start + pg_catalog.make_interval(days => v_plan.duration_days)
    WHERE property_boosting_id = p_boost_id RETURNING * INTO v_boost;
  PERFORM public.record_admin_activity('boost.approved','property',v_property_id,
    NULL,pg_catalog.jsonb_build_object('boost_id',p_boost_id,'payment_id',p_payment_id));
  PERFORM public.record_admin_activity('boost.activated','property',v_property_id,
    NULL,pg_catalog.jsonb_build_object('boost_id',p_boost_id,'payment_id',p_payment_id));
  RETURN v_boost;
END;
$$;
REVOKE ALL ON FUNCTION public.submit_host_boost_payment(uuid,text,text),
  public.admin_decide_boost_payment(uuid,uuid,text,text,boolean,text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_host_boost_payment(uuid,text,text),
  public.admin_decide_boost_payment(uuid,uuid,text,text,boolean,text)
  TO authenticated;
