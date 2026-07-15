-- Order submission was failing with:
--   {"code":"42501", message":"new row violates row-level security policy
--   for table \"orders\""}
-- This is the same root cause already found and fixed for the
-- order-screenshots storage bucket: 20260621_bagburger_orders.sql runs the
-- orders table setup and its four RLS policies *before* two `revoke all`
-- statements further down the same file (for storage.objects). If that
-- REVOKE failed when the migration first ran - plausible, since
-- storage.objects isn't owned by the SQL-editor role - and the whole
-- script executed as one transaction, everything above it, including the
-- orders table's RLS policies, would have silently rolled back too.
--
-- This migration re-creates just the orders table + its RLS policies in
-- isolation, with no risky statements alongside them.

create table if not exists public.orders (
  id text primary key,
  customer_name text not null,
  phone text not null,
  address text not null,
  notes text not null default '',
  items jsonb not null default '[]'::jsonb,
  screenshot_path text not null default '',
  total integer not null check (total > 0),
  status text not null default 'جديد',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_customer_name_len check (char_length(trim(customer_name)) between 2 and 120),
  constraint orders_phone_format check (phone ~ '^05[0-9]{8}$'),
  constraint orders_address_len check (char_length(trim(address)) >= 8),
  constraint orders_notes_len check (char_length(notes) <= 500),
  constraint orders_status_check check (
    status in ('جديد', 'تم التأكيد', 'جاري التحضير', 'تم التوصيل', 'ملغي')
  )
);

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
before update on public.orders
for each row
execute function public.touch_updated_at();

alter table public.orders enable row level security;

drop policy if exists "orders_insert_customer" on public.orders;
create policy "orders_insert_customer"
on public.orders
for insert
to anon, authenticated
with check (
  customer_name is not null
  and phone is not null
  and address is not null
  and total > 0
  and status = 'جديد'
);

drop policy if exists "orders_select_admin" on public.orders;
create policy "orders_select_admin"
on public.orders
for select
to authenticated
using (public.is_admin_user());

drop policy if exists "orders_update_admin" on public.orders;
create policy "orders_update_admin"
on public.orders
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "orders_delete_admin" on public.orders;
create policy "orders_delete_admin"
on public.orders
for delete
to authenticated
using (public.is_admin_user());
