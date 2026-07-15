-- Bag Burger orders schema + security hardening
-- Apply this in Supabase after creating the project.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  );
$$;

create table if not exists public.orders (
  id text primary key,
  customer_name text not null,
  phone text not null,
  address text not null,
  notes text not null default '',
  items jsonb not null default '[]'::jsonb,
  screenshot_path text not null,
  total integer not null check (total > 0),
  status text not null default 'جديد',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_customer_name_len check (char_length(trim(customer_name)) between 2 and 120),
  constraint orders_phone_format check (phone ~ '^01[0125][0-9]{8}$'),
  constraint orders_address_len check (char_length(trim(address)) >= 8),
  constraint orders_notes_len check (char_length(notes) <= 500),
  constraint orders_status_check check (
    status in ('جديد', 'تم التأكيد', 'جاري التحضير', 'تم التوصيل', 'ملغي')
  )
);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'id'
      and data_type = 'uuid'
  ) then
    alter table public.orders alter column id drop default;
    alter table public.orders alter column id type text using id::text;
  end if;
end $$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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
  and screenshot_path is not null
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

insert into storage.buckets (id, name, public)
values ('order-screenshots', 'order-screenshots', false)
on conflict (id) do update
set public = excluded.public;

revoke all on storage.objects from public;
revoke all on storage.objects from authenticated;

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
