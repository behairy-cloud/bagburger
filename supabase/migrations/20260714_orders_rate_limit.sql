-- Basic anti-spam protection for the public order-insert endpoint.
-- The orders_insert_customer RLS policy lets any anon visitor insert orders,
-- with no rate limiting — a scripted client could spam the orders table.
-- This trigger blocks a phone number from placing more than 3 orders inside
-- a rolling 10-minute window, enforced at the database level regardless of
-- which client (or bypassing script) makes the request.

create or replace function public.enforce_order_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count integer;
begin
  select count(*) into recent_count
  from public.orders
  where phone = new.phone
    and created_at > now() - interval '10 minutes';

  if recent_count >= 3 then
    raise exception 'تم إرسال عدة طلبات من نفس الرقم مؤخراً. برجاء الانتظار قليلاً ثم إعادة المحاولة.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists orders_rate_limit on public.orders;
create trigger orders_rate_limit
before insert on public.orders
for each row
execute function public.enforce_order_rate_limit();
