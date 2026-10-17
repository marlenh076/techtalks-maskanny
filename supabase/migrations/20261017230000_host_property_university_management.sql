-- Hosts may read and manage university links only for properties they own.
-- Public live-property university visibility remains governed by its existing policy.
CREATE POLICY "Hosts can insert universities for owned properties"
  ON public.property_university FOR INSERT TO authenticated
  WITH CHECK (
    public.is_property_owner(property_id)
    AND EXISTS (
      SELECT 1 FROM public.property AS p
      WHERE p.property_id = property_university.property_id
        AND p.archived_at IS NULL
    )
  );

CREATE POLICY "Hosts can delete universities for owned properties"
  ON public.property_university FOR DELETE TO authenticated
  USING (
    public.is_property_owner(property_id)
    AND EXISTS (
      SELECT 1 FROM public.property AS p
      WHERE p.property_id = property_university.property_id
        AND p.archived_at IS NULL
    )
  );

CREATE FUNCTION public.replace_host_property_universities(
  p_property_id uuid, p_university_ids uuid[]
)
RETURNS uuid[]
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_after uuid[]; v_unknown_count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Host access required' USING ERRCODE = '42501';
  END IF;
  IF p_university_ids IS NULL OR cardinality(p_university_ids) > 100 OR
     cardinality(p_university_ids) <> (SELECT count(DISTINCT selected.id) FROM unnest(p_university_ids) AS selected(id)) THEN
    RAISE EXCEPTION 'Invalid university selection' USING ERRCODE = '22023';
  END IF;

  PERFORM 1 FROM public.property AS p
    JOIN public.host AS h ON h.host_id = p.host_id
    WHERE p.property_id = p_property_id AND h.user_id = auth.uid()
      AND p.archived_at IS NULL
    FOR UPDATE OF p;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Host access required for an active owned property' USING ERRCODE = '42501';
  END IF;

  SELECT count(*) INTO v_unknown_count
  FROM unnest(p_university_ids) AS selected(id)
  WHERE NOT EXISTS (SELECT 1 FROM public.university AS u WHERE u.university_id = selected.id);
  IF v_unknown_count > 0 THEN
    RAISE EXCEPTION 'One or more selected universities do not exist' USING ERRCODE = '22023';
  END IF;

  DELETE FROM public.property_university WHERE property_id = p_property_id;
  INSERT INTO public.property_university (property_id, university_id)
    SELECT p_property_id, selected.id FROM unnest(p_university_ids) AS selected(id);
  SELECT coalesce(array_agg(pu.university_id ORDER BY pu.university_id), ARRAY[]::uuid[])
    INTO v_after FROM public.property_university AS pu WHERE pu.property_id = p_property_id;
  RETURN v_after;
END;
$$;

REVOKE ALL ON FUNCTION public.replace_host_property_universities(uuid, uuid[])
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.replace_host_property_universities(uuid, uuid[])
  TO authenticated;
