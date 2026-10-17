-- Expose only the activation timestamp for properties that are currently public.
-- The underlying boost and payment tables remain protected by RLS.
CREATE FUNCTION public.public_live_boost_activation_times()
RETURNS TABLE(property_id uuid, activated_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT p.property_id, b.start_date AS activated_at
  FROM public.property AS p
  JOIN public.property_boosting AS b ON b.property_id = p.property_id
  WHERE p.approval_status = 'approved'::public.property_approval_status
    AND b.status = 'active'::public.boosting_status
    AND b.is_paid = true
    AND b.start_date IS NOT NULL
    AND b.end_date IS NOT NULL
    AND b.start_date <= pg_catalog.transaction_timestamp()
    AND b.end_date > pg_catalog.transaction_timestamp();
$$;

REVOKE ALL ON FUNCTION public.public_live_boost_activation_times()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.public_live_boost_activation_times()
  TO anon, authenticated;
