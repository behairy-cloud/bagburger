-- Customer checkout was hitting 401 "new row violates row-level security
-- policy for table orders" on every insert, even with a fully valid payload
-- that satisfies orders_insert_customer's WITH CHECK. Root cause: PostgREST's
-- native POST /rest/v1/orders endpoint always executes the insert with a
-- RETURNING clause (regardless of the Prefer header), and reading that
-- clause back is itself subject to RLS SELECT policies. anon has no SELECT
-- policy on orders by design (customers must never read other customers'
-- orders), so the RETURNING read-back is denied and Postgres reports it as
-- the same generic RLS violation as the insert itself.
--
-- Fix: give customers a narrow RPC to create an order instead of hitting the
-- table endpoint directly. It's SECURITY INVOKER, so the existing
-- orders_insert_customer policy (and all CHECK constraints) still govern
-- what's allowed - this only changes how the insert is issued, not what's
-- permitted. status and screenshot_path are fixed server-side, so customers
-- can't set either through this path.

create or replace function public.create_order(
  p_id text,
  p_customer_name text,
  p_phone text,
  p_address text,
  p_notes text,
  p_items jsonb,
  p_total integer
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  insert into public.orders (id, customer_name, phone, address, notes, items, screenshot_path, total, status)
  values (
    p_id,
    p_customer_name,
    p_phone,
    p_address,
    coalesce(p_notes, ''),
    coalesce(p_items, '[]'::jsonb),
    '',
    p_total,
    'جديد'
  );
end;
$$;

grant execute on function public.create_order(text, text, text, text, text, jsonb, integer) to anon, authenticated;
