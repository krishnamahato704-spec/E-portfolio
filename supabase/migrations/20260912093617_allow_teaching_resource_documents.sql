update storage.buckets
set allowed_mime_types = array[
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/webp'
]::text[]
where id = 'portfolio-media';

alter policy "Portfolio owner can upload evidence"
on storage.objects
with check (
  bucket_id = 'portfolio-media'
  and (select auth.uid()) = 'a8557da7-eeb5-47c8-93c6-b43e4ffa0106'::uuid
);

alter policy "Portfolio owner can update evidence"
on storage.objects
using (
  bucket_id = 'portfolio-media'
  and (select auth.uid()) = 'a8557da7-eeb5-47c8-93c6-b43e4ffa0106'::uuid
)
with check (
  bucket_id = 'portfolio-media'
  and (select auth.uid()) = 'a8557da7-eeb5-47c8-93c6-b43e4ffa0106'::uuid
);

alter policy "Portfolio owner can delete evidence"
on storage.objects
using (
  bucket_id = 'portfolio-media'
  and (
    owner_id = (select auth.uid()::text)
    or (select auth.uid()) = 'a8557da7-eeb5-47c8-93c6-b43e4ffa0106'::uuid
  )
);
