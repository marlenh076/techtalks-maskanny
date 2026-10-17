-- Direct boost_payment SELECT was revoked by the Admin scope correction.
-- Expose only the latest status for a boost owned by the calling Host.
CREATE FUNCTION public.get_host_boost_payment_status(p_boost_id uuid)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_status jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.property_boosting b
    JOIN public.property p USING (property_id)
    JOIN public.host h USING (host_id)
    WHERE b.property_boosting_id = p_boost_id AND h.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT pg_catalog.jsonb_build_object(
    'payment_id', pay.payment_id,
    'status', pay.status,
    'reference', pay.reference,
    'amount', pay.amount,
    'currency', pay.currency,
    'submitted_at', pay.submitted_at,
    'rejection_reason', pay.rejection_reason
  ) INTO v_status
  FROM public.boost_payment pay
  WHERE pay.property_boosting_id = p_boost_id
  ORDER BY pay.submitted_at DESC, pay.payment_id DESC
  LIMIT 1;

  RETURN v_status;
END;
$$;

REVOKE ALL ON FUNCTION public.get_host_boost_payment_status(uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_host_boost_payment_status(uuid)
  TO authenticated;
