-- Host removal preserves property, boost, payment, view and Admin audit rows.
ALTER TABLE public.property
  ADD COLUMN archived_at timestamptz;

CREATE INDEX property_active_host_idx
  ON public.property (host_id, created_at DESC)
  WHERE archived_at IS NULL;

-- Hard deletion could cascade boosts and media, or fail at the payment RESTRICT
-- foreign key after Storage was already cleaned. Hosts now archive through this
-- transaction and the API cleans Storage only after it returns successfully.
CREATE FUNCTION public.archive_host_property(p_property_id uuid)
RETURNS public.property
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_property public.property%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Host access required' USING ERRCODE = '42501';
  END IF;

  SELECT p.* INTO v_property
  FROM public.property AS p
  WHERE p.property_id = p_property_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Property not found' USING ERRCODE = 'M4040';
  END IF;
  IF NOT public.is_property_owner(p_property_id) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  IF v_property.archived_at IS NULL THEN
    UPDATE public.property
    SET archived_at = pg_catalog.clock_timestamp()
    WHERE property_id = p_property_id
    RETURNING * INTO v_property;
  END IF;

  RETURN v_property;
END;
$$;

REVOKE ALL ON FUNCTION public.archive_host_property(uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.archive_host_property(uuid) TO authenticated;

-- Remove the direct hard-delete path. Archiving is the only Host removal action.
REVOKE DELETE ON public.property FROM PUBLIC, anon, authenticated;
DROP POLICY IF EXISTS "Hosts can delete their own properties" ON public.property;

ALTER POLICY "Hosts can update their own properties" ON public.property
  USING (
    archived_at IS NULL
    AND host_id IN (SELECT h.host_id FROM public.host AS h WHERE h.user_id = auth.uid())
  )
  WITH CHECK (
    archived_at IS NULL
    AND host_id IN (SELECT h.host_id FROM public.host AS h WHERE h.user_id = auth.uid())
  );

-- Protect archived content even from privileged edit paths. Admin moderation
-- state transitions remain possible; archived rows stay hidden regardless.
CREATE FUNCTION public.prevent_archived_property_content_edits()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF OLD.archived_at IS NOT NULL
    AND (pg_catalog.to_jsonb(NEW) - 'approval_status' - 'archived_at')
      IS DISTINCT FROM (pg_catalog.to_jsonb(OLD) - 'approval_status' - 'archived_at') THEN
    RAISE EXCEPTION 'Archived properties cannot be edited' USING ERRCODE = 'M4030';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_archived_property_content_edits
  BEFORE UPDATE ON public.property
  FOR EACH ROW EXECUTE FUNCTION public.prevent_archived_property_content_edits();
REVOKE ALL ON FUNCTION public.prevent_archived_property_content_edits()
  FROM PUBLIC, anon, authenticated;

-- Read-only media metadata remains available to the owner, but archived content
-- cannot be edited or removed through the normal media APIs.
ALTER POLICY "Hosts can create property media" ON public.media
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.property AS p
    JOIN public.host AS h ON h.host_id = p.host_id
    WHERE p.property_id = media.property_id AND h.user_id = auth.uid()
      AND p.archived_at IS NULL
      AND p.approval_status <> 'rejected'::public.property_approval_status
  ));
ALTER POLICY "Hosts can update property media" ON public.media
  USING (EXISTS (
    SELECT 1 FROM public.property AS p
    JOIN public.host AS h ON h.host_id = p.host_id
    WHERE p.property_id = media.property_id AND h.user_id = auth.uid()
      AND p.archived_at IS NULL
      AND p.approval_status <> 'rejected'::public.property_approval_status
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.property AS p
    JOIN public.host AS h ON h.host_id = p.host_id
    WHERE p.property_id = media.property_id AND h.user_id = auth.uid()
      AND p.archived_at IS NULL
      AND p.approval_status <> 'rejected'::public.property_approval_status
  ));
ALTER POLICY "Hosts can delete property media" ON public.media
  USING (EXISTS (
    SELECT 1 FROM public.property AS p
    JOIN public.host AS h ON h.host_id = p.host_id
    WHERE p.property_id = media.property_id AND h.user_id = auth.uid()
      AND p.archived_at IS NULL
  ));

-- Serialize media-row creation with the archive lock, so an upload that races
-- an archive cannot attach media after the archived row commits.
CREATE OR REPLACE FUNCTION public.enforce_property_media_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_old_media_id uuid;
  v_count bigint;
  v_limit integer;
  v_archived_at timestamptz;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.property_id = OLD.property_id AND NEW.type = OLD.type THEN
      RETURN NEW;
    END IF;
    v_old_media_id := OLD.media_id;
  END IF;

  SELECT p.archived_at INTO v_archived_at
  FROM public.property AS p
  WHERE p.property_id = NEW.property_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;
  IF v_archived_at IS NOT NULL THEN
    RAISE EXCEPTION 'Archived properties cannot receive media' USING ERRCODE = 'M4030';
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

-- Storage DELETE intentionally remains owner-authorized for post-archive cleanup.
-- Block new uploads and replacements for archived properties.
ALTER POLICY "Hosts can upload property media" ON storage.objects
  WITH CHECK (
    bucket_id = 'properties-media'
    AND EXISTS (
      SELECT 1 FROM public.property AS p
      JOIN public.host AS h ON h.host_id = p.host_id
      WHERE p.property_id::text = (storage.foldername(objects.name))[1]
        AND h.user_id = auth.uid() AND p.archived_at IS NULL
        AND p.approval_status <> 'rejected'::public.property_approval_status
    )
  );
ALTER POLICY "Hosts can update property media" ON storage.objects
  USING (
    bucket_id = 'properties-media'
    AND EXISTS (
      SELECT 1 FROM public.property AS p
      JOIN public.host AS h ON h.host_id = p.host_id
      WHERE p.property_id::text = (storage.foldername(objects.name))[1]
        AND h.user_id = auth.uid() AND p.archived_at IS NULL
        AND p.approval_status <> 'rejected'::public.property_approval_status
    )
  )
  WITH CHECK (
    bucket_id = 'properties-media'
    AND EXISTS (
      SELECT 1 FROM public.property AS p
      JOIN public.host AS h ON h.host_id = p.host_id
      WHERE p.property_id::text = (storage.foldername(objects.name))[1]
        AND h.user_id = auth.uid() AND p.archived_at IS NULL
        AND p.approval_status <> 'rejected'::public.property_approval_status
    )
  );

-- The existing live predicate controls public property/media RLS and view
-- tracking, so archiving immediately hides a property at database time.
CREATE OR REPLACE FUNCTION public.is_property_effectively_live(p_property_id uuid)
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
      AND p.archived_at IS NULL
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

CREATE OR REPLACE FUNCTION public.public_live_boost_activation_times()
RETURNS TABLE(property_id uuid, activated_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT p.property_id, b.start_date AS activated_at
  FROM public.property AS p
  JOIN public.property_boosting AS b ON b.property_id = p.property_id
  WHERE p.archived_at IS NULL
    AND p.approval_status = 'approved'::public.property_approval_status
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

-- Prevent new boost requests against archived properties in the same locked
-- lifecycle transaction that already enforces ownership and one current boost.
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
  IF v_property.archived_at IS NOT NULL THEN
    RAISE EXCEPTION 'Archived properties cannot receive boosts' USING ERRCODE = 'M4030';
  END IF;
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
