-- Forward-only scope correction. Earlier Admin migrations may already exist in
-- other databases, so preserve their history and any payment records. The
-- final Admin surface is independent of the unfinished Host payment workflow.

-- Restore the pre-Admin TM-18 Host request contract: it does not require a
-- currency that existing plans do not have. Keep the property lock and the
-- existing pending/active uniqueness rule.
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
  IF v_property.approval_status = 'rejected'::public.property_approval_status THEN
    RAISE EXCEPTION 'Rejected property cannot request a boost' USING ERRCODE = 'M4030';
  END IF;
  v_now := pg_catalog.clock_timestamp();
  UPDATE public.property_boosting AS b SET status = 'expired'::public.boosting_status
    WHERE b.property_id = p_property_id AND b.status = 'active'::public.boosting_status
      AND b.end_date <= v_now;
  IF EXISTS (SELECT 1 FROM public.property_boosting AS b
    WHERE b.property_id = p_property_id AND b.status IN ('pending','active')) THEN
    RAISE EXCEPTION 'Property already has a current boost' USING ERRCODE = 'M4090';
  END IF;
  IF v_property.approval_status = 'approved'::public.property_approval_status
    AND NOT EXISTS (SELECT 1 FROM public.property_boosting AS b
      WHERE b.property_id = p_property_id AND b.status = 'expired'::public.boosting_status) THEN
    RAISE EXCEPTION 'Expired boost required for reactivation' USING ERRCODE = 'M4091';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.boosting_plan AS plan
    WHERE plan.boosting_plan_id = p_boosting_plan_id) THEN
    RAISE EXCEPTION 'Boosting plan not found' USING ERRCODE = 'M4041';
  END IF;
  INSERT INTO public.property_boosting(property_id, boosting_plan_id)
    VALUES(p_property_id,p_boosting_plan_id) RETURNING * INTO v_boost;
  RETURN v_boost;
END;
$$;

