-- Host payment evidence is private and remains separate from Admin verification.
-- Historical payment rows have no receipt; new Host submissions always do.
ALTER TABLE public.boost_payment ADD COLUMN receipt_path text;
ALTER TABLE public.boost_payment ADD CONSTRAINT boost_payment_receipt_path_check CHECK (
  receipt_path IS NULL OR receipt_path ~
    '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{64}\.(jpg|png|pdf)$'
);
CREATE UNIQUE INDEX boost_payment_receipt_path_idx ON public.boost_payment(receipt_path)
  WHERE receipt_path IS NOT NULL;
CREATE INDEX boost_payment_open_reference_idx ON public.boost_payment(lower(reference))
  WHERE status IN ('pending','verified');

INSERT INTO storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
VALUES ('boost-payment-receipts', 'boost-payment-receipts', false, 5242880,
  ARRAY['image/jpeg','image/png','application/pdf']);

CREATE FUNCTION public.can_upload_boost_receipt(p_boost_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.property_boosting b
    JOIN public.property p USING(property_id)
    JOIN public.host h USING(host_id)
    WHERE b.property_boosting_id = p_boost_id
      AND h.user_id = auth.uid()
      AND p.approval_status = 'approved'
      AND b.status = 'pending' AND NOT b.is_paid
  );
$$;

CREATE FUNCTION public.can_delete_unsubmitted_boost_receipt(p_path text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT CASE WHEN p_path ~
    '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{64}\.(jpg|png|pdf)$'
    THEN public.can_upload_boost_receipt(split_part(p_path, '/', 1)::uuid)
      AND NOT EXISTS (SELECT 1 FROM public.boost_payment WHERE receipt_path = p_path)
    ELSE false END;
$$;

CREATE FUNCTION public.can_read_boost_receipt(p_boost_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.property_boosting b
    JOIN public.property p USING(property_id)
    JOIN public.host h USING(host_id)
    WHERE b.property_boosting_id = p_boost_id AND h.user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.can_upload_boost_receipt(uuid),
  public.can_delete_unsubmitted_boost_receipt(text),
  public.can_read_boost_receipt(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_upload_boost_receipt(uuid),
  public.can_delete_unsubmitted_boost_receipt(text),
  public.can_read_boost_receipt(uuid) TO authenticated;

CREATE POLICY host_boost_receipt_insert ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'boost-payment-receipts'
  AND CASE WHEN name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{64}\.(jpg|png|pdf)$'
    THEN public.can_upload_boost_receipt(split_part(name, '/', 1)::uuid)
    ELSE false END
);
CREATE POLICY boost_receipt_read ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'boost-payment-receipts'
  AND (public.is_admin() OR CASE
    WHEN name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{64}\.(jpg|png|pdf)$'
      THEN public.can_read_boost_receipt(split_part(name, '/', 1)::uuid)
    ELSE false END)
);
CREATE POLICY host_unsubmitted_boost_receipt_delete ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'boost-payment-receipts'
  AND public.can_delete_unsubmitted_boost_receipt(name));

