INSERT INTO storage.buckets (
  id,
  name,
  public
)
VALUES (
  'properties-media',
  'properties-media',
  true
)
ON CONFLICT (id) DO NOTHING;