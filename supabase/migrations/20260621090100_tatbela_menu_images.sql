-- Menu image storage for Tatbela
-- Adds the bucket used by the admin menu image picker.

create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public)
values ('menu-item-images', 'menu-item-images', true)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public;

-- storage.objects already has RLS enabled by Supabase; altering it here
-- fails with a permission error since the SQL Editor role doesn't own it.
drop policy if exists "menu_item_images_public_read" on storage.objects;
create policy "menu_item_images_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'menu-item-images');

drop policy if exists "menu_item_images_admin_insert" on storage.objects;
create policy "menu_item_images_admin_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'menu-item-images'
  and public.is_admin_user()
);

drop policy if exists "menu_item_images_admin_update" on storage.objects;
create policy "menu_item_images_admin_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'menu-item-images'
  and public.is_admin_user()
)
with check (
  bucket_id = 'menu-item-images'
  and public.is_admin_user()
);

drop policy if exists "menu_item_images_admin_delete" on storage.objects;
create policy "menu_item_images_admin_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'menu-item-images'
  and public.is_admin_user()
);
