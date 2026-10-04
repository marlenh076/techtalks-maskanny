-- Keep ownership checks and also block new media on rejected properties.
ALTER POLICY "Hosts can create property media" ON public.media
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.property AS p
    JOIN public.host AS h ON h.host_id = p.host_id
    WHERE p.property_id = media.property_id
      AND h.user_id = auth.uid()
      AND p.approval_status <> 'rejected'::public.property_approval_status
  ));

ALTER POLICY "Hosts can update property media" ON public.media
  USING (EXISTS (
    SELECT 1
    FROM public.property AS p
    JOIN public.host AS h ON h.host_id = p.host_id
    WHERE p.property_id = media.property_id
      AND h.user_id = auth.uid()
      AND p.approval_status <> 'rejected'::public.property_approval_status
  ))
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.property AS p
    JOIN public.host AS h ON h.host_id = p.host_id
    WHERE p.property_id = media.property_id
      AND h.user_id = auth.uid()
      AND p.approval_status <> 'rejected'::public.property_approval_status
  ));

ALTER POLICY "Hosts can upload property media" ON storage.objects
  WITH CHECK (
    bucket_id = 'properties-media'
    AND EXISTS (
      SELECT 1
      FROM public.property AS p
      JOIN public.host AS h ON h.host_id = p.host_id
      WHERE p.property_id::text = (storage.foldername(objects.name))[1]
        AND h.user_id = auth.uid()
        AND p.approval_status <> 'rejected'::public.property_approval_status
    )
  );

ALTER POLICY "Hosts can update property media" ON storage.objects
  USING (
    bucket_id = 'properties-media'
    AND EXISTS (
      SELECT 1
      FROM public.property AS p
      JOIN public.host AS h ON h.host_id = p.host_id
      WHERE p.property_id::text = (storage.foldername(objects.name))[1]
        AND h.user_id = auth.uid()
        AND p.approval_status <> 'rejected'::public.property_approval_status
    )
  )
  WITH CHECK (
    bucket_id = 'properties-media'
    AND EXISTS (
      SELECT 1
      FROM public.property AS p
      JOIN public.host AS h ON h.host_id = p.host_id
      WHERE p.property_id::text = (storage.foldername(objects.name))[1]
        AND h.user_id = auth.uid()
        AND p.approval_status <> 'rejected'::public.property_approval_status
    )
  );

-- Lock the property row so simultaneous media writes count in sequence.
CREATE FUNCTION public.enforce_property_media_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_old_media_id uuid;
  v_count bigint;
  v_limit integer;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.property_id = OLD.property_id AND NEW.type = OLD.type THEN
      RETURN NEW;
    END IF;
    v_old_media_id := OLD.media_id;
  END IF;

  PERFORM 1
  FROM public.property AS p
  WHERE p.property_id = NEW.property_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN NEW; -- The existing foreign key reports a missing property.
  END IF;

  SELECT count(*) INTO v_count
  FROM public.media AS m
  WHERE m.property_id = NEW.property_id
    AND m.type = NEW.type
    AND (v_old_media_id IS NULL OR m.media_id <> v_old_media_id);

  v_limit := CASE WHEN NEW.type = 'image'::public.media_type THEN 6 ELSE 1 END;
  IF v_count >= v_limit THEN
    IF NEW.type = 'image'::public.media_type THEN
      RAISE EXCEPTION 'Maximum number of images reached' USING ERRCODE = 'M4093';
    END IF;
    RAISE EXCEPTION 'Only one video is allowed per property' USING ERRCODE = 'M4093';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_property_media_limit
  BEFORE INSERT OR UPDATE OF property_id, type ON public.media
  FOR EACH ROW EXECUTE FUNCTION public.enforce_property_media_limit();

REVOKE ALL ON FUNCTION public.enforce_property_media_limit()
  FROM PUBLIC, anon, authenticated;
