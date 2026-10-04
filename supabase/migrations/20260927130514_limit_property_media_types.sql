INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
VALUES (
  'properties-media',
  'properties-media',
  true,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE
  SET allowed_mime_types = EXCLUDED.allowed_mime_types;
