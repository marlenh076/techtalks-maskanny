CREATE FUNCTION public.approve_property(p_property_id uuid)
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
    SELECT 1
    FROM public."user" AS u
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

  IF v_approval_status <> 'pending'::public.property_approval_status THEN
    RAISE EXCEPTION 'Property is not pending' USING ERRCODE = 'M4090';
  END IF;

  SELECT b.property_boosting_id, b.boosting_plan_id
    INTO v_boost_id, v_plan_id
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

  UPDATE public.property
  SET approval_status = 'approved'::public.property_approval_status
  WHERE property_id = p_property_id;

  UPDATE public.property_boosting
  SET is_paid = true,
      status = 'active'::public.boosting_status,
      start_date = v_start_date,
      end_date = v_start_date + pg_catalog.make_interval(days => v_duration_days)
  WHERE property_boosting_id = v_boost_id;
END;
$$;

CREATE FUNCTION public.reject_property(p_property_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_approval_status public.property_approval_status;
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public."user" AS u
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

  IF v_approval_status <> 'pending'::public.property_approval_status THEN
    RAISE EXCEPTION 'Property is not pending' USING ERRCODE = 'M4090';
  END IF;

  UPDATE public.property
  SET approval_status = 'rejected'::public.property_approval_status
  WHERE property_id = p_property_id;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_property(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reject_property(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.approve_property(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_property(uuid) TO authenticated;
