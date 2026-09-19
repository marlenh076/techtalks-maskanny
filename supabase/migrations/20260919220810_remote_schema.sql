CREATE TABLE "public"."boosting_plan" (
  "boosting_plan_id" uuid    NOT NULL DEFAULT gen_random_uuid(),
  "name"             text    NOT NULL,
  "duration_days"    integer NOT NULL,
  "price"            numeric NOT NULL,
  "max_images"       integer NOT NULL,
  "video_enabled"    boolean NOT NULL DEFAULT false,
  "top_placement"    boolean NOT NULL DEFAULT false,
  CONSTRAINT "boosting_plan_name_key" UNIQUE (name),
  CONSTRAINT "boosting_plan_pkey" PRIMARY KEY (boosting_plan_id)
);

ALTER TABLE "public"."boosting_plan"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."host" (
  "host_id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  CONSTRAINT "host_pkey" PRIMARY KEY (host_id),
  CONSTRAINT "host_user_id_key" UNIQUE (user_id)
);

ALTER TABLE "public"."host"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."media" (
  "media_id"    uuid NOT NULL DEFAULT gen_random_uuid(),
  "property_id" uuid NOT NULL,
  "url"         text NOT NULL,
  CONSTRAINT "media_pkey" PRIMARY KEY (media_id)
);

ALTER TABLE "public"."media"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."property_boosting" (
  "property_boosting_id" uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "property_id"          uuid                     NOT NULL,
  "boosting_plan_id"     uuid                     NOT NULL,
  "is_paid"              boolean                  NOT NULL DEFAULT false,
  "start_date"           timestamp with time zone NOT NULL,
  "end_date"             timestamp with time zone NOT NULL,
  CONSTRAINT "property_boosting_pkey" PRIMARY KEY (property_boosting_id),
  CONSTRAINT "property_boosting_property_id_key" UNIQUE (property_id)
);

ALTER TABLE "public"."property_boosting"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."property_university" (
  "property_id"   uuid NOT NULL,
  "university_id" uuid NOT NULL,
  CONSTRAINT "property_university_pkey" PRIMARY KEY (property_id, university_id)
);

ALTER TABLE "public"."property_university"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."property" (
  "property_id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "host_id"              uuid                     NOT NULL,
  "title"                text                     NOT NULL,
  "description"          text,
  "address"              text                     NOT NULL,
  "lattitude"            numeric                  NOT NULL,
  "longtitude"           numeric                  NOT NULL,
  "price"                numeric                  NOT NULL,
  "bedrooms"             integer                  NOT NULL,
  "bathrooms"            integer                  NOT NULL,
  "bed_counts"           integer                  NOT NULL,
  "furnished"            boolean                  NOT NULL,
  "electricity_included" boolean                  NOT NULL,
  "created_at"           timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "property_pkey" PRIMARY KEY (property_id)
);

ALTER TABLE "public"."property"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."university" (
  "university_id" uuid    NOT NULL DEFAULT gen_random_uuid(),
  "name"          text    NOT NULL,
  "latitude"      numeric NOT NULL,
  "longitude"     numeric NOT NULL,
  "city"          text    NOT NULL,
  CONSTRAINT "university_name_key" UNIQUE (name),
  CONSTRAINT "university_pkey" PRIMARY KEY (university_id)
);

ALTER TABLE "public"."university"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."user" (
  "user_id"    uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "firstname"  text                     NOT NULL,
  "lastname"   text                     NOT NULL,
  "phone"      text                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "email"      text                     NOT NULL,
  CONSTRAINT "user_email_key" UNIQUE (email),
  CONSTRAINT "user_pkey" PRIMARY KEY (user_id)
);

ALTER TABLE "public"."user"
  ENABLE ROW LEVEL SECURITY;

CREATE TYPE "public"."bathroom_type" AS ENUM (
  'private',
  'shared'
);

ALTER TABLE "public"."property"
  ADD COLUMN "bathroom_type" public.bathroom_type NOT NULL;

CREATE TYPE "public"."boosting_status" AS ENUM (
  'active',
  'expired'
);

ALTER TABLE "public"."property_boosting"
  ADD COLUMN "status" public.boosting_status NOT NULL DEFAULT 'active'::public.boosting_status;

CREATE TYPE "public"."gender" AS ENUM (
  'boys',
  'girls',
  'mixed'
);

ALTER TABLE "public"."property"
  ADD COLUMN "gender" public.gender NOT NULL;

CREATE TYPE "public"."kitchen_type" AS ENUM (
  'private',
  'shared'
);

ALTER TABLE "public"."property"
  ADD COLUMN "kitchen_type" public.kitchen_type NOT NULL;

CREATE TYPE "public"."media_type" AS ENUM (
  'image',
  'video'
);

ALTER TABLE "public"."media"
  ADD COLUMN "type" public.media_type NOT NULL;

CREATE TYPE "public"."property_type" AS ENUM (
  'dorm',
  'studio',
  'apartment'
);

ALTER TABLE "public"."property"
  ADD COLUMN "property_type" public.property_type NOT NULL;

ALTER TABLE "public"."property"
  ADD CONSTRAINT "property_host_id_fkey" FOREIGN KEY (host_id) REFERENCES public.host(host_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."media"
  ADD CONSTRAINT "media_property_id_fkey" FOREIGN KEY (property_id) REFERENCES public.property(property_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."property_boosting"
  ADD CONSTRAINT "fk_property_boosting_plan" FOREIGN KEY (boosting_plan_id) REFERENCES public.boosting_plan(boosting_plan_id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE "public"."property_boosting"
  ADD CONSTRAINT "fk_property_boosting_property" FOREIGN KEY (property_id) REFERENCES public.property(property_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."property_university"
  ADD CONSTRAINT "fk_property_university_property" FOREIGN KEY (property_id) REFERENCES public.property(property_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."property_university"
  ADD CONSTRAINT "fk_property_university_university" FOREIGN KEY (university_id) REFERENCES public.university(university_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."host"
  ADD CONSTRAINT "host_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(user_id) ON UPDATE CASCADE ON DELETE CASCADE;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."boosting_plan" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."host" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."media" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."property" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."property_boosting" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."property_university" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."university" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."user" TO "anon", "authenticated", "postgres", "service_role";

GRANT USAGE ON TYPE "public"."bathroom_type" TO "postgres";

GRANT USAGE ON TYPE "public"."boosting_status" TO "postgres";

GRANT USAGE ON TYPE "public"."gender" TO "postgres";

GRANT USAGE ON TYPE "public"."kitchen_type" TO "postgres";

GRANT USAGE ON TYPE "public"."media_type" TO "postgres";

GRANT USAGE ON TYPE "public"."property_type" TO "postgres";

