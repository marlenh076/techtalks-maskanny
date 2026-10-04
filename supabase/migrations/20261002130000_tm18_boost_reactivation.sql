-- All boost requests pass through one transaction so stale status and the new
-- pending row either both change or neither changes.
CREATE FUNCTION public.request_property_boost(
  p_property_id uuid,
  p_boosting_plan_id uuid
)
RETURNS public.property_boosting
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_host_id uuid;
  v_property public.property%ROWTYPE;
  v_now timestamptz;
  v_boost public.property_boosting%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Host access required' USING ERRCODE = '42501';
  END IF;

  SELECT h.host_id INTO v_host_id
  FROM public.host AS h
  WHERE h.user_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Host access required' USING ERRCODE = '42501';
  END IF;

  SELECT p.* INTO v_property
  FROM public.property AS p
  WHERE p.property_id = p_property_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Property not found' USING ERRCODE = 'M4040';
  END IF;
  IF v_property.host_id <> v_host_id THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;
  IF v_property.approval_status = 'rejected'::public.property_approval_status THEN
    RAISE EXCEPTION 'Rejected property cannot request a boost' USING ERRCODE = 'M4030';
  END IF;

  v_now := pg_catalog.clock_timestamp();
  UPDATE public.property_boosting AS b
  SET status = 'expired'::public.boosting_status
  WHERE b.property_id = p_property_id
    AND b.status = 'active'::public.boosting_status
    AND b.end_date <= v_now;

  IF EXISTS (
    SELECT 1 FROM public.property_boosting AS b
    WHERE b.property_id = p_property_id
      AND b.status IN ('pending'::public.boosting_status, 'active'::public.boosting_status)
  ) THEN
    RAISE EXCEPTION 'Property already has a current boost' USING ERRCODE = 'M4090';
  END IF;

  IF v_property.approval_status = 'approved'::public.property_approval_status
    AND NOT EXISTS (
      SELECT 1 FROM public.property_boosting AS b
      WHERE b.property_id = p_property_id
        AND b.status = 'expired'::public.boosting_status
    ) THEN
    RAISE EXCEPTION 'Expired boost required for reactivation' USING ERRCODE = 'M4091';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.boosting_plan AS plan
    WHERE plan.boosting_plan_id = p_boosting_plan_id
  ) THEN
    RAISE EXCEPTION 'Boosting plan not found' USING ERRCODE = 'M4041';
  END IF;

  INSERT INTO public.property_boosting (property_id, boosting_plan_id)
  VALUES (p_property_id, p_boosting_plan_id)
  RETURNING * INTO v_boost;

  RETURN v_boost;
END;
$$;

REVOKE ALL ON FUNCTION public.request_property_boost(uuid, uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.request_property_boost(uuid, uuid)
  TO authenticated;

-- Hosts no longer insert around the lifecycle transaction. Pending requests
-- remain cancellable, while paid active/expired history cannot be deleted.
REVOKE INSERT (property_id, boosting_plan_id)
  ON public.property_boosting FROM authenticated;
ALTER POLICY "Hosts can delete their property boosts" ON public.property_boosting
  TO authenticated
  USING (
    status = 'pending'::public.boosting_status
    AND public.is_property_owner(property_id)
  );

-- A read does not synchronize status. Expired historical rows and overdue
-- stored-active rows are excluded using database time and owner RLS.
CREATE FUNCTION public.get_current_property_boost(p_property_id uuid)
RETURNS SETOF public.property_boosting
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT b.*
  FROM public.property_boosting AS b
  WHERE b.property_id = p_property_id
    AND (
      b.status = 'pending'::public.boosting_status
      OR (
        b.status = 'active'::public.boosting_status
        AND b.is_paid = true
        AND b.start_date <= pg_catalog.transaction_timestamp()
        AND b.end_date > pg_catalog.transaction_timestamp()
      )
    )
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_current_property_boost(uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_property_boost(uuid)
  TO authenticated;

-- Initial approval still approves the property; renewal approval only
-- activates its pending boost and keeps the property approved.
CREATE OR REPLACE FUNCTION public.approve_property(p_property_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_approval_status public.property_approval_status;
  v_boost_id uuid;
  v_plan_id uuid;
  v_duration_days integer;
  v_start_date timestamptz;
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public."user" AS u
    WHERE u.user_id = auth.uid()
      AND u.role = 'admin'::public.user_role
  ) THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;

  SELECT p.approval_status INTO v_approval_status
  FROM public.property AS p
  WHERE p.property_id = p_property_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Property not found' USING ERRCODE = 'M4040';
  END IF;
  IF v_approval_status NOT IN (
    'pending'::public.property_approval_status,
    'approved'::public.property_approval_status
  ) THEN
    RAISE EXCEPTION 'Property cannot be approved' USING ERRCODE = 'M4090';
  END IF;

  SELECT b.property_boosting_id, b.boosting_plan_id INTO v_boost_id, v_plan_id
  FROM public.property_boosting AS b
  WHERE b.property_id = p_property_id
    AND b.status = 'pending'::public.boosting_status
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pending boost required' USING ERRCODE = 'M4091';
  END IF;

  SELECT plan.duration_days INTO v_duration_days
  FROM public.boosting_plan AS plan
  WHERE plan.boosting_plan_id = v_plan_id;
  IF NOT FOUND OR v_duration_days <= 0 THEN
    RAISE EXCEPTION 'Boosting plan unavailable or invalid' USING ERRCODE = 'M4092';
  END IF;

  v_start_date := pg_catalog.transaction_timestamp();
  IF v_approval_status = 'pending'::public.property_approval_status THEN
    UPDATE public.property
    SET approval_status = 'approved'::public.property_approval_status
    WHERE property_id = p_property_id;
  END IF;

  UPDATE public.property_boosting
  SET is_paid = true,
      status = 'active'::public.boosting_status,
      start_date = v_start_date,
      end_date = v_start_date + pg_catalog.make_interval(days => v_duration_days)
  WHERE property_boosting_id = v_boost_id;
END;
$$;
