SET local check_function_bodies = off;

ALTER TABLE "public"."property"
  DROP COLUMN "bed_counts";

ALTER TABLE "public"."property"
  DROP COLUMN "lattitude";

ALTER TABLE "public"."property"
  DROP COLUMN "longtitude";

ALTER TABLE "public"."property"
  ADD COLUMN "latitude" numeric NOT NULL;

ALTER TABLE "public"."property"
  ADD COLUMN "longitude" numeric NOT NULL;

ALTER TABLE "public"."property"
  ADD COLUMN "bed_count" integer NOT NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
BEGIN
  INSERT INTO public."user" (
    user_id,
    firstname,
    lastname,
    email,
    phone
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'firstname',
    NEW.raw_user_meta_data->>'lastname',
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  );

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_property_owner (
  property_uuid uuid
)
  RETURNS boolean
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM property p
    JOIN host h ON h.host_id = p.host_id
    WHERE p.property_id = property_uuid
      AND h.user_id = auth.uid()
  );
$function$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "Anyone can view boosting plans" ON "public"."boosting_plan"
  FOR SELECT
  TO "anon"
  USING (true);

CREATE POLICY "Hosts can read their own host record" ON "public"."host"
  FOR SELECT
  TO "authenticated"
  USING ((user_id = auth.uid()));

CREATE POLICY "Users can become hosts" ON "public"."host"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "Anyone can view property media" ON "public"."media"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Hosts can create property media" ON "public"."media"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.property p
     JOIN public.host h ON ((h.host_id = p.host_id)))
  WHERE ((p.property_id = media.property_id) AND (h.user_id = auth.uid())))));

CREATE POLICY "Hosts can delete property media" ON "public"."media"
  FOR DELETE
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM (public.property p
     JOIN public.host h ON ((h.host_id = p.host_id)))
  WHERE ((p.property_id = media.property_id) AND (h.user_id = auth.uid())))));

CREATE POLICY "Hosts can update property media" ON "public"."media"
  FOR UPDATE
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM (public.property p
     JOIN public.host h ON ((h.host_id = p.host_id)))
  WHERE ((p.property_id = media.property_id) AND (h.user_id = auth.uid())))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.property p
     JOIN public.host h ON ((h.host_id = p.host_id)))
  WHERE ((p.property_id = media.property_id) AND (h.user_id = auth.uid())))));

CREATE POLICY "Anyone can read properties" ON "public"."property"
  FOR SELECT
  TO "anon", "authenticated"
  USING (true);

CREATE POLICY "Hosts can create their own properties" ON "public"."property"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((host_id IN ( SELECT host.host_id
   FROM public.host
  WHERE (host.user_id = auth.uid()))));

CREATE POLICY "Hosts can delete their own properties" ON "public"."property"
  FOR DELETE
  TO "authenticated"
  USING ((host_id IN ( SELECT host.host_id
   FROM public.host
  WHERE (host.user_id = auth.uid()))));

CREATE POLICY "Hosts can update their own properties" ON "public"."property"
  FOR UPDATE
  TO "authenticated"
  USING ((host_id IN ( SELECT host.host_id
   FROM public.host
  WHERE (host.user_id = auth.uid()))))
  WITH CHECK ((host_id IN ( SELECT host.host_id
   FROM public.host
  WHERE (host.user_id = auth.uid()))));

CREATE POLICY "Hosts can create boosts for their properties" ON "public"."property_boosting"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (public.is_property_owner(property_id));

CREATE POLICY "Hosts can delete their property boosts" ON "public"."property_boosting"
  FOR DELETE
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM (public.property p
     JOIN public.host h ON ((h.host_id = p.host_id)))
  WHERE ((p.property_id = property_boosting.property_id) AND (h.user_id = auth.uid())))));

CREATE POLICY "Hosts can update their property boosts" ON "public"."property_boosting"
  FOR UPDATE
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM (public.property p
     JOIN public.host h ON ((h.host_id = p.host_id)))
  WHERE ((p.property_id = property_boosting.property_id) AND (h.user_id = auth.uid())))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.property p
     JOIN public.host h ON ((h.host_id = p.host_id)))
  WHERE ((p.property_id = property_boosting.property_id) AND (h.user_id = auth.uid())))));

CREATE POLICY "Hosts can view their property boosts" ON "public"."property_boosting"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM (public.property p
     JOIN public.host h ON ((h.host_id = p.host_id)))
  WHERE ((p.property_id = property_boosting.property_id) AND (h.user_id = auth.uid())))));

CREATE POLICY "Anyone can view property universities" ON "public"."property_university"
  FOR SELECT
  TO "anon"
  USING (true);

CREATE POLICY "Anyone can read universities" ON "public"."university"
  FOR SELECT
  TO "anon"
  USING (true);

CREATE POLICY "Users can update their own profile" ON "public"."user"
  FOR UPDATE
  TO "authenticated"
  USING ((user_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "Users can view their own profile" ON "public"."user"
  FOR SELECT
  TO "authenticated"
  USING ((user_id = auth.uid()));

CREATE POLICY "Anyone can view property media" ON "storage"."objects"
  FOR SELECT
  TO PUBLIC
  USING ((bucket_id = 'properties-media'::text));

CREATE POLICY "Hosts can delete property media" ON "storage"."objects"
  FOR DELETE
  TO "authenticated"
  USING (((bucket_id = 'properties-media'::text) AND (EXISTS ( SELECT 1
   FROM (public.property p
     JOIN public.host h ON ((h.host_id = p.host_id)))
  WHERE (((p.property_id)::text = (storage.foldername(objects.name))[1]) AND (h.user_id = auth.uid()))))));

CREATE POLICY "Hosts can update property media" ON "storage"."objects"
  FOR UPDATE
  TO "authenticated"
  USING (((bucket_id = 'properties-media'::text) AND (EXISTS ( SELECT 1
   FROM (public.property p
     JOIN public.host h ON ((h.host_id = p.host_id)))
  WHERE (((p.property_id)::text = (storage.foldername(objects.name))[1]) AND (h.user_id = auth.uid()))))));

CREATE POLICY "Hosts can upload property media" ON "storage"."objects"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((bucket_id = 'properties-media'::text) AND (EXISTS ( SELECT 1
   FROM (public.property p
     JOIN public.host h ON ((h.host_id = p.host_id)))
  WHERE (((p.property_id)::text = (storage.foldername(objects.name))[1]) AND (h.user_id = auth.uid()))))));

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."is_property_owner"(uuid) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

