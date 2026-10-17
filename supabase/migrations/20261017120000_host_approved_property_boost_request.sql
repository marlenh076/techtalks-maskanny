-- Hosts select one approved property and one existing plan for each request.
-- Preserve the property lock and the pending/active unique index so renewal
-- history cannot create overlapping current boosts.
CREATE OR REPLACE FUNCTION public.request_property_boost(
  p_property_id uuid, p_boosting_plan_id uuid
) RETURNS public.property_boosting
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_host_id uuid;
  v_property public.property%ROWTYPE;
  v_now timestamptz;
  v_boost public.property_boosting%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Host access required' USING ERRCODE = '42501';
  END IF;
  SELECT h.host_id INTO v_host_id FROM public.host AS h WHERE h.user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Host access required' USING ERRCODE = '42501'; END IF;

  SELECT p.* INTO v_property FROM public.property AS p
    WHERE p.property_id = p_property_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Property not found' USING ERRCODE = 'M4040'; END IF;
  IF v_property.host_id <> v_host_id THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501'; END IF;
  IF v_property.approval_status <> 'approved'::public.property_approval_status THEN
    RAISE EXCEPTION 'Approved property required' USING ERRCODE = 'M4091';
  END IF;

  v_now := pg_catalog.clock_timestamp();
  UPDATE public.property_boosting AS b SET status = 'expired'::public.boosting_status
    WHERE b.property_id = p_property_id AND b.status = 'active'::public.boosting_status
      AND b.end_date <= v_now;
  IF EXISTS (SELECT 1 FROM public.property_boosting AS b
    WHERE b.property_id = p_property_id AND b.status IN ('pending','active')) THEN
    RAISE EXCEPTION 'Property already has a current boost' USING ERRCODE = 'M4090';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.boosting_plan AS plan
    WHERE plan.boosting_plan_id = p_boosting_plan_id) THEN
    RAISE EXCEPTION 'Boosting plan not found' USING ERRCODE = 'M4041';
  END IF;
  INSERT INTO public.property_boosting(property_id, boosting_plan_id)
    VALUES(p_property_id, p_boosting_plan_id) RETURNING * INTO v_boost;
  RETURN v_boost;
END;
$$;

REVOKE ALL ON FUNCTION public.request_property_boost(uuid, uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.request_property_boost(uuid, uuid)
  TO authenticated;