-- Moderation changes only property state. It neither reviews a boost nor
-- touches the provisional payment ledger. A malformed legacy paid-active
-- boost on a pending property must be reconciled before approving it, since
-- the public RLS predicate would otherwise make approval alone publish it.
CREATE OR REPLACE FUNCTION public.moderate_property(
  p_property_id uuid, p_decision text, p_reason text DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_property public.property;
BEGIN
  PERFORM public.require_admin();
  IF p_decision IS NULL OR p_decision NOT IN ('approved','rejected') OR
    (p_reason IS NOT NULL AND length(btrim(p_reason)) NOT BETWEEN 1 AND 1000) OR
    (p_decision = 'rejected' AND nullif(btrim(p_reason),'') IS NULL) THEN
    RAISE EXCEPTION 'Valid decision and rejection reason required' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_property FROM public.property
    WHERE property_id = p_property_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Property not found' USING ERRCODE = 'M4040'; END IF;
  IF v_property.approval_status::text = p_decision THEN RETURN; END IF;
  IF v_property.approval_status <> 'pending' THEN
    RAISE EXCEPTION 'Property is not pending' USING ERRCODE = 'M4090';
  END IF;
  IF p_decision = 'approved' AND EXISTS (
    SELECT 1 FROM public.property_boosting b WHERE b.property_id = p_property_id
      AND b.is_paid AND b.status = 'active' AND b.start_date <= pg_catalog.transaction_timestamp()
      AND b.end_date > pg_catalog.transaction_timestamp()
  ) THEN
    RAISE EXCEPTION 'Existing paid boost requires reconciliation before approval' USING ERRCODE = 'M4090';
  END IF;
  UPDATE public.property SET approval_status = p_decision::public.property_approval_status
    WHERE property_id = p_property_id;
  PERFORM public.record_admin_activity('property.' || p_decision,'property',p_property_id,p_reason);
END;
$$;

-- Until the Host team's payment design exists, no new unpaid boost can be
-- turned into a paid one, even through a direct table write or SECURITY
-- DEFINER function. Existing paid legacy rows remain usable/expirable.
CREATE OR REPLACE FUNCTION public.enforce_boost_payment() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.legacy_payment OR NEW.is_paid THEN
      RAISE EXCEPTION 'Boost activation is unavailable pending payment workflow' USING ERRCODE = '23514';
    END IF;
  ELSE
    IF NEW.legacy_payment IS DISTINCT FROM OLD.legacy_payment THEN
      RAISE EXCEPTION 'Legacy flag is immutable' USING ERRCODE = '23514';
    END IF;
    IF NOT OLD.is_paid AND NEW.is_paid THEN
      RAISE EXCEPTION 'Boost activation is unavailable pending payment workflow' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Protected historical functions/data may be present elsewhere. Revoke their
-- application-role entry points instead of dropping objects or payment rows.
REVOKE ALL ON FUNCTION public.decide_boost(uuid,text,text),
  public.submit_boost_payment(uuid,text,numeric,text),
  public.review_boost_payment(uuid,text,text),
  public.activate_property_boost(uuid) FROM PUBLIC, anon, authenticated;
REVOKE SELECT ON public.boost_payment FROM authenticated;
REVOKE ALL ON FUNCTION public.admin_account_detail(uuid,boolean) FROM PUBLIC, anon, authenticated;

-- The historical DELETE policy queried boost_payment, whose RLS policy in
-- turn queries property_boosting, causing infinite policy recursion. Restore
-- TM-18 Host cancellation; the ledger's RESTRICT foreign key still protects
-- any boost with payment history from deletion.
ALTER POLICY "Hosts can delete their property boosts" ON public.property_boosting
  TO authenticated USING (
    status = 'pending'::public.boosting_status AND public.is_property_owner(property_id)
  );

-- Retain only the current Dashboard's listing read. The compatibility wrapper
-- list_moderation_properties still calls this function with page_size=10000.
CREATE OR REPLACE FUNCTION public.admin_list(
  p_kind text, p_filters jsonb DEFAULT '{}'::jsonb
) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_sql text; v_result jsonb; v_page integer; v_size integer;
  v_sort text; v_direction text; v_filters jsonb;
BEGIN
  PERFORM public.require_admin();
  v_filters := coalesce(p_filters,'{}'::jsonb);
  IF p_kind IS DISTINCT FROM 'properties' OR jsonb_typeof(v_filters) <> 'object' OR
    EXISTS (SELECT 1 FROM jsonb_object_keys(v_filters) k WHERE k NOT IN
      ('page','page_size','query','from','to','sort','direction','status','property_type','host_id')) THEN
    RAISE EXCEPTION 'Unsupported resource or filters' USING ERRCODE = '22023';
  END IF;
  v_page := coalesce((v_filters->>'page')::integer,1);
  v_size := coalesce((v_filters->>'page_size')::integer,25);
  v_sort := coalesce(v_filters->>'sort','created_at');
  v_direction := coalesce(v_filters->>'direction','desc');
  IF v_page NOT BETWEEN 1 AND 1000000 OR v_size NOT BETWEEN 1 AND 10000 OR
    (v_page::bigint-1)*v_size > 2147483647 OR
    v_sort NOT IN ('created_at','name','price') OR v_direction NOT IN ('asc','desc') OR
    length(coalesce(v_filters->>'query','')) > 200 OR
    (v_filters->>'status' IS NOT NULL AND v_filters->>'status' NOT IN
      ('pending','approved','active','rejected','all')) OR
    ((v_filters->>'from')::timestamptz > (v_filters->>'to')::timestamptz) THEN
    RAISE EXCEPTION 'Invalid filters' USING ERRCODE = '22023';
  END IF;
  v_sql := $q$
    WITH source AS (
      SELECT p.property_id AS id,p.created_at AS date,p.title AS name,p.price,
        p.approval_status::text AS status,p.property_type::text AS property_type,p.host_id,
        concat_ws(' ',p.title,p.address,u.firstname,u.lastname,u.email) AS search,
        (p.approval_status = 'pending' OR
          (p.approval_status = 'approved' AND b.property_boosting_id IS NOT NULL)) AS queue,
        to_jsonb(p) || jsonb_build_object(
          'is_live',public.is_property_effectively_live(p.property_id),
          'host',jsonb_build_object('host_id',h.host_id,'user_id',u.user_id,
            'firstname',u.firstname,'lastname',u.lastname,'email',u.email,'phone',u.phone),
          'cover_image',(SELECT m.url FROM public.media m WHERE m.property_id=p.property_id
            AND m.type='image' ORDER BY m.media_id LIMIT 1),
          'request_type',CASE WHEN b.property_boosting_id IS NULL THEN NULL
            WHEN p.approval_status='approved' THEN 'renewal' ELSE 'initial' END,
          'boost_request',CASE WHEN b.property_boosting_id IS NULL THEN NULL
            ELSE to_jsonb(b) || jsonb_build_object('plan',to_jsonb(plan)) END) AS data
      FROM public.property p JOIN public.host h USING(host_id)
        JOIN public."user" u USING(user_id)
        LEFT JOIN public.property_boosting b ON b.property_id=p.property_id AND b.status='pending'
        LEFT JOIN public.boosting_plan plan USING(boosting_plan_id)
    ), filtered AS MATERIALIZED (
      SELECT * FROM source s WHERE
        ($1->>'status' IS NULL OR $1->>'status'='all' OR s.status=$1->>'status' OR
          ($1->>'status'='pending' AND s.queue) OR
          ($1->>'status'='active' AND (s.data->>'is_live')::boolean))
        AND ($1->>'property_type' IS NULL OR s.property_type=$1->>'property_type')
        AND ($1->>'host_id' IS NULL OR s.host_id=($1->>'host_id')::uuid)
        AND ($1->>'from' IS NULL OR s.date>=($1->>'from')::timestamptz)
        AND ($1->>'to' IS NULL OR s.date<($1->>'to')::timestamptz)
        AND ($1->>'query' IS NULL OR strpos(lower(s.search),lower($1->>'query'))>0)
    ), paged AS (
      SELECT * FROM filtered ORDER BY $q$ ||
        CASE v_sort WHEN 'name' THEN 'name' WHEN 'price' THEN 'price' ELSE 'date' END ||
        ' ' || v_direction || ' NULLS LAST, id ' || v_direction ||
        ' LIMIT $2 OFFSET $3) ' || $q$
    SELECT jsonb_build_object('items',coalesce((SELECT jsonb_agg(data) FROM paged),'[]'::jsonb),
      'total',(SELECT count(*) FROM filtered),'page',$4,'page_size',$2)
  $q$;
  EXECUTE v_sql INTO v_result USING v_filters,v_size,(v_page-1)*v_size,v_page;
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_moderation_property(p_property_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_result jsonb;
BEGIN
  PERFORM public.require_admin();
  SELECT jsonb_build_object(
    'property',to_jsonb(p),
    'host',to_jsonb(u) || jsonb_build_object('host_id',h.host_id),
    'media',coalesce((SELECT jsonb_agg(to_jsonb(m) ORDER BY media_id)
      FROM public.media m WHERE m.property_id=p.property_id),'[]'::jsonb),
    'boost',(SELECT to_jsonb(b) || jsonb_build_object('plan',to_jsonb(plan))
      FROM public.property_boosting b JOIN public.boosting_plan plan USING(boosting_plan_id)
      WHERE b.property_id=p.property_id AND (b.status='pending' OR
        (b.status='active' AND b.start_date<=now() AND b.end_date>now())) LIMIT 1),
    'history',coalesce((SELECT jsonb_agg(to_jsonb(a) ORDER BY a.created_at DESC,a.activity_id)
      FROM (SELECT * FROM public.admin_activity WHERE entity_type='property'
        AND entity_id=p.property_id ORDER BY created_at DESC,activity_id LIMIT 100) a),'[]'::jsonb)
  ) INTO v_result FROM public.property p JOIN public.host h USING(host_id)
    JOIN public."user" u USING(user_id) WHERE p.property_id=p_property_id;
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_edit_property(
  p_property_id uuid,p_changes jsonb,p_reason text
) RETURNS public.property LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_old public.property; v_new public.property;
BEGIN
  PERFORM public.require_admin();
  IF nullif(btrim(p_reason),'') IS NULL OR length(p_reason)>1000 OR
    p_changes IS NULL OR jsonb_typeof(p_changes)<>'object' OR p_changes='{}'::jsonb OR
    EXISTS(SELECT 1 FROM jsonb_object_keys(p_changes) k
      WHERE k NOT IN ('title','price','property_type')) THEN
    RAISE EXCEPTION 'Only title, price and property_type may be edited; reason required'
      USING ERRCODE='22023';
  END IF;
  SELECT * INTO v_old FROM public.property WHERE property_id=p_property_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Property not found' USING ERRCODE='M4040'; END IF;
  v_new:=jsonb_populate_record(v_old,p_changes);
  IF nullif(btrim(v_new.title),'') IS NULL OR length(v_new.title)>200 OR
    v_new.price IS NULL OR v_new.price<=0 OR v_new.price>=1000000000 THEN
    RAISE EXCEPTION 'Invalid property fields' USING ERRCODE='22023';
  END IF;
  UPDATE public.property SET title=v_new.title,price=v_new.price,
    property_type=v_new.property_type WHERE property_id=p_property_id RETURNING * INTO v_new;
  PERFORM public.record_admin_activity('property.edited','property',p_property_id,p_reason,
    jsonb_build_object('before',jsonb_build_object('title',v_old.title,'price',v_old.price,
      'property_type',v_old.property_type),'changes',p_changes));
  RETURN v_new;
END;
$$;

-- The current personal settings form edits names and avatar only. Preserve
-- the existing account phone rather than exposing an unrelated Admin write.
CREATE OR REPLACE FUNCTION public.admin_update_profile(p_changes jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_user public."user"; v_path text;
BEGIN
  PERFORM public.require_admin();
  IF p_changes IS NULL OR jsonb_typeof(p_changes)<>'object' OR p_changes='{}'::jsonb OR
    EXISTS(SELECT 1 FROM jsonb_object_keys(p_changes) k
      WHERE k NOT IN ('firstname','lastname','avatar_path')) THEN
    RAISE EXCEPTION 'Unsupported profile fields' USING ERRCODE='22023';
  END IF;
  SELECT * INTO v_user FROM public."user" WHERE user_id=auth.uid() FOR UPDATE;
  v_user:=jsonb_populate_record(v_user,p_changes - 'avatar_path');
  IF nullif(btrim(v_user.firstname),'') IS NULL OR length(v_user.firstname)>100 OR
    nullif(btrim(v_user.lastname),'') IS NULL OR length(v_user.lastname)>100 THEN
    RAISE EXCEPTION 'Invalid profile' USING ERRCODE='22023';
  END IF;
  UPDATE public."user" SET firstname=v_user.firstname,lastname=v_user.lastname
    WHERE user_id=auth.uid();
  IF p_changes ? 'avatar_path' THEN
    v_path:=p_changes->>'avatar_path';
    IF v_path IS NOT NULL AND (split_part(v_path,'/',1)<>auth.uid()::text OR NOT EXISTS(
      SELECT 1 FROM storage.objects WHERE bucket_id='admin-avatars' AND name=v_path)) THEN
      RAISE EXCEPTION 'Uploaded avatar required' USING ERRCODE='22023';
    END IF;
    INSERT INTO public.admin_profile(user_id,avatar_path) VALUES(auth.uid(),v_path)
      ON CONFLICT(user_id) DO UPDATE SET avatar_path=excluded.avatar_path;
  END IF;
  PERFORM public.record_admin_activity('profile.updated','user',auth.uid(),NULL,
    jsonb_build_object('fields',(SELECT jsonb_agg(k) FROM jsonb_object_keys(p_changes) k)));
  RETURN public.admin_get_profile();
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_statistics(
  p_from timestamptz,p_to timestamptz
) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_result jsonb;
BEGIN
  PERFORM public.require_admin();
  IF p_from IS NULL OR p_to IS NULL OR p_from>=p_to OR
    p_to-p_from>interval '366 days' THEN
    RAISE EXCEPTION 'Range must be positive and at most 366 days' USING ERRCODE='22023';
  END IF;
  SELECT jsonb_build_object(
    'as_of',now(),'from',p_from,'to',p_to,
    'users',(SELECT count(*) FROM public."user"),
    'hosts',(SELECT count(*) FROM public.host),
    'properties',(SELECT jsonb_build_object(
      'total',count(*),'pending',count(*) FILTER(WHERE approval_status='pending'),
      'approved',count(*) FILTER(WHERE approval_status='approved'),
      'active',count(*) FILTER(WHERE public.is_property_effectively_live(property_id)),
      'rejected',count(*) FILTER(WHERE approval_status='rejected')) FROM public.property),
    'property_types',(SELECT jsonb_object_agg(t.kind,t.total) FROM (
      SELECT kind,count(p.property_id) AS total FROM
        unnest(enum_range(NULL::public.property_type)) kind
        LEFT JOIN public.property p ON p.property_type=kind GROUP BY kind) t),
    'trends',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY t.day,t.metric) FROM (
      SELECT (created_at AT TIME ZONE 'UTC')::date AS day,'users' AS metric,
        count(*)::numeric AS value FROM public."user"
        WHERE created_at>=p_from AND created_at<p_to GROUP BY 1
      UNION ALL SELECT (created_at AT TIME ZONE 'UTC')::date,'hosts',count(*)
        FROM public.host WHERE created_at>=p_from AND created_at<p_to GROUP BY 1
      UNION ALL SELECT (created_at AT TIME ZONE 'UTC')::date,'properties',count(*)
        FROM public.property WHERE created_at>=p_from AND created_at<p_to GROUP BY 1
    ) t),'[]'::jsonb),
    'unknown_host_creation_dates',(SELECT count(*) FROM public.host WHERE created_at IS NULL)
  ) INTO v_result;
  RETURN v_result;
END;
$$;
