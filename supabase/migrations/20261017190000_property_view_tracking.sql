-- Individual view events contain only a server-derived, one-way visitor key.
CREATE TABLE public.property_view (
  property_view_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.property(property_id) ON DELETE CASCADE,
  visitor_key text NOT NULL CHECK (visitor_key ~ '^[0-9a-f]{64}$'),
  viewed_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

CREATE INDEX property_view_dedup_idx
  ON public.property_view (property_id, visitor_key, viewed_at DESC);
CREATE INDEX property_view_daily_idx
  ON public.property_view (property_id, viewed_at);

ALTER TABLE public.property_view ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.property_view FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SEQUENCE public.property_view_property_view_id_seq FROM PUBLIC, anon, authenticated;

-- Only the server's service role can submit a view. Live status is checked
-- again under a lock so direct table/RPC calls cannot count hidden listings.
CREATE FUNCTION public.record_property_view(p_property_id uuid, p_visitor_key text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_visitor_key IS NULL OR p_visitor_key !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'Invalid visitor key';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext(p_property_id::text), pg_catalog.hashtext(p_visitor_key)
  );
  IF NOT public.is_property_effectively_live(p_property_id) THEN
    RETURN false;
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.property_view v
    WHERE v.property_id = p_property_id AND v.visitor_key = p_visitor_key
      AND v.viewed_at > pg_catalog.clock_timestamp() - interval '30 minutes'
  ) THEN
    RETURN true;
  END IF;

  INSERT INTO public.property_view (property_id, visitor_key)
  VALUES (p_property_id, p_visitor_key);
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.record_property_view(uuid, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_property_view(uuid, text) TO service_role;

-- Host identity and property ownership are derived in SQL, not supplied by
-- the caller. The API adds authentication and bounds the requested date range.
CREATE FUNCTION public.host_property_view_daily(p_from timestamptz, p_to timestamptz)
RETURNS TABLE(day date, views bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.host h WHERE h.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Host access required';
  END IF;

  RETURN QUERY
  SELECT (v.viewed_at AT TIME ZONE 'UTC')::date AS day,
    pg_catalog.count(*)::bigint AS views
  FROM public.property_view v
  JOIN public.property p ON p.property_id = v.property_id
  JOIN public.host h ON h.host_id = p.host_id AND h.user_id = auth.uid()
  WHERE (p_from IS NULL OR v.viewed_at >= p_from)
    AND (p_to IS NULL OR v.viewed_at < p_to)
  GROUP BY 1 ORDER BY 1;
END;
$$;
REVOKE ALL ON FUNCTION public.host_property_view_daily(timestamptz, timestamptz)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.host_property_view_daily(timestamptz, timestamptz)
  TO authenticated;
