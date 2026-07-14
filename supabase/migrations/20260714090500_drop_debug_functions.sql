-- Temporary functions created while diagnosing the checkout RLS bug.
-- No longer needed now that customer order creation goes through
-- create_order (see 20260714090400_orders_create_rpc.sql).

drop function if exists public.debug_whoami();
drop function if exists public.debug_try_insert();
