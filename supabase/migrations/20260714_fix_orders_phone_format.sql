-- The original orders_phone_format constraint enforced an Egyptian mobile
-- number pattern (01[0125]XXXXXXXX), inherited from an earlier menu template.
-- SIDE BURGER operates in Saudi Arabia (SAR pricing, +966 WhatsApp number),
-- so valid customer numbers are Saudi mobile numbers (05XXXXXXXX).

alter table public.orders
  drop constraint if exists orders_phone_format;

alter table public.orders
  add constraint orders_phone_format check (phone ~ '^05[0-9]{8}$');
