-- Storage object metadata is discoverable only for live properties or the owner.
-- Public object URLs remain usable when already known because the bucket is public.
ALTER POLICY "Anyone can view property media" ON storage.objects
  TO anon, authenticated
  USING (
    bucket_id = 'properties-media'
    AND CASE
      WHEN name ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[^/]+$'
      THEN public.is_property_effectively_live(split_part(name, '/', 1)::uuid)
        OR public.is_property_owner(split_part(name, '/', 1)::uuid)
      ELSE false
    END
  );

-- The default pending queue includes initial submissions and approved properties
-- with pending renewal/payment requests. Property approval state stays approved.
CREATE OR REPLACE FUNCTION public.list_moderation_properties(
  p_status public.property_approval_status
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_properties jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public."user" AS admin_user
    WHERE admin_user.user_id = auth.uid()
      AND admin_user.role = 'admin'::public.user_role
  ) THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'property_id', p.property_id,
        'title', p.title,
        'property_type', p.property_type,
        'price', p.price,
        'approval_status', p.approval_status,
        'created_at', p.created_at,
        'host', jsonb_build_object(
          'firstname', u.firstname,
          'lastname', u.lastname
        ),
        'cover_image', cover.url,
        'request_type', CASE
          WHEN pending_boost.property_boosting_id IS NULL THEN NULL
          WHEN p.approval_status = 'approved'::public.property_approval_status
            THEN 'renewal'
          ELSE 'initial'
        END,
        'boost_request', CASE
          WHEN pending_boost.property_boosting_id IS NULL THEN NULL
          ELSE jsonb_build_object(
            'property_boosting_id', pending_boost.property_boosting_id,
            'boosting_plan_id', pending_boost.boosting_plan_id,
            'plan', jsonb_build_object(
              'name', pending_boost.plan_name,
              'duration_days', pending_boost.duration_days,
              'price', pending_boost.plan_price
            )
          )
        END
      ) ORDER BY p.created_at DESC, p.property_id DESC
    ),
    '[]'::jsonb
  ) INTO v_properties
  FROM public.property AS p
  JOIN public.host AS h ON h.host_id = p.host_id
  JOIN public."user" AS u ON u.user_id = h.user_id
  LEFT JOIN LATERAL (
    SELECT m.url
    FROM public.media AS m
    WHERE m.property_id = p.property_id
      AND m.type = 'image'::public.media_type
    ORDER BY m.media_id
    LIMIT 1
  ) AS cover ON true
  LEFT JOIN LATERAL (
    SELECT b.property_boosting_id, b.boosting_plan_id,
           plan.name AS plan_name, plan.duration_days,
           plan.price AS plan_price
    FROM public.property_boosting AS b
    JOIN public.boosting_plan AS plan
      ON plan.boosting_plan_id = b.boosting_plan_id
    WHERE b.property_id = p.property_id
      AND b.status = 'pending'::public.boosting_status
    LIMIT 1
  ) AS pending_boost ON true
  WHERE p.approval_status = p_status
     OR (
       p_status = 'pending'::public.property_approval_status
       AND p.approval_status = 'approved'::public.property_approval_status
       AND pending_boost.property_boosting_id IS NOT NULL
     );

  RETURN v_properties;
END;
$$;

-- An overdue stored-active boost is history for read purposes. Reads never
-- perform lifecycle mutations; reactivation synchronizes its stored status.
CREATE OR REPLACE FUNCTION public.get_moderation_property(p_property_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_property jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public."user" AS admin_user
    WHERE admin_user.user_id = auth.uid()
      AND admin_user.role = 'admin'::public.user_role
  ) THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_build_object(
    'property', to_jsonb(p),
    'media', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'media_id', m.media_id,
          'url', m.url,
          'type', m.type
        ) ORDER BY m.media_id
      )
      FROM public.media AS m
      WHERE m.property_id = p.property_id
    ), '[]'::jsonb),
    'host', jsonb_build_object(
      'firstname', u.firstname,
      'lastname', u.lastname,
      'phone', u.phone
    ),
    'boost', (
      SELECT to_jsonb(b) || jsonb_build_object('plan', to_jsonb(plan))
      FROM public.property_boosting AS b
      JOIN public.boosting_plan AS plan
        ON plan.boosting_plan_id = b.boosting_plan_id
      WHERE b.property_id = p.property_id
        AND (
          b.status = 'pending'::public.boosting_status
          OR (
            b.status = 'active'::public.boosting_status
            AND b.is_paid = true
            AND b.start_date <= pg_catalog.transaction_timestamp()
            AND b.end_date > pg_catalog.transaction_timestamp()
          )
        )
      LIMIT 1
    )
  ) INTO v_property
  FROM public.property AS p
  JOIN public.host AS h ON h.host_id = p.host_id
  JOIN public."user" AS u ON u.user_id = h.user_id
  WHERE p.property_id = p_property_id;

  RETURN v_property;
END;
$$;

REVOKE ALL ON FUNCTION public.list_moderation_properties(public.property_approval_status)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_moderation_property(uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_moderation_properties(public.property_approval_status)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_moderation_property(uuid)
  TO authenticated;

-- Baseline grants included non-DML powers that application clients do not use.
REVOKE TRUNCATE, TRIGGER, REFERENCES, MAINTAIN ON TABLE
  public."user", public.host, public.property, public.university,
  public.property_university, public.boosting_plan,
  public.property_boosting, public.media
  FROM PUBLIC, anon, authenticated;

-- Reproduce the existing per-bucket 50 MiB limit without recreating the bucket.
UPDATE storage.buckets
SET file_size_limit = 52428800
WHERE id = 'properties-media'
  AND file_size_limit IS DISTINCT FROM 52428800;
