insert into storage.buckets (id, name, public) values ('portfolio-media', 'portfolio-media', true) on conflict (id) do update set public = true;

create policy "Portfolio media public read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'portfolio-media');

create policy "Portfolio media public upload"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'portfolio-media');

create policy "Portfolio media public update"
on storage.objects for update
to anon, authenticated
using (bucket_id = 'portfolio-media')
with check (bucket_id = 'portfolio-media');

create policy "Portfolio media public delete"
on storage.objects for delete
to anon, authenticated
using (bucket_id = 'portfolio-media');
