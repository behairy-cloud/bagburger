-- Customer checkout was failing with:
--   StorageApiError: new row violates row-level security policy
-- on every order-screenshot upload. That specific error means Postgres
-- found *no* matching INSERT policy at all for storage.objects (a missing
-- base privilege gives a different "permission denied" error).
--
-- The likely cause: in 20260621_tatbela_orders.sql, the storage policies
-- for the order-screenshots bucket are preceded by
--   revoke all on storage.objects from public;
--   revoke all on storage.objects from authenticated;
-- If that REVOKE failed for permission reasons when the migration was
-- originally run (common on hosted Supabase, since storage.objects isn't
-- owned by the SQL-editor role) and the script executed as one
-- transaction, everything after it -- including the four policies below
-- -- would have silently rolled back and never actually been created.
--
-- This migration re-creates just the essential bucket + policy state,
-- without the risky REVOKE step (RLS scoped `to anon, authenticated`
-- policies are sufficient on their own; the REVOKE was extra
-- defense-in-depth, not required for correctness).

insert into storage.buckets (id, name, public)
values ('order-screenshots', 'order-screenshots', false)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "screenshots_upload_customer" on storage.objects;
create policy "screenshots_upload_customer"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'order-screenshots');

drop policy if exists "screenshots_read_admin" on storage.objects;
create policy "screenshots_read_admin"
on storage.objects
for select
to authenticated
using (bucket_id = 'order-screenshots' and public.is_admin_user());

drop policy if exists "screenshots_update_admin" on storage.objects;
create policy "screenshots_update_admin"
on storage.objects
for update
to authenticated
using (bucket_id = 'order-screenshots' and public.is_admin_user())
with check (bucket_id = 'order-screenshots' and public.is_admin_user());

drop policy if exists "screenshots_delete_admin" on storage.objects;
create policy "screenshots_delete_admin"
on storage.objects
for delete
to authenticated
using (bucket_id = 'order-screenshots' and public.is_admin_user());
