-- Forward-only correction for existing Listings and Reports controls.
-- Preserve earlier migration history and existing RPC signatures/grants.
-- Reuse the public visibility predicate: approval alone never means Active.
CREATE OR REPLACE FUNCTION public.admin_list(p_kind text, p_filters jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_sql text; v_result jsonb; v_page integer; v_size integer; v_sort text; v_direction text;
BEGIN
  PERFORM public.require_admin();
  v_page := coalesce((p_filters->>'page')::integer,1);
  v_size := coalesce((p_filters->>'page_size')::integer,25);
  v_sort := coalesce(p_filters->>'sort','created_at');
  v_direction := coalesce(p_filters->>'direction','desc');
  IF v_page NOT BETWEEN 1 AND 1000000 OR v_size NOT BETWEEN 1 AND 10000 OR (v_page::bigint-1)*v_size>2147483647 OR v_sort NOT IN ('created_at','name','price')
    OR v_direction NOT IN ('asc','desc') OR length(coalesce(p_filters->>'query','')) > 200
    OR ((p_filters->>'from')::timestamptz > (p_filters->>'to')::timestamptz) THEN
    RAISE EXCEPTION 'Invalid filters' USING ERRCODE = '22023'; END IF;
  CASE p_kind
  WHEN 'properties' THEN v_sql := $q$
    SELECT p.property_id AS id, p.created_at AS date, p.title AS name, p.price,
      p.approval_status::text AS status, p.property_type::text AS property_type,
      p.host_id, h.user_id, concat_ws(' ',p.title,p.address,u.firstname,u.lastname,u.email) AS search,
      (p.approval_status = 'pending' OR (p.approval_status = 'approved' AND b.property_boosting_id IS NOT NULL)) AS queue,
      to_jsonb(p) || jsonb_build_object('is_live',public.is_property_effectively_live(p.property_id),'host',jsonb_build_object('host_id',h.host_id,'user_id',u.user_id,
        'firstname',u.firstname,'lastname',u.lastname,'email',u.email,'phone',u.phone),
        'cover_image',(SELECT m.url FROM public.media m WHERE m.property_id = p.property_id AND m.type = 'image' ORDER BY m.media_id LIMIT 1),
        'request_type',CASE WHEN b.property_boosting_id IS NULL THEN NULL WHEN p.approval_status = 'approved' THEN 'renewal' ELSE 'initial' END,
        'boost_request',CASE WHEN b.property_boosting_id IS NULL THEN NULL ELSE to_jsonb(b) || jsonb_build_object('plan',to_jsonb(plan)) END) AS data
    FROM public.property p JOIN public.host h USING(host_id) JOIN public."user" u USING(user_id)
    LEFT JOIN public.property_boosting b ON b.property_id = p.property_id AND b.status = 'pending'
    LEFT JOIN public.boosting_plan plan USING(boosting_plan_id)
  $q$;
  WHEN 'users', 'hosts' THEN v_sql := $q$
    SELECT u.user_id AS id, u.created_at AS date, concat_ws(' ',u.firstname,u.lastname) AS name, NULL::numeric AS price,
      u.role::text AS status, NULL::text AS property_type, h.host_id,u.user_id,
      concat_ws(' ',u.firstname,u.lastname,u.email,u.phone) AS search, false AS queue,
      to_jsonb(u) || jsonb_build_object('host_id',h.host_id,'host_since',h.created_at,
        'property_count',coalesce(pc.total,0),'approved_property_count',coalesce(pc.approved,0),
        'last_property_at',pc.last_property_at) AS data
    FROM public."user" u LEFT JOIN public.host h USING(user_id)
    LEFT JOIN (SELECT host_id,count(*) AS total,count(*) FILTER(WHERE approval_status = 'approved') AS approved,
      max(created_at) AS last_property_at FROM public.property GROUP BY host_id) pc USING(host_id)
  $q$;
    IF p_kind = 'hosts' THEN
      v_sql := replace(v_sql,'u.created_at AS date','h.created_at AS date') || ' WHERE h.host_id IS NOT NULL';
    END IF;
  WHEN 'payments', 'revenue' THEN v_sql := $q$
    SELECT pay.payment_id AS id, pay.submitted_at AS date, pay.reference AS name,pay.amount AS price,
      pay.status, NULL::text AS property_type,p.host_id,h.user_id,pay.reference AS search,false AS queue,
      to_jsonb(pay) || jsonb_build_object('property_id',p.property_id,'property_title',p.title) AS data
    FROM public.boost_payment pay JOIN public.property_boosting b USING(property_boosting_id)
    JOIN public.property p USING(property_id) JOIN public.host h USING(host_id)
  $q$;
    IF p_kind = 'revenue' THEN
      v_sql := replace(v_sql,'pay.submitted_at AS date','pay.reviewed_at AS date') || ' WHERE pay.status = ''verified''';
    END IF;
  WHEN 'boosts' THEN v_sql := $q$
    SELECT b.property_boosting_id AS id,b.created_at AS date,p.title AS name,b.amount_due AS price,
      CASE WHEN b.status = 'active' AND b.end_date <= now() THEN 'expired' ELSE b.status::text END AS status,
      p.property_type::text AS property_type,p.host_id,h.user_id,p.title AS search,false AS queue,
      to_jsonb(b) || jsonb_build_object('property_title',p.title,'effective_status',
        CASE WHEN b.status = 'active' AND b.end_date <= now() THEN 'expired' ELSE b.status::text END) AS data
    FROM public.property_boosting b JOIN public.property p USING(property_id) JOIN public.host h USING(host_id)
  $q$;
  WHEN 'activity' THEN v_sql := $q$
    SELECT a.activity_id AS id,a.created_at AS date,a.action AS name,NULL::numeric AS price,a.action AS status,
      NULL::text AS property_type,NULL::uuid AS host_id,a.actor_id AS user_id,
      concat_ws(' ',a.action,a.reason) AS search,false AS queue,to_jsonb(a) AS data FROM public.admin_activity a
  $q$;
  ELSE RAISE EXCEPTION 'Unsupported resource' USING ERRCODE = '22023';
  END CASE;
  v_sql := 'WITH source AS (' || v_sql || $q$), filtered AS MATERIALIZED (
    SELECT * FROM source s WHERE
      ($1->>'status' IS NULL OR s.status = $1->>'status' OR ($2 = 'properties' AND $1->>'status' = 'pending' AND s.queue)
        OR ($2 = 'properties' AND $1->>'status' = 'active' AND (s.data->>'is_live')::boolean))
      AND ($1->>'property_type' IS NULL OR s.property_type = $1->>'property_type')
      AND ($1->>'host_id' IS NULL OR s.host_id = ($1->>'host_id')::uuid)
      AND ($1->>'user_id' IS NULL OR s.user_id = ($1->>'user_id')::uuid)
      AND ($1->>'entity_id' IS NULL OR s.data->>'entity_id' = $1->>'entity_id')
      AND ($1->>'entity_type' IS NULL OR s.data->>'entity_type' = $1->>'entity_type')
      AND ($1->>'property_id' IS NULL OR s.data->>'property_id' = $1->>'property_id')
      AND ($1->>'boost_id' IS NULL OR s.data->>'property_boosting_id' = $1->>'boost_id')
      AND ($1->>'from' IS NULL OR s.date >= ($1->>'from')::timestamptz)
      AND ($1->>'to' IS NULL OR s.date < ($1->>'to')::timestamptz)
      AND ($1->>'query' IS NULL OR strpos(lower(s.search),lower($1->>'query')) > 0)
  ), paged AS (SELECT * FROM filtered ORDER BY $q$ ||
    CASE v_sort WHEN 'name' THEN 'name' WHEN 'price' THEN 'price' ELSE 'date' END || ' ' || v_direction ||
    ' NULLS LAST, id ' || v_direction || ' LIMIT $3 OFFSET $4) ' || $q$
    SELECT jsonb_build_object('items',coalesce((SELECT jsonb_agg(data) FROM paged),'[]'::jsonb),
      'total',(SELECT count(*) FROM filtered),'page',$5,'page_size',$3)
  $q$;
  EXECUTE v_sql INTO v_result USING p_filters,p_kind,v_size,(v_page-1)*v_size,v_page;
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_statistics(p_from timestamptz,p_to timestamptz) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_result jsonb;
BEGIN
  PERFORM public.require_admin();
  IF p_from IS NULL OR p_to IS NULL OR p_from>=p_to OR p_to-p_from>interval '366 days' THEN
    RAISE EXCEPTION 'Range must be positive and at most 366 days' USING ERRCODE = '22023'; END IF;
  SELECT jsonb_build_object(
    'as_of',now(),'from',p_from,'to',p_to,
    'users',(SELECT count(*) FROM public."user"),'hosts',(SELECT count(*) FROM public.host),
    'properties',(SELECT jsonb_build_object('total',count(*),'pending',count(*) FILTER(WHERE approval_status='pending'),
      'active',count(*) FILTER(WHERE public.is_property_effectively_live(property_id)),
      'approved',count(*) FILTER(WHERE approval_status='approved'),'rejected',count(*) FILTER(WHERE approval_status='rejected')) FROM public.property),
    'boosts',(SELECT jsonb_build_object('active',count(*) FILTER(WHERE status='active' AND start_date<=now() AND end_date>now()),
      'expired',count(*) FILTER(WHERE status='expired' OR (status='active' AND end_date<=now())),
      'pending',count(*) FILTER(WHERE status='pending'),'rejected',count(*) FILTER(WHERE status='rejected'),
      'legacy_paid',count(*) FILTER(WHERE legacy_payment)) FROM public.property_boosting),
    'payments',(SELECT jsonb_build_object('pending',count(*) FILTER(WHERE status='pending'),
      'verified',count(*) FILTER(WHERE status='verified'),'rejected',count(*) FILTER(WHERE status='rejected')) FROM public.boost_payment),
    'verified_revenue',coalesce((SELECT jsonb_agg(to_jsonb(r)) FROM (SELECT currency,sum(amount) AS amount,count(*) AS payments
      FROM public.boost_payment WHERE status='verified' AND reviewed_at>=p_from AND reviewed_at<p_to GROUP BY currency) r),'[]'::jsonb),
    'property_types',(SELECT jsonb_object_agg(t.kind,t.total) FROM (SELECT kind,count(p.property_id) AS total
      FROM unnest(enum_range(NULL::public.property_type)) kind LEFT JOIN public.property p ON p.property_type=kind GROUP BY kind) t),
    'recent_activity',coalesce((SELECT jsonb_agg(to_jsonb(a)) FROM (SELECT * FROM public.admin_activity ORDER BY created_at DESC,activity_id LIMIT 20) a),'[]'::jsonb),
    'trends',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY t.day,t.metric,t.currency) FROM (
      SELECT (created_at AT TIME ZONE 'UTC')::date AS day,'users' AS metric,NULL::text AS currency,count(*)::numeric AS value
        FROM public."user" WHERE created_at>=p_from AND created_at<p_to GROUP BY 1
      UNION ALL SELECT (created_at AT TIME ZONE 'UTC')::date,'hosts',NULL,count(*) FROM public.host WHERE created_at>=p_from AND created_at<p_to GROUP BY 1
      UNION ALL SELECT (created_at AT TIME ZONE 'UTC')::date,'properties',NULL,count(*) FROM public.property WHERE created_at>=p_from AND created_at<p_to GROUP BY 1
      UNION ALL SELECT (reviewed_at AT TIME ZONE 'UTC')::date,'verified_revenue',currency,sum(amount) FROM public.boost_payment
        WHERE status='verified' AND reviewed_at>=p_from AND reviewed_at<p_to GROUP BY 1,currency
      UNION ALL SELECT (created_at AT TIME ZONE 'UTC')::date,action,NULL,count(*) FROM public.admin_activity WHERE created_at>=p_from AND created_at<p_to GROUP BY 1,action
    ) t),'[]'::jsonb),
    'unknown_host_creation_dates',(SELECT count(*) FROM public.host WHERE created_at IS NULL)
  ) INTO v_result;
  RETURN v_result;
END;
$$;

