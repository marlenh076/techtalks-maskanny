-- Evaluate public visibility at read time, using database time and every boost row.
-- SECURITY DEFINER avoids exposing private boost rows or recursing through property RLS.
CREATE FUNCTION public.is_property_effectively_live(p_property_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.property AS p
    JOIN public.property_boosting AS b ON b.property_id = p.property_id
    WHERE p.property_id = p_property_id
      AND p.approval_status = 'approved'::public.property_approval_status
      AND b.is_paid = true
      AND b.status = 'active'::public.boosting_status
      AND b.start_date IS NOT NULL
      AND b.end_date IS NOT NULL
      AND b.start_date <= pg_catalog.transaction_timestamp()
      AND b.end_date > pg_catalog.transaction_timestamp()
  );
$$;

REVOKE ALL ON FUNCTION public.is_property_effectively_live(uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_property_effectively_live(uuid)
  TO anon, authenticated;

ALTER POLICY "Anyone can read properties" ON public.property
  TO anon, authenticated
  USING (
    public.is_property_effectively_live(property_id)
    OR public.is_property_owner(property_id)
  );

ALTER POLICY "Anyone can view property media" ON public.media
  TO anon, authenticated
  USING (
    public.is_property_effectively_live(property_id)
    OR public.is_property_owner(property_id)
  );

ALTER POLICY "Anyone can view property universities" ON public.property_university
  TO anon, authenticated
  USING (
    public.is_property_effectively_live(property_id)
    OR public.is_property_owner(property_id)
  );

-- Universities are public reference data for both anonymous users and Hosts.
ALTER POLICY "Anyone can read universities" ON public.university
  TO anon, authenticated
  USING (true);
