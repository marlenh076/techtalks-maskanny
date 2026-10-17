-- Admin may reconcile a real Whish transfer without a prior Host claim.
-- Keep verification, ledger insertion and one-property activation atomic.
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
  v_admin_recorded boolean := false;
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
  IF p_payment_id IS NULL THEN
    IF EXISTS (SELECT 1 FROM public.host h
      WHERE h.host_id = v_property.host_id AND h.user_id = auth.uid()) THEN
      RAISE EXCEPTION 'Cannot review your own property' USING ERRCODE = '42501';
    END IF;
    IF p_decision = 'rejected' THEN
      IF p_reference IS NOT NULL OR v_boost.status <> 'pending' OR v_boost.is_paid OR EXISTS (
        SELECT 1 FROM public.boost_payment pay
        WHERE pay.property_boosting_id = p_boost_id AND pay.status IN ('pending','verified')) THEN
        RAISE EXCEPTION 'Boost has changed or has a current payment claim' USING ERRCODE = 'M4090';
      END IF;
      UPDATE public.property_boosting SET status = 'rejected', review_status = 'rejected'
        WHERE property_boosting_id = p_boost_id RETURNING * INTO v_boost;
      PERFORM public.record_admin_activity('boost.rejected','property',v_property_id,
        btrim(p_reason),pg_catalog.jsonb_build_object('boost_id',p_boost_id,'payment_id',NULL));
      RETURN v_boost;
    END IF;
    -- An identical retry after an Admin-recorded activation is read-only.
    IF v_boost.status IN ('active','expired') AND v_boost.is_paid
      AND v_boost.review_status = 'approved' THEN
      IF EXISTS (SELECT 1 FROM public.boost_payment pay
        WHERE pay.property_boosting_id = p_boost_id AND pay.status = 'verified'
          AND pay.reference = btrim(p_reference)
          AND pay.submitted_by = pay.reviewed_by
          AND pay.amount = v_boost.amount_due AND pay.currency = v_boost.currency) THEN
        RETURN v_boost;
      END IF;
      RAISE EXCEPTION 'Boost was already activated with another payment' USING ERRCODE = 'M4090';
    END IF;
    IF EXISTS (SELECT 1 FROM public.boost_payment pay
      WHERE pay.property_boosting_id = p_boost_id AND pay.status IN ('pending','verified')) THEN
      RAISE EXCEPTION 'A current payment claim exists; refresh before approving' USING ERRCODE = 'M4090';
    END IF;
    v_admin_recorded := true;
  ELSE
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
  END IF;

  IF v_payment.status = 'verified' AND v_boost.status IN ('active','expired')
    AND v_boost.is_paid AND v_boost.review_status = 'approved' THEN
    RETURN v_boost;
  END IF;
  IF v_property.approval_status <> 'approved' OR v_boost.status <> 'pending'
    OR v_boost.is_paid OR v_boost.review_status = 'rejected'
    OR (NOT v_admin_recorded AND v_payment.status NOT IN ('pending','verified')) THEN
    RAISE EXCEPTION 'Approved property and pending boost required' USING ERRCODE = 'M4090';
  END IF;
  -- Receipt evidence is optional; the Admin must reconcile the Whish transfer.
  SELECT * INTO v_plan FROM public.boosting_plan
    WHERE boosting_plan_id = v_boost.boosting_plan_id FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Boosting plan not found' USING ERRCODE = 'M4041'; END IF;
  IF v_plan.currency IS NULL OR v_plan.price <= 0 OR v_plan.price <> round(v_plan.price,2)
    OR v_plan.duration_days <= 0 THEN
    RAISE EXCEPTION 'Boosting plan quote is unavailable' USING ERRCODE = 'M4092';
  END IF;
  IF v_admin_recorded AND v_boost.amount_due IS NULL
    AND v_boost.currency IS NULL AND v_boost.duration_days IS NULL THEN
    UPDATE public.property_boosting SET amount_due = v_plan.price,
      currency = v_plan.currency, duration_days = v_plan.duration_days
      WHERE property_boosting_id = p_boost_id RETURNING * INTO v_boost;
  END IF;
  IF v_plan.currency IS NULL OR v_plan.price <= 0 OR v_plan.duration_days <= 0
    OR v_boost.amount_due IS DISTINCT FROM v_plan.price
    OR v_boost.currency IS DISTINCT FROM v_plan.currency
    OR v_boost.duration_days IS DISTINCT FROM v_plan.duration_days
    OR (NOT v_admin_recorded AND
      (v_payment.amount <> v_plan.price OR v_payment.currency <> v_plan.currency)) THEN
    RAISE EXCEPTION 'Payment and selected plan quote differ' USING ERRCODE = 'M4092';
  END IF;
  IF v_admin_recorded OR v_payment.reference IS NULL THEN
    -- Coordinate with Host submissions claiming the same transfer reference.
    PERFORM pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('boost-payment:' || lower(btrim(p_reference)), 0));
    IF EXISTS (
      SELECT 1 FROM public.boost_payment other_payment
      WHERE (v_admin_recorded OR other_payment.payment_id <> v_payment.payment_id)
        AND lower(other_payment.reference) = lower(btrim(p_reference))
        AND other_payment.status IN ('pending','verified')
    ) THEN
      RAISE EXCEPTION 'Transaction reference is already claimed' USING ERRCODE = 'M4090';
    END IF;
  END IF;
  IF v_admin_recorded THEN
    INSERT INTO public.boost_payment
      (property_boosting_id,submitted_by,reference,amount,currency,status,reviewed_at,reviewed_by)
    VALUES (p_boost_id,auth.uid(),btrim(p_reference),v_plan.price,v_plan.currency,
      'verified',now(),auth.uid()) RETURNING * INTO v_payment;
    PERFORM public.record_admin_activity('payment.verified','property',v_property_id,
      NULL,pg_catalog.jsonb_build_object('payment_id',v_payment.payment_id,'boost_id',p_boost_id,
        'whish_transfer_confirmed',true,'source','admin_reconciliation'));
  ELSIF v_payment.status = 'pending' THEN
    UPDATE public.boost_payment SET status = 'verified',
      reference = coalesce(reference, btrim(p_reference)), reviewed_at = now(),
      reviewed_by = auth.uid(), rejection_reason = NULL
      WHERE payment_id = v_payment.payment_id;
    PERFORM public.record_admin_activity('payment.verified','property',v_property_id,
      NULL,pg_catalog.jsonb_build_object('payment_id',v_payment.payment_id,'boost_id',p_boost_id,
        'whish_transfer_confirmed',true));
  END IF;
  v_start := pg_catalog.clock_timestamp();
  UPDATE public.property_boosting SET review_status = 'approved',
    status = 'active', is_paid = true, start_date = v_start,
    end_date = v_start + pg_catalog.make_interval(days => v_plan.duration_days)
    WHERE property_boosting_id = p_boost_id RETURNING * INTO v_boost;
  PERFORM public.record_admin_activity('boost.approved','property',v_property_id,
    NULL,pg_catalog.jsonb_build_object('boost_id',p_boost_id,'payment_id',v_payment.payment_id));
  PERFORM public.record_admin_activity('boost.activated','property',v_property_id,
    NULL,pg_catalog.jsonb_build_object('boost_id',p_boost_id,'payment_id',v_payment.payment_id));
  RETURN v_boost;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_decide_boost_payment(uuid,uuid,text,text,boolean,text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_decide_boost_payment(uuid,uuid,text,text,boolean,text)
  TO authenticated;
