CREATE TYPE public.user_role AS ENUM ('user', 'admin');
CREATE TYPE public.property_approval_status AS ENUM ('pending', 'approved', 'rejected');

ALTER TABLE public."user"
  ADD COLUMN role public.user_role NOT NULL DEFAULT 'user';

ALTER TABLE public.property
  ADD COLUMN approval_status public.property_approval_status NOT NULL DEFAULT 'pending';

ALTER TABLE public.property_boosting
  ALTER COLUMN status SET DEFAULT 'pending'::public.boosting_status,
  ALTER COLUMN start_date DROP NOT NULL,
  ALTER COLUMN end_date DROP NOT NULL,
  DROP CONSTRAINT property_boosting_property_id_key;

-- Keep historical expired boosts, but only one pending or active boost per property.
CREATE UNIQUE INDEX property_boosting_one_current_per_property_idx
  ON public.property_boosting (property_id)
  WHERE status IN ('pending', 'active');

ALTER TABLE public.property_boosting
  ADD CONSTRAINT property_boosting_lifecycle_check CHECK (
    (status = 'pending' AND is_paid = false AND start_date IS NULL AND end_date IS NULL)
    OR
    (status IN ('active', 'expired') AND is_paid = true
      AND start_date IS NOT NULL AND end_date IS NOT NULL
      AND end_date > start_date)
  );

-- RLS limits which rows a caller may touch; column grants limit what may change.
-- Signup and Auth email-sync triggers run as their privileged function owner.
REVOKE INSERT, UPDATE ON TABLE public."user" FROM PUBLIC, anon, authenticated;
GRANT UPDATE (firstname, lastname, phone) ON TABLE public."user" TO authenticated;

REVOKE INSERT, UPDATE ON TABLE public.property FROM PUBLIC, anon, authenticated;
GRANT INSERT (
  host_id, property_type, title, description, address, latitude, longitude,
  price, bedrooms, bathrooms, bed_count, furnished, electricity_included,
  kitchen_type, bathroom_type, gender
) ON TABLE public.property TO authenticated;
GRANT UPDATE (
  property_type, title, description, address, latitude, longitude,
  price, bedrooms, bathrooms, bed_count, furnished, electricity_included,
  kitchen_type, bathroom_type, gender
) ON TABLE public.property TO authenticated;

REVOKE INSERT, UPDATE ON TABLE public.property_boosting FROM PUBLIC, anon, authenticated;
GRANT INSERT (property_id, boosting_plan_id)
  ON TABLE public.property_boosting TO authenticated;

-- A direct Host insert must create only an unpaid, unscheduled request.
ALTER POLICY "Hosts can create boosts for their properties"
  ON public.property_boosting
  WITH CHECK (
    public.is_property_owner(property_id)
    AND is_paid = false
    AND status = 'pending'
    AND start_date IS NULL
    AND end_date IS NULL
  );

-- The old owner UPDATE policy would imply an ability that column grants now deny.
DROP POLICY "Hosts can update their property boosts" ON public.property_boosting;