-- The older submit_boost_payment RPC takes caller-supplied amount/currency and
-- remains revoked. This entry point is Host-only and quotes the selected plan.
CREATE FUNCTION public.submit_host_boost_payment(
  p_boost_id uuid, p_reference text, p_receipt_path text
) RETURNS public.boost_payment
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_property_id uuid;
  v_property public.property%ROWTYPE;
  v_boost public.property_boosting%ROWTYPE;
  v_plan public.boosting_plan%ROWTYPE;
  v_payment public.boost_payment%ROWTYPE;
  v_reference text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Host access required' USING ERRCODE = '42501';
  END IF;
  SELECT property_id INTO v_property_id FROM public.property_boosting
    WHERE property_boosting_id = p_boost_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Boost not found' USING ERRCODE = 'M4040'; END IF;
  -- Match the existing lifecycle lock order: property, then boost/payment.
  SELECT * INTO v_property FROM public.property WHERE property_id = v_property_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Property not found' USING ERRCODE = 'M4040'; END IF;
  SELECT * INTO v_boost FROM public.property_boosting
    WHERE property_boosting_id = p_boost_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Boost not found' USING ERRCODE = 'M4040'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.host h
    WHERE h.host_id = v_property.host_id AND h.user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;
  IF v_property.approval_status <> 'approved' OR v_boost.status <> 'pending'
    OR v_boost.is_paid OR v_boost.review_status = 'rejected' THEN
    RAISE EXCEPTION 'Boost is not eligible for payment submission' USING ERRCODE = 'M4090';
  END IF;

  v_reference := btrim(p_reference);
  IF v_reference IS NULL OR v_reference !~ '^[A-Za-z0-9][A-Za-z0-9 /_-]{2,99}$' THEN
    RAISE EXCEPTION 'Invalid transaction reference' USING ERRCODE = '22023';
  END IF;
  IF p_receipt_path IS NULL OR p_receipt_path !~
    '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{64}\.(jpg|png|pdf)$'
    OR split_part(p_receipt_path, '/', 1) <> p_boost_id::text
    OR NOT EXISTS (SELECT 1 FROM storage.objects
      WHERE bucket_id = 'boost-payment-receipts' AND name = p_receipt_path) THEN
    RAISE EXCEPTION 'Uploaded receipt required' USING ERRCODE = '22023';
  END IF;

  -- Serialize claims on one Whish reference across different properties too.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('boost-payment:' || lower(v_reference), 0));
  -- Exact retries return the same pending row. Changed evidence conflicts until
  -- rejection; after rejection, a new receipt may reuse the reference.
  SELECT * INTO v_payment FROM public.boost_payment
    WHERE property_boosting_id = p_boost_id AND status IN ('pending','verified') FOR UPDATE;
  IF FOUND THEN
    IF v_payment.status = 'pending' AND v_payment.reference = v_reference
      AND v_payment.receipt_path = p_receipt_path THEN RETURN v_payment; END IF;
    RAISE EXCEPTION 'An open payment already exists for this boost' USING ERRCODE = 'M4090';
  END IF;
  IF EXISTS (SELECT 1 FROM public.boost_payment
    WHERE receipt_path = p_receipt_path) THEN
    RAISE EXCEPTION 'Receipt evidence is already submitted' USING ERRCODE = 'M4090';
  END IF;
  IF EXISTS (SELECT 1 FROM public.boost_payment
    WHERE lower(reference) = lower(v_reference) AND status IN ('pending','verified')) THEN
    RAISE EXCEPTION 'Transaction reference is already claimed' USING ERRCODE = 'M4090';
  END IF;

  SELECT * INTO v_plan FROM public.boosting_plan
    WHERE boosting_plan_id = v_boost.boosting_plan_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Boosting plan not found' USING ERRCODE = 'M4041'; END IF;
  IF v_plan.currency IS NULL OR v_plan.price <= 0 OR v_plan.price <> round(v_plan.price, 2)
    OR v_plan.duration_days <= 0 THEN
    RAISE EXCEPTION 'Boosting plan price, currency or duration needs configuration' USING ERRCODE = 'M4092';
  END IF;
  IF v_boost.amount_due IS NOT NULL AND
    (v_boost.amount_due <> v_plan.price OR v_boost.currency IS DISTINCT FROM v_plan.currency
      OR v_boost.duration_days IS DISTINCT FROM v_plan.duration_days) THEN
    RAISE EXCEPTION 'Boost quote no longer matches its plan' USING ERRCODE = 'M4092';
  END IF;
  IF v_boost.amount_due IS NULL THEN
    UPDATE public.property_boosting SET amount_due = v_plan.price,
      currency = v_plan.currency, duration_days = v_plan.duration_days
      WHERE property_boosting_id = p_boost_id;
  END IF;
  INSERT INTO public.boost_payment
    (property_boosting_id, submitted_by, reference, amount, currency, receipt_path)
  VALUES (p_boost_id, auth.uid(), v_reference, v_plan.price, v_plan.currency, p_receipt_path)
  RETURNING * INTO v_payment;
  RETURN v_payment;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_host_boost_payment(uuid,text,text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_host_boost_payment(uuid,text,text)
  TO authenticated;
