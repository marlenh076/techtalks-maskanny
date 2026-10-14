-- Media have no creation timestamp/order; UUID order cannot preserve a cover.
-- Existing listings retain their previous UUID ordering (all default to zero).
-- Host Create Property only: no Admin RPC, RLS, trigger or property changes.
ALTER TABLE public.media
  ADD COLUMN sort_order integer NOT NULL DEFAULT 0,
  ADD CONSTRAINT media_sort_order_range CHECK (sort_order >= 0 AND sort_order <= 6);

CREATE INDEX media_property_sort_order_idx
  ON public.media (property_id, sort_order, media_id);
