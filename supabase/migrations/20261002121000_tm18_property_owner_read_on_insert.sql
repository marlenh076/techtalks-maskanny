-- An INSERT ... RETURNING must see its new row before a helper can look it up.
-- Check the new row's host_id directly, preserving the same ownership rule.
ALTER POLICY "Anyone can read properties" ON public.property
  TO anon, authenticated
  USING (
    public.is_property_effectively_live(property_id)
    OR host_id IN (
      SELECT h.host_id
      FROM public.host AS h
      WHERE h.user_id = auth.uid()
    )
  );
