UPDATE storage.buckets
SET public = true
WHERE id = 'properties-media'
  AND public IS DISTINCT FROM true;
