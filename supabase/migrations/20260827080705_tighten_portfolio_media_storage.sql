update storage.buckets set public = true, file_size_limit = 10485760, allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'] where id = 'portfolio-media';

drop policy if exists "Portfolio media public update" on storage.objects;
drop policy if exists "Portfolio media public delete" on storage.objects;
