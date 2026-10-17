-- Restore paid activation only when an Admin has verified a recorded Host transfer.
-- The historical decision RPCs stay revoked from application roles.
-- Task 2's receipt read policy omitted one UUID segment. Correct it forward so
-- both the Host and Admin can inspect the private receipt for a selected boost.
ALTER POLICY boost_receipt_read ON storage.objects USING (
  bucket_id = 'boost-payment-receipts'
  AND (public.is_admin() OR CASE
    WHEN name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{64}\.(jpg|png|pdf)$'
      THEN public.can_read_boost_receipt(split_part(name, '/', 1)::uuid)
    ELSE false END)
);

CREATE OR REPLACE FUNCTION public.enforce_boost_payment() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.legacy_payment OR NEW.is_paid THEN
      RAISE EXCEPTION 'Paid and legacy boosts require the Admin lifecycle' USING ERRCODE = '23514';
    END IF;
  ELSE
    IF NEW.legacy_payment IS DISTINCT FROM OLD.legacy_payment THEN
      RAISE EXCEPTION 'Legacy flag is immutable' USING ERRCODE = '23514';
    END IF;
    IF NOT OLD.is_paid AND NEW.is_paid THEN
      PERFORM public.require_admin();
    END IF;
  END IF;
  IF NEW.is_paid AND NOT NEW.legacy_payment AND (
    NEW.review_status <> 'approved' OR NEW.status NOT IN ('active','expired')
    OR NOT EXISTS (SELECT 1 FROM public.boost_payment pay
      WHERE pay.property_boosting_id = NEW.property_boosting_id
        AND pay.status = 'verified' AND pay.amount = NEW.amount_due
        AND pay.currency = NEW.currency)
  ) THEN
    RAISE EXCEPTION 'Verified payment and approved boost required' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.enforce_boost_payment() FROM PUBLIC, anon, authenticated;

-- One transaction, using the existing property -> boost -> payment lock order.
-- A typed Whish reference plus explicit confirmation is an Admin attestation,
-- not an automated Whish lookup. The receipt is supporting evidence.
CREATE FUNCTION public.admin_decide_boost_payment(
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
    OR p_reference IS NULL OR length(btrim(p_reference)) NOT BETWEEN 3 AND 100
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
  IF v_payment.reference <> btrim(p_reference) THEN
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
  IF v_payment.status = 'pending' THEN
    UPDATE public.boost_payment SET status = 'verified', reviewed_at = now(),
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

REVOKE ALL ON FUNCTION public.admin_decide_boost_payment(uuid,uuid,text,text,boolean,text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_decide_boost_payment(uuid,uuid,text,text,boolean,text)
  TO authenticated;
REVOKE ALL ON FUNCTION public.decide_boost(uuid,text,text),
  public.submit_boost_payment(uuid,text,numeric,text),
  public.review_boost_payment(uuid,text,text),
  public.activate_property_boost(uuid) FROM PUBLIC, anon, authenticated;
