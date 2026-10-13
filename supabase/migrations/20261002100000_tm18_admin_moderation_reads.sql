CREATE FUNCTION public.list_moderation_properties(
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
        'cover_image', cover.url
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
  WHERE p.approval_status = p_status;

  RETURN v_properties;
END;
$$;

CREATE FUNCTION public.get_moderation_property(p_property_id uuid)
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
        AND b.status IN (
          'pending'::public.boosting_status,
          'active'::public.boosting_status
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
