-- Admin-only reads over existing accounts, Host properties and boost requests.
-- Payment decisions remain disabled until the Host submission contract is known.
CREATE INDEX property_boosting_admin_created_idx
  ON public.property_boosting(created_at DESC, property_boosting_id);
CREATE INDEX boost_payment_boost_latest_idx
  ON public.boost_payment(property_boosting_id, submitted_at DESC, payment_id DESC);

CREATE FUNCTION public.admin_directory_list(p_kind text, p_filters jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_filters jsonb := coalesce(p_filters,'{}'::jsonb);
  v_page integer; v_size integer; v_result jsonb;
BEGIN
  PERFORM public.require_admin();
  IF p_kind NOT IN ('users','hosts') OR jsonb_typeof(v_filters) <> 'object' OR
    EXISTS (SELECT 1 FROM jsonb_object_keys(v_filters) k WHERE k NOT IN
      ('page','page_size','query','from','to','role','sort','direction')) THEN
    RAISE EXCEPTION 'Unsupported directory filters' USING ERRCODE='22023';
  END IF;
  v_page := coalesce((v_filters->>'page')::integer,1);
  v_size := coalesce((v_filters->>'page_size')::integer,25);
  IF v_page NOT BETWEEN 1 AND 1000000 OR v_size NOT BETWEEN 1 AND 100 OR
    (v_page::bigint-1)*v_size > 2147483647 OR
    length(coalesce(v_filters->>'query','')) > 200 OR
    coalesce(v_filters->>'sort','created_at') NOT IN ('created_at','name') OR
    coalesce(v_filters->>'direction','desc') NOT IN ('asc','desc') OR
    (v_filters->>'role' IS NOT NULL AND (p_kind <> 'users' OR v_filters->>'role' NOT IN ('user','admin'))) OR
    (v_filters->>'from' IS NOT NULL AND v_filters->>'to' IS NOT NULL AND
      (v_filters->>'from')::timestamptz >= (v_filters->>'to')::timestamptz) THEN
    RAISE EXCEPTION 'Invalid directory filters' USING ERRCODE='22023';
  END IF;
  WITH source AS MATERIALIZED (
    SELECT u.user_id,h.host_id,u.firstname,u.lastname,u.email,u.phone,u.role::text AS role,
      u.created_at AS user_created_at,h.created_at AS host_created_at,
      coalesce(pc.property_count,0) AS property_count,
      coalesce(pc.pending_property_count,0) AS pending_property_count,
      coalesce(pc.approved_property_count,0) AS approved_property_count,
      pc.last_property_at,
      CASE WHEN p_kind='hosts' THEN h.created_at ELSE u.created_at END AS date,
      lower(concat_ws(' ',u.firstname,u.lastname,u.email,u.phone)) AS search
    FROM public."user" u LEFT JOIN public.host h USING(user_id)
    LEFT JOIN (SELECT host_id,count(*) AS property_count,
      count(*) FILTER(WHERE approval_status='pending') AS pending_property_count,
      count(*) FILTER(WHERE approval_status='approved') AS approved_property_count,
      max(created_at) AS last_property_at FROM public.property GROUP BY host_id) pc USING(host_id)
    WHERE p_kind='users' OR h.host_id IS NOT NULL
  ), filtered AS MATERIALIZED (
    SELECT * FROM source s WHERE
      (v_filters->>'role' IS NULL OR s.role=v_filters->>'role') AND
      (v_filters->>'from' IS NULL OR s.date >= (v_filters->>'from')::timestamptz) AND
      (v_filters->>'to' IS NULL OR s.date < (v_filters->>'to')::timestamptz) AND
      (v_filters->>'query' IS NULL OR strpos(s.search,lower(v_filters->>'query'))>0 OR
        (p_kind='hosts' AND EXISTS(SELECT 1 FROM public.property p
          WHERE p.host_id=s.host_id AND strpos(lower(p.title),lower(v_filters->>'query'))>0)))
  ), paged AS (
    SELECT * FROM filtered ORDER BY
      CASE WHEN v_filters->>'sort'='name' AND coalesce(v_filters->>'direction','desc')='asc'
        THEN lower(firstname || ' ' || lastname) END ASC NULLS LAST,
      CASE WHEN v_filters->>'sort'='name' AND coalesce(v_filters->>'direction','desc')='desc'
        THEN lower(firstname || ' ' || lastname) END DESC NULLS LAST,
      CASE WHEN coalesce(v_filters->>'sort','created_at')='created_at' AND
        coalesce(v_filters->>'direction','desc')='asc' THEN date END ASC NULLS LAST,
      CASE WHEN coalesce(v_filters->>'sort','created_at')='created_at' AND
        coalesce(v_filters->>'direction','desc')='desc' THEN date END DESC NULLS LAST,
      user_id ASC LIMIT v_size OFFSET (v_page-1)*v_size
  )
  SELECT jsonb_build_object('items',coalesce((SELECT jsonb_agg(to_jsonb(paged)) FROM paged),'[]'::jsonb),
    'total',(SELECT count(*) FROM filtered),'page',v_page,'page_size',v_size) INTO v_result;
  RETURN v_result;
END;
$$;

CREATE FUNCTION public.admin_directory_detail(p_id uuid, p_kind text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_account jsonb; v_host_id uuid; v_properties jsonb; v_total bigint;
BEGIN
  PERFORM public.require_admin();
  IF p_kind NOT IN ('users','hosts') THEN
    RAISE EXCEPTION 'Unsupported directory kind' USING ERRCODE='22023';
  END IF;
  -- Reuse the historical trusted account read without exposing its revoked RPC.
  v_account := public.admin_account_detail(p_id,p_kind='hosts');
  IF v_account IS NULL THEN RETURN NULL; END IF;
  v_host_id := (v_account->>'host_id')::uuid;
  SELECT count(*) INTO v_total FROM public.property WHERE host_id=v_host_id;
  SELECT coalesce(jsonb_agg(to_jsonb(p) ORDER BY p.created_at DESC,p.property_id),'[]'::jsonb)
    INTO v_properties FROM (SELECT property_id,title,property_type,price,approval_status,created_at
      FROM public.property WHERE host_id=v_host_id ORDER BY created_at DESC,property_id LIMIT 100) p;
  RETURN jsonb_build_object('account',v_account,'properties',v_properties,
    'property_total',v_total,'properties_limit',100);
END;
$$;

CREATE FUNCTION public.admin_boost_queue(p_filters jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_filters jsonb := coalesce(p_filters,'{}'::jsonb);
  v_page integer; v_size integer; v_result jsonb;
BEGIN
  PERFORM public.require_admin();
  IF jsonb_typeof(v_filters)<>'object' OR EXISTS(
    SELECT 1 FROM jsonb_object_keys(v_filters) k WHERE k NOT IN
      ('page','page_size','query','from','to','payment_status','boost_status','boost_id')) THEN
    RAISE EXCEPTION 'Unsupported boost filters' USING ERRCODE='22023';
  END IF;
  v_page := coalesce((v_filters->>'page')::integer,1);
  v_size := coalesce((v_filters->>'page_size')::integer,25);
  IF v_page NOT BETWEEN 1 AND 1000000 OR v_size NOT BETWEEN 1 AND 100 OR
    (v_page::bigint-1)*v_size > 2147483647 OR
    length(coalesce(v_filters->>'query','')) > 200 OR
    (v_filters->>'payment_status' IS NOT NULL AND v_filters->>'payment_status' NOT IN
      ('not_submitted','legacy_unrecorded','pending','verified','rejected')) OR
    (v_filters->>'boost_status' IS NOT NULL AND v_filters->>'boost_status' NOT IN
      ('pending','active','expired','rejected')) OR
    (v_filters->>'from' IS NOT NULL AND v_filters->>'to' IS NOT NULL AND
      (v_filters->>'from')::timestamptz >= (v_filters->>'to')::timestamptz) THEN
    RAISE EXCEPTION 'Invalid boost filters' USING ERRCODE='22023';
  END IF;
  WITH source AS MATERIALIZED (
    SELECT b.property_boosting_id,b.property_id,b.boosting_plan_id,b.created_at,
      b.status::text AS stored_boost_status,
      CASE WHEN b.status='active' AND b.end_date<=now() THEN 'expired' ELSE b.status::text END AS boost_status,
      b.review_status,b.is_paid,b.start_date,b.end_date,b.legacy_payment,
      b.amount_due,b.currency AS quoted_currency,b.duration_days AS quoted_duration_days,
      p.title AS property_title,p.property_type::text,p.approval_status::text AS property_status,
      h.host_id,u.user_id AS owner_user_id,u.firstname AS owner_firstname,
      u.lastname AS owner_lastname,u.email AS owner_email,
      plan.name AS plan_name,plan.price AS plan_price,plan.currency AS plan_currency,
      plan.duration_days AS plan_duration_days,
      CASE WHEN pay.payment_id IS NULL AND b.legacy_payment THEN 'legacy_unrecorded'
        WHEN pay.payment_id IS NULL THEN 'not_submitted' ELSE pay.status END AS payment_status,
      CASE WHEN pay.payment_id IS NULL THEN NULL ELSE to_jsonb(pay) END AS payment
    FROM public.property_boosting b JOIN public.property p USING(property_id)
    JOIN public.host h USING(host_id) JOIN public."user" u USING(user_id)
    JOIN public.boosting_plan plan USING(boosting_plan_id)
    LEFT JOIN LATERAL (SELECT * FROM public.boost_payment x
      WHERE x.property_boosting_id=b.property_boosting_id
      ORDER BY x.submitted_at DESC,x.payment_id DESC LIMIT 1) pay ON true
  ), filtered AS MATERIALIZED (
    SELECT * FROM source s WHERE
      (v_filters->>'boost_id' IS NULL OR s.property_boosting_id=(v_filters->>'boost_id')::uuid) AND
      (v_filters->>'payment_status' IS NULL OR s.payment_status=v_filters->>'payment_status') AND
      (v_filters->>'boost_status' IS NULL OR s.boost_status=v_filters->>'boost_status') AND
      (v_filters->>'from' IS NULL OR s.created_at>=(v_filters->>'from')::timestamptz) AND
      (v_filters->>'to' IS NULL OR s.created_at<(v_filters->>'to')::timestamptz) AND
      (v_filters->>'query' IS NULL OR strpos(lower(concat_ws(' ',s.property_boosting_id::text,
        s.property_title,s.property_type,s.owner_firstname,s.owner_lastname,s.owner_email,
        s.plan_name,s.payment->>'reference')),lower(v_filters->>'query'))>0)
  ), paged AS (
    SELECT * FROM filtered ORDER BY created_at DESC NULLS LAST,property_boosting_id DESC
    LIMIT v_size OFFSET (v_page-1)*v_size
  )
  SELECT jsonb_build_object('items',coalesce((SELECT jsonb_agg(to_jsonb(paged)) FROM paged),'[]'::jsonb),
    'total',(SELECT count(*) FROM filtered),'page',v_page,'page_size',v_size,
    'payment_counts',(SELECT jsonb_build_object(
      'not_submitted',count(*) FILTER(WHERE payment_status='not_submitted'),
      'legacy_unrecorded',count(*) FILTER(WHERE payment_status='legacy_unrecorded'),
      'pending',count(*) FILTER(WHERE payment_status='pending'),
      'verified',count(*) FILTER(WHERE payment_status='verified'),
      'rejected',count(*) FILTER(WHERE payment_status='rejected')) FROM source)) INTO v_result;
  RETURN v_result;
END;
$$;

CREATE FUNCTION public.admin_boost_detail(p_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  PERFORM public.require_admin();
  RETURN public.admin_boost_queue(jsonb_build_object('boost_id',p_id))->'items'->0;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_directory_list(text,jsonb),
  public.admin_directory_detail(uuid,text),public.admin_boost_queue(jsonb),
  public.admin_boost_detail(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_directory_list(text,jsonb),
  public.admin_directory_detail(uuid,text),public.admin_boost_queue(jsonb),
  public.admin_boost_detail(uuid) TO authenticated;
