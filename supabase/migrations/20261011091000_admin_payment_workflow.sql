-- Manual Whish payments. No gateway, secrets, receipts, or payer identity data.
CREATE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public."user" WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;
CREATE FUNCTION public.require_admin() RETURNS void
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.is_admin(), public.require_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

CREATE TABLE public.admin_activity (
  activity_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  reason text CHECK (reason IS NULL OR length(reason) BETWEEN 1 AND 1000),
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_activity ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_activity FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.admin_activity TO authenticated;
CREATE POLICY admin_activity_read ON public.admin_activity FOR SELECT TO authenticated USING (public.is_admin());
CREATE INDEX admin_activity_entity_idx ON public.admin_activity(entity_type, entity_id, created_at DESC);
CREATE INDEX admin_activity_date_idx ON public.admin_activity(created_at DESC);

CREATE FUNCTION public.record_admin_activity(p_action text, p_entity_type text, p_entity_id uuid,
  p_reason text DEFAULT NULL, p_details jsonb DEFAULT '{}'::jsonb) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  PERFORM public.require_admin();
  INSERT INTO public.admin_activity(actor_id, action, entity_type, entity_id, reason, details)
  VALUES(auth.uid(), p_action, p_entity_type, p_entity_id, p_reason, p_details);
END;
$$;
REVOKE ALL ON FUNCTION public.record_admin_activity(text,text,uuid,text,jsonb) FROM PUBLIC, anon, authenticated;

-- Historical host/boost creation times are unknown. Do not fabricate them.
ALTER TABLE public.host ADD COLUMN created_at timestamptz;
ALTER TABLE public.host ALTER COLUMN created_at SET DEFAULT now();
REVOKE INSERT ON public.host FROM PUBLIC, anon, authenticated;
GRANT INSERT(user_id) ON public.host TO authenticated;
ALTER TABLE public.boosting_plan ADD COLUMN currency text CHECK (currency ~ '^[A-Z]{3}$');
ALTER TABLE public.property_boosting
  ADD COLUMN created_at timestamptz,
  ADD COLUMN review_status text NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending','approved','rejected')),
  ADD COLUMN amount_due numeric CHECK (amount_due > 0 AND amount_due < 1000000000 AND amount_due = round(amount_due,2)),
  ADD COLUMN currency text CHECK (currency ~ '^[A-Z]{3}$'),
  ADD COLUMN duration_days integer CHECK (duration_days > 0),
  ADD COLUMN legacy_payment boolean NOT NULL DEFAULT false;
ALTER TABLE public.property_boosting ALTER COLUMN created_at SET DEFAULT now();
UPDATE public.property_boosting SET review_status = 'approved', legacy_payment = true WHERE is_paid;
ALTER TABLE public.property_boosting DROP CONSTRAINT property_boosting_lifecycle_check;
ALTER TABLE public.property_boosting ADD CONSTRAINT property_boosting_lifecycle_check CHECK (
  (status IN ('pending','rejected') AND NOT is_paid AND start_date IS NULL AND end_date IS NULL)
  OR (status IN ('active','expired') AND is_paid AND review_status = 'approved' AND start_date IS NOT NULL AND end_date IS NOT NULL AND end_date > start_date)
);
ALTER TABLE public.property_boosting ADD CONSTRAINT boost_review_state_check CHECK (
  (status = 'rejected') = (review_status = 'rejected')
);

CREATE TABLE public.boost_payment (
  payment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_boosting_id uuid NOT NULL REFERENCES public.property_boosting ON DELETE RESTRICT,
  submitted_by uuid NOT NULL,
  reference text NOT NULL CHECK (reference ~ '^[A-Za-z0-9][A-Za-z0-9 /_-]{2,99}$'),
  amount numeric NOT NULL CHECK (amount > 0 AND amount < 1000000000 AND amount = round(amount,2)),
  currency text NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid,
  rejection_reason text CHECK (rejection_reason IS NULL OR length(btrim(rejection_reason)) BETWEEN 1 AND 1000),
  CHECK ((status = 'pending' AND reviewed_at IS NULL AND reviewed_by IS NULL AND rejection_reason IS NULL)
    OR (status = 'verified' AND reviewed_at IS NOT NULL AND reviewed_by IS NOT NULL AND rejection_reason IS NULL)
    OR (status = 'rejected' AND reviewed_at IS NOT NULL AND reviewed_by IS NOT NULL AND rejection_reason IS NOT NULL))
);
CREATE UNIQUE INDEX boost_payment_one_open_idx ON public.boost_payment(property_boosting_id) WHERE status IN ('pending','verified');
-- Rejected references can be corrected/resubmitted; a verified transfer cannot fund two boosts.
CREATE UNIQUE INDEX boost_payment_verified_reference_idx ON public.boost_payment(lower(reference)) WHERE status = 'verified';
CREATE INDEX boost_payment_date_idx ON public.boost_payment(submitted_at DESC);
CREATE INDEX boost_payment_verified_date_idx ON public.boost_payment(reviewed_at) WHERE status = 'verified';
ALTER TABLE public.boost_payment ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.boost_payment FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.boost_payment TO authenticated;
CREATE POLICY boost_payment_read ON public.boost_payment FOR SELECT TO authenticated USING (
  public.is_admin() OR EXISTS (SELECT 1 FROM public.property_boosting b
    WHERE b.property_boosting_id = boost_payment.property_boosting_id AND public.is_property_owner(b.property_id))
);

-- Every lifecycle RPC takes the property lock before the boost/payment lock.
CREATE OR REPLACE FUNCTION public.request_property_boost(p_property_id uuid, p_boosting_plan_id uuid)
RETURNS public.property_boosting LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_property public.property; v_plan public.boosting_plan; v_boost public.property_boosting;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Host access required' USING ERRCODE = '42501'; END IF;
  SELECT * INTO v_property FROM public.property WHERE property_id = p_property_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Property not found' USING ERRCODE = 'M4040'; END IF;
  IF NOT public.is_property_owner(p_property_id) THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501'; END IF;
  IF v_property.approval_status = 'rejected' THEN RAISE EXCEPTION 'Rejected property' USING ERRCODE = 'M4030'; END IF;
  UPDATE public.property_boosting SET status = 'expired'
    WHERE property_id = p_property_id AND status = 'active' AND end_date <= clock_timestamp();
  IF EXISTS (SELECT 1 FROM public.property_boosting WHERE property_id = p_property_id AND status IN ('pending','active')) THEN
    RAISE EXCEPTION 'Property already has a current boost' USING ERRCODE = 'M4090';
  END IF;
  SELECT * INTO v_plan FROM public.boosting_plan WHERE boosting_plan_id = p_boosting_plan_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Boosting plan not found' USING ERRCODE = 'M4041'; END IF;
  IF v_plan.currency IS NULL OR v_plan.duration_days <= 0 OR v_plan.price <= 0 OR v_plan.price <> round(v_plan.price,2) THEN
    RAISE EXCEPTION 'Configure plan currency, price and duration first' USING ERRCODE = 'M4092';
  END IF;
  INSERT INTO public.property_boosting(property_id, boosting_plan_id, amount_due, currency, duration_days)
    VALUES(p_property_id, p_boosting_plan_id, v_plan.price, v_plan.currency, v_plan.duration_days) RETURNING * INTO v_boost;
  RETURN v_boost;
END;
$$;

CREATE FUNCTION public.moderate_property(p_property_id uuid, p_decision text, p_reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_property public.property;
BEGIN
  PERFORM public.require_admin();
  IF p_decision IS NULL OR p_decision NOT IN ('approved','rejected') OR
    (p_reason IS NOT NULL AND length(btrim(p_reason)) NOT BETWEEN 1 AND 1000) OR
    (p_decision = 'rejected' AND nullif(btrim(p_reason),'') IS NULL) THEN
    RAISE EXCEPTION 'Valid decision and rejection reason required' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_property FROM public.property WHERE property_id = p_property_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Property not found' USING ERRCODE = 'M4040'; END IF;
  IF v_property.approval_status::text = p_decision THEN RETURN; END IF;
  IF v_property.approval_status <> 'pending' THEN RAISE EXCEPTION 'Property is not pending' USING ERRCODE = 'M4090'; END IF;
  UPDATE public.property SET approval_status = p_decision::public.property_approval_status WHERE property_id = p_property_id;
  -- Initial moderation also decides its pending initial boost request. Never marks it paid.
  IF p_decision = 'approved' THEN
    UPDATE public.property_boosting SET review_status = 'approved' WHERE property_id = p_property_id AND status = 'pending';
  ELSE
    UPDATE public.boost_payment pay SET status = 'rejected', reviewed_by = auth.uid(), reviewed_at = now(), rejection_reason = p_reason
      FROM public.property_boosting b WHERE pay.property_boosting_id = b.property_boosting_id AND b.property_id = p_property_id AND pay.status = 'pending';
    UPDATE public.property_boosting SET status = 'rejected', review_status = 'rejected' WHERE property_id = p_property_id AND status = 'pending';
  END IF;
  PERFORM public.record_admin_activity('property.' || p_decision,'property',p_property_id,p_reason);
END;
$$;
-- Keep the legacy RPC safe; renewal decisions use their boost UUID explicitly.
CREATE OR REPLACE FUNCTION public.approve_property(p_property_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN PERFORM public.moderate_property(p_property_id, 'approved'); END;
$$;
CREATE OR REPLACE FUNCTION public.reject_property(p_property_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  PERFORM public.require_admin();
  RAISE EXCEPTION 'Rejection reason required; use moderate_property' USING ERRCODE = '22023';
END;
$$;

CREATE FUNCTION public.decide_boost(p_boost_id uuid, p_decision text, p_reason text DEFAULT NULL)
RETURNS public.property_boosting LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_boost public.property_boosting; v_property_id uuid;
BEGIN
  PERFORM public.require_admin();
  IF p_decision IS NULL OR p_decision NOT IN ('approved','rejected') OR
    (p_reason IS NOT NULL AND length(btrim(p_reason)) NOT BETWEEN 1 AND 1000) OR
    (p_decision = 'rejected' AND nullif(btrim(p_reason),'') IS NULL) THEN
    RAISE EXCEPTION 'Valid decision and rejection reason required' USING ERRCODE = '22023';
  END IF;
  SELECT property_id INTO v_property_id FROM public.property_boosting WHERE property_boosting_id = p_boost_id;
  PERFORM 1 FROM public.property WHERE property_id = v_property_id FOR UPDATE;
  SELECT * INTO v_boost FROM public.property_boosting WHERE property_boosting_id = p_boost_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Boost not found' USING ERRCODE = 'M4040'; END IF;
  IF v_boost.review_status = p_decision THEN RETURN v_boost; END IF;
  IF v_boost.status <> 'pending' OR EXISTS (SELECT 1 FROM public.boost_payment WHERE property_boosting_id = p_boost_id AND status = 'verified') THEN
    RAISE EXCEPTION 'Boost cannot be moderated in this state' USING ERRCODE = 'M4090';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.property WHERE property_id = v_property_id AND approval_status = 'approved') THEN
    RAISE EXCEPTION 'Approve the property first' USING ERRCODE = 'M4090';
  END IF;
  UPDATE public.property_boosting SET review_status = p_decision,
    status = CASE WHEN p_decision = 'rejected' THEN 'rejected'::public.boosting_status ELSE status END
    WHERE property_boosting_id = p_boost_id RETURNING * INTO v_boost;
  IF p_decision = 'rejected' THEN
    UPDATE public.boost_payment SET status = 'rejected', reviewed_at = now(), reviewed_by = auth.uid(), rejection_reason = p_reason
      WHERE property_boosting_id = p_boost_id AND status = 'pending';
  END IF;
  PERFORM public.record_admin_activity('boost.' || p_decision,'property',v_property_id,p_reason,jsonb_build_object('boost_id',p_boost_id));
  RETURN v_boost;
END;
$$;

CREATE FUNCTION public.submit_boost_payment(p_boost_id uuid, p_reference text, p_amount numeric, p_currency text)
RETURNS public.boost_payment LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_boost public.property_boosting; v_payment public.boost_payment; v_property_id uuid; v_plan public.boosting_plan;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501'; END IF;
  SELECT property_id INTO v_property_id FROM public.property_boosting WHERE property_boosting_id = p_boost_id;
  IF NOT public.is_admin() AND NOT public.is_property_owner(v_property_id) THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501'; END IF;
  PERFORM 1 FROM public.property WHERE property_id = v_property_id FOR UPDATE;
  SELECT * INTO v_boost FROM public.property_boosting WHERE property_boosting_id = p_boost_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Boost not found' USING ERRCODE = 'M4040'; END IF;
  IF v_boost.status <> 'pending' THEN RAISE EXCEPTION 'Pending boost required' USING ERRCODE = 'M4090'; END IF;
  -- Snapshot previously-created pending requests on their first payment submission.
  IF v_boost.amount_due IS NULL THEN
    SELECT * INTO v_plan FROM public.boosting_plan WHERE boosting_plan_id = v_boost.boosting_plan_id;
    IF v_plan.currency IS NULL OR v_plan.price <= 0 OR v_plan.duration_days <= 0 THEN
      RAISE EXCEPTION 'Configure boosting plan first' USING ERRCODE = 'M4092'; END IF;
    UPDATE public.property_boosting SET amount_due = v_plan.price, currency = v_plan.currency, duration_days = v_plan.duration_days
      WHERE property_boosting_id = p_boost_id RETURNING * INTO v_boost;
  END IF;
  IF p_amount IS NULL OR p_currency IS NULL OR p_amount <> v_boost.amount_due OR p_currency <> v_boost.currency THEN
    RAISE EXCEPTION 'Payment must match the quoted amount and currency' USING ERRCODE = '22023'; END IF;
  SELECT * INTO v_payment FROM public.boost_payment WHERE property_boosting_id = p_boost_id AND status IN ('pending','verified');
  IF FOUND THEN
    IF v_payment.reference = btrim(p_reference) AND v_payment.amount = p_amount AND v_payment.currency = p_currency THEN RETURN v_payment; END IF;
    RAISE EXCEPTION 'An open payment already exists' USING ERRCODE = 'M4090';
  END IF;
  INSERT INTO public.boost_payment(property_boosting_id, submitted_by, reference, amount, currency)
    VALUES(p_boost_id, auth.uid(), btrim(p_reference), p_amount, p_currency) RETURNING * INTO v_payment;
  IF public.is_admin() THEN
    PERFORM public.record_admin_activity('payment.submitted','property',v_property_id,NULL,jsonb_build_object('payment_id',v_payment.payment_id)); END IF;
  RETURN v_payment;
END;
$$;

CREATE FUNCTION public.review_boost_payment(p_payment_id uuid, p_decision text, p_reason text DEFAULT NULL)
RETURNS public.boost_payment LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_payment public.boost_payment; v_boost public.property_boosting; v_property_id uuid;
BEGIN
  PERFORM public.require_admin();
  IF p_decision IS NULL OR p_decision NOT IN ('verified','rejected') OR
    (p_reason IS NOT NULL AND length(btrim(p_reason)) NOT BETWEEN 1 AND 1000) OR
    (p_decision = 'rejected' AND nullif(btrim(p_reason),'') IS NULL) THEN
    RAISE EXCEPTION 'Valid decision and rejection reason required' USING ERRCODE = '22023'; END IF;
  SELECT b.property_id INTO v_property_id FROM public.boost_payment pay JOIN public.property_boosting b USING(property_boosting_id) WHERE pay.payment_id = p_payment_id;
  PERFORM 1 FROM public.property WHERE property_id = v_property_id FOR UPDATE;
  SELECT b.* INTO v_boost FROM public.property_boosting b JOIN public.boost_payment pay USING(property_boosting_id) WHERE pay.payment_id = p_payment_id FOR UPDATE OF b;
  SELECT * INTO v_payment FROM public.boost_payment WHERE payment_id = p_payment_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Payment not found' USING ERRCODE = 'M4040'; END IF;
  IF v_payment.status = p_decision THEN RETURN v_payment; END IF;
  IF v_payment.status <> 'pending' OR v_boost.status <> 'pending' THEN RAISE EXCEPTION 'Payment is not pending' USING ERRCODE = 'M4090'; END IF;
  IF p_decision = 'verified' AND (v_boost.review_status <> 'approved' OR NOT EXISTS (
    SELECT 1 FROM public.property WHERE property_id = v_property_id AND approval_status = 'approved')) THEN
    RAISE EXCEPTION 'Moderation approval required before verification' USING ERRCODE = 'M4090'; END IF;
  UPDATE public.boost_payment SET status = p_decision, reviewed_at = now(), reviewed_by = auth.uid(),
    rejection_reason = CASE WHEN p_decision = 'rejected' THEN p_reason END
    WHERE payment_id = p_payment_id RETURNING * INTO v_payment;
  PERFORM public.record_admin_activity('payment.' || p_decision,'property',v_property_id,p_reason,jsonb_build_object('payment_id',p_payment_id));
  RETURN v_payment;
END;
$$;

CREATE FUNCTION public.activate_property_boost(p_boost_id uuid) RETURNS public.property_boosting
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_boost public.property_boosting; v_property_id uuid; v_start timestamptz;
BEGIN
  PERFORM public.require_admin();
  SELECT property_id INTO v_property_id FROM public.property_boosting WHERE property_boosting_id = p_boost_id;
  PERFORM 1 FROM public.property WHERE property_id = v_property_id FOR UPDATE;
  SELECT * INTO v_boost FROM public.property_boosting WHERE property_boosting_id = p_boost_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Boost not found' USING ERRCODE = 'M4040'; END IF;
  IF v_boost.status IN ('active','expired') THEN RETURN v_boost; END IF;
  IF v_boost.status <> 'pending' OR v_boost.review_status <> 'approved' OR v_boost.duration_days IS NULL OR
    NOT EXISTS (SELECT 1 FROM public.property WHERE property_id = v_property_id AND approval_status = 'approved') OR
    NOT EXISTS (SELECT 1 FROM public.boost_payment WHERE property_boosting_id = p_boost_id AND status = 'verified'
      AND amount = v_boost.amount_due AND currency = v_boost.currency) THEN
    RAISE EXCEPTION 'Approved property, approved boost and verified payment required' USING ERRCODE = 'M4090'; END IF;
  v_start := clock_timestamp();
  UPDATE public.property_boosting SET status = 'active', is_paid = true, start_date = v_start,
    end_date = v_start + make_interval(days => v_boost.duration_days)
    WHERE property_boosting_id = p_boost_id RETURNING * INTO v_boost;
  PERFORM public.record_admin_activity('boost.activated','property',v_property_id,NULL,jsonb_build_object('boost_id',p_boost_id));
  RETURN v_boost;
END;
$$;

-- Defense against future code accidentally setting paid/active without a verified record.
CREATE FUNCTION public.enforce_boost_payment() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.legacy_payment THEN RAISE EXCEPTION 'Legacy flag is migration-only' USING ERRCODE = '23514'; END IF;
  IF TG_OP = 'UPDATE' AND NEW.legacy_payment IS DISTINCT FROM OLD.legacy_payment THEN
    RAISE EXCEPTION 'Legacy flag is immutable' USING ERRCODE = '23514'; END IF;
  IF NEW.is_paid AND NOT NEW.legacy_payment AND (
    NEW.review_status <> 'approved' OR NOT EXISTS (SELECT 1 FROM public.boost_payment pay
      WHERE pay.property_boosting_id = NEW.property_boosting_id AND pay.status = 'verified'
        AND pay.amount = NEW.amount_due AND pay.currency = NEW.currency)) THEN
    RAISE EXCEPTION 'Verified payment required' USING ERRCODE = '23514'; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER enforce_boost_payment BEFORE INSERT OR UPDATE ON public.property_boosting FOR EACH ROW EXECUTE FUNCTION public.enforce_boost_payment();
REVOKE ALL ON FUNCTION public.enforce_boost_payment() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.moderate_property(uuid,text,text), public.decide_boost(uuid,text,text),
  public.submit_boost_payment(uuid,text,numeric,text), public.review_boost_payment(uuid,text,text), public.activate_property_boost(uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.moderate_property(uuid,text,text), public.decide_boost(uuid,text,text),
  public.submit_boost_payment(uuid,text,numeric,text), public.review_boost_payment(uuid,text,text), public.activate_property_boost(uuid) TO authenticated;

-- Do not let cancellation/cascading deletes erase payment or moderation evidence.
ALTER POLICY "Hosts can delete their property boosts" ON public.property_boosting USING (
  status = 'pending' AND public.is_property_owner(property_id)
  AND NOT EXISTS (SELECT 1 FROM public.boost_payment pay WHERE pay.property_boosting_id = property_boosting.property_boosting_id)
);
ALTER FUNCTION public.handle_new_user() SET search_path = '';
CREATE OR REPLACE FUNCTION public.is_property_owner(property_uuid uuid) RETURNS boolean
LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.property p JOIN public.host h USING(host_id)
    WHERE p.property_id=property_uuid AND h.user_id=auth.uid());
$$;
REVOKE ALL ON FUNCTION public.handle_new_user(), public.sync_user_email() FROM PUBLIC, anon, authenticated;
