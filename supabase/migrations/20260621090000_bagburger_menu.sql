-- Bag Burger menu catalog schema + seed
-- Apply this after the orders migration so admin helpers already exist.

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

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.menu_items (
  id text primary key,
  category_key text not null,
  name text not null,
  note text not null default '',
  price integer not null check (price > 0),
  image_path text not null default '',
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint menu_items_name_len check (char_length(trim(name)) between 2 and 120),
  constraint menu_items_note_len check (char_length(note) <= 120),
  constraint menu_items_category_len check (char_length(trim(category_key)) between 2 and 40)
);

create index if not exists menu_items_visible_sort_idx
  on public.menu_items (is_visible desc, sort_order asc, created_at asc);

drop trigger if exists menu_items_touch_updated_at on public.menu_items;
create trigger menu_items_touch_updated_at
before update on public.menu_items
for each row
execute function public.touch_updated_at();

alter table public.menu_items enable row level security;

drop policy if exists "menu_items_select_public" on public.menu_items;
create policy "menu_items_select_public"
on public.menu_items
for select
to anon, authenticated
using (is_visible = true);

drop policy if exists "menu_items_insert_admin" on public.menu_items;
create policy "menu_items_insert_admin"
on public.menu_items
for insert
to authenticated
with check (public.is_admin_user());

drop policy if exists "menu_items_update_admin" on public.menu_items;
create policy "menu_items_update_admin"
on public.menu_items
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "menu_items_delete_admin" on public.menu_items;
create policy "menu_items_delete_admin"
on public.menu_items
for delete
to authenticated
using (public.is_admin_user());

insert into public.menu_items (id, category_key, name, note, price, image_path, is_visible, sort_order)
select id, category_key, name, note, price, image_path, is_visible, sort_order
from jsonb_to_recordset('[{"id":"p1","category_key":"shawarma","name":"شاورما فراخ","note":"1 كيلو","price":245,"image_path":"/bagburgermenu/%D9%81%D8%A7%D9%87%D9%8A%D8%AA%D8%A7.jpg","is_visible":true,"sort_order":0},{"id":"p2","category_key":"shawarma","name":"فاهيتا فراخ","note":"1 كيلو","price":245,"image_path":"/bagburgermenu/%D9%81%D8%A7%D9%87%D9%8A%D8%AA%D8%A7.jpg","is_visible":true,"sort_order":1},{"id":"p3","category_key":"shawarma","name":"استراجانوف فراخ","note":"1 كيلو","price":245,"image_path":"/bagburgermenu/%D8%A7%D8%B3%D8%AA%D8%B1%D8%A7%D8%AC%D8%A7%D9%86%D9%88%D9%81.jpg","is_visible":true,"sort_order":2},{"id":"p4","category_key":"shawarma","name":"ستريبس فراخ","note":"1 كيلو","price":245,"image_path":"/bagburgermenu/%D9%81%D9%8A%D9%86%D8%AC%D8%B1%D8%B2.jpg","is_visible":true,"sort_order":3},{"id":"p5","category_key":"shawarma","name":"كسادي فراخ","note":"1 كيلو","price":245,"image_path":"/bagburgermenu/%D9%83%D8%A7%D8%B3%D8%A7%D8%AF%D9%8A%D8%A7.jpg","is_visible":true,"sort_order":4},{"id":"p6","category_key":"shish","name":"شيش جريل","note":"1 كيلو","price":240,"image_path":"/bagburgermenu/%D8%B4%D9%8A%D8%B4%20%D8%B7%D8%A7%D9%88%D9%88%D9%82.jpg","is_visible":true,"sort_order":5},{"id":"p7","category_key":"shish","name":"شيش جريل باربيكيو","note":"1 كيلو","price":240,"image_path":"/bagburgermenu/%D8%B4%D9%8A%D8%B4%20%D8%B7%D8%A7%D9%88%D9%88%D9%82.jpg","is_visible":true,"sort_order":6},{"id":"p8","category_key":"shish","name":"شيش جريل دبس رمان","note":"1 كيلو","price":240,"image_path":"/bagburgermenu/%D8%B4%D9%8A%D8%B4%20%D8%B7%D8%A7%D9%88%D9%88%D9%82.jpg","is_visible":true,"sort_order":7},{"id":"p9","category_key":"shish","name":"شيش جريل كباب","note":"1 كيلو","price":240,"image_path":"/bagburgermenu/%D8%B4%D9%8A%D8%B4%20%D8%B7%D8%A7%D9%88%D9%88%D9%82.jpg","is_visible":true,"sort_order":8},{"id":"p10","category_key":"shish","name":"شيش طاووق","note":"1 كيلو","price":235,"image_path":"/bagburgermenu/%D8%B4%D9%8A%D8%B4%20%D8%B7%D8%A7%D9%88%D9%88%D9%82.jpg","is_visible":true,"sort_order":9},{"id":"p11","category_key":"grill","name":"فراخ شوي مشروم","note":"1 كيلو","price":230,"image_path":"/bagburgermenu/%D9%81%D8%B1%D8%A7%D8%AE%20%D8%B4%D9%88%D9%8A.jpg","is_visible":true,"sort_order":10},{"id":"p12","category_key":"grill","name":"فراخ شوي تندوري","note":"1 كيلو","price":230,"image_path":"/bagburgermenu/%D9%81%D8%B1%D8%A7%D8%AE%20%D8%B4%D9%88%D9%8A.jpg","is_visible":true,"sort_order":11},{"id":"p13","category_key":"grill","name":"فراخ شوي باربيكيو","note":"1 كيلو","price":230,"image_path":"/bagburgermenu/%D9%81%D8%B1%D8%A7%D8%AE%20%D8%B4%D9%88%D9%8A%20%D8%A8%D8%A7%D8%B1%D8%A8%D9%83%D9%8A%D9%88.jpg","is_visible":true,"sort_order":12},{"id":"p14","category_key":"grill","name":"فراخ شوي دبس رمان","note":"1 كيلو","price":230,"image_path":"/bagburgermenu/%D9%81%D8%B1%D8%A7%D8%AE%20%D8%B4%D9%88%D9%8A.jpg","is_visible":true,"sort_order":13},{"id":"p15","category_key":"grill","name":"فراخ شوي كباب","note":"1 كيلو","price":230,"image_path":"/bagburgermenu/%D9%81%D8%B1%D8%A7%D8%AE%20%D8%B4%D9%88%D9%8A.jpg","is_visible":true,"sort_order":14},{"id":"p16","category_key":"grill","name":"وراك شوي","note":"3 قطع","price":235,"image_path":"/bagburgermenu/%D9%88%D8%B1%D8%A7%D9%83%20%D8%B4%D9%88%D9%8A.jpg","is_visible":true,"sort_order":15},{"id":"p17","category_key":"grill","name":"وراك شوي باربيكيو","note":"3 قطع","price":235,"image_path":"/bagburgermenu/%D9%88%D8%B1%D8%A7%D9%83%20%D8%A8%D8%A7%D8%B1%D8%A8%D9%83%D9%8A%D9%88.jpg","is_visible":true,"sort_order":16},{"id":"p18","category_key":"grill","name":"وراك شوي كباب","note":"3 قطع","price":235,"image_path":"/bagburgermenu/%D9%88%D8%B1%D8%A7%D9%83%20%D8%B4%D9%88%D9%8A.jpg","is_visible":true,"sort_order":17},{"id":"p19","category_key":"grill","name":"وراك شوي مشروم","note":"3 قطع","price":235,"image_path":"/bagburgermenu/%D9%88%D8%B1%D8%A7%D9%83%20%D8%B4%D9%88%D9%8A.jpg","is_visible":true,"sort_order":18},{"id":"p20","category_key":"grill","name":"وراك شوي تندوري","note":"3 قطع","price":235,"image_path":"/bagburgermenu/%D9%88%D8%B1%D8%A7%D9%83%20%D8%B4%D9%88%D9%8A.jpg","is_visible":true,"sort_order":19},{"id":"p21","category_key":"wings","name":"أجنحة شوي","note":"1 كيلو","price":110,"image_path":"/bagburgermenu/%D8%A7%D8%AC%D9%86%D8%AD%D8%A9%20%D8%B4%D9%88%D9%8A.jpg","is_visible":true,"sort_order":20},{"id":"p22","category_key":"wings","name":"أجنحة شوي باربيكيو","note":"1 كيلو","price":110,"image_path":"/bagburgermenu/%D8%A7%D8%AC%D9%86%D8%AD%D8%A9%20%D8%B4%D9%88%D9%8A.jpg","is_visible":true,"sort_order":21},{"id":"p23","category_key":"wings","name":"أجنحة شوي دبس رمان","note":"1 كيلو","price":110,"image_path":"/bagburgermenu/%D8%A7%D8%AC%D9%86%D8%AD%D8%A9%20%D8%B4%D9%88%D9%8A.jpg","is_visible":true,"sort_order":22},{"id":"p24","category_key":"panefry","name":"بانيه قلي","note":"1 كيلو","price":230,"image_path":"/bagburgermenu/%D8%A8%D8%A7%D9%86%D9%8A%D9%87%20%D9%82%D9%84%D9%8A.jpg","is_visible":true,"sort_order":23},{"id":"p25","category_key":"panefry","name":"بانيه قلي شيدر","note":"1 كيلو","price":230,"image_path":"/bagburgermenu/%D8%A8%D8%A7%D9%86%D9%8A%D9%87%20%D9%82%D9%84%D9%8A.jpg","is_visible":true,"sort_order":24},{"id":"p26","category_key":"panefry","name":"بانيه قلي ذرة أصفر","note":"1 كيلو","price":230,"image_path":"/bagburgermenu/%D8%A8%D8%A7%D9%86%D9%8A%D9%87%20%D9%82%D9%84%D9%8A.jpg","is_visible":true,"sort_order":25},{"id":"p27","category_key":"panefry","name":"بانيه قلي كريسبي","note":"1 كيلو","price":230,"image_path":"/bagburgermenu/%D8%A8%D8%A7%D9%86%D9%8A%D9%87%20%D9%82%D9%84%D9%8A.jpg","is_visible":true,"sort_order":26},{"id":"p28","category_key":"panefry","name":"كوردون بلو","note":"5 قطع","price":230,"image_path":"/bagburgermenu/%D9%83%D9%88%D8%B1%D8%AF%D9%86%20%D8%A8%D9%84%D9%88.jpg","is_visible":true,"sort_order":27},{"id":"p29","category_key":"panefry","name":"كوردون بلو بسطرمة","note":"5 قطع","price":230,"image_path":"/bagburgermenu/%D9%83%D9%88%D8%B1%D8%AF%D9%86%20%D8%A8%D9%84%D9%88%20%D9%85%D9%8A%D9%83%D8%B3.jpg","is_visible":true,"sort_order":28},{"id":"p30","category_key":"panefry","name":"فينجرز","note":"1 كيلو","price":240,"image_path":"/bagburgermenu/%D8%A8%D8%A7%D9%86%D9%8A%D9%87%20%D9%82%D9%84%D9%8A.jpg","is_visible":true,"sort_order":29},{"id":"p31","category_key":"panegrill","name":"بانيه شوي","note":"1 كيلو","price":245,"image_path":"/bagburgermenu/%D8%A8%D8%A7%D9%86%D9%8A%D9%87%20%D8%B4%D9%88%D9%8A.jpg","is_visible":true,"sort_order":30},{"id":"p32","category_key":"panegrill","name":"بانيه شوي باربيكيو","note":"1 كيلو","price":245,"image_path":"/bagburgermenu/%D8%A8%D8%A7%D9%86%D9%8A%D9%87%20%D8%B4%D9%88%D9%8A%20%D8%A8%D8%A7%D8%B1%D8%A8%D9%83%D9%8A%D9%88.jpg","is_visible":true,"sort_order":31},{"id":"p33","category_key":"panegrill","name":"بانيه شوي كاري","note":"1 كيلو","price":245,"image_path":"/bagburgermenu/%D8%A8%D8%A7%D9%86%D9%8A%D9%87%20%D8%B4%D9%88%D9%8A.jpg","is_visible":true,"sort_order":32},{"id":"p34","category_key":"panegrill","name":"بانيه شوي دي ليمون","note":"1 كيلو","price":245,"image_path":"/bagburgermenu/%D8%A8%D8%A7%D9%86%D9%8A%D9%87%20%D8%B4%D9%88%D9%8A.jpg","is_visible":true,"sort_order":33},{"id":"p35","category_key":"panegrill","name":"بانيه شوي بيكاتا","note":"1 كيلو","price":245,"image_path":"/bagburgermenu/%D8%A8%D8%A7%D9%86%D9%8A%D9%87%20%D8%B4%D9%88%D9%8A.jpg","is_visible":true,"sort_order":34},{"id":"p36","category_key":"panegrill","name":"بانيه شوي ريحان","note":"1 كيلو","price":245,"image_path":"/bagburgermenu/%D8%A8%D8%A7%D9%86%D9%8A%D9%87%20%D8%B4%D9%88%D9%8A.jpg","is_visible":true,"sort_order":35},{"id":"p37","category_key":"panegrill","name":"بانيه شوي هوني مسترد","note":"1 كيلو","price":245,"image_path":"/bagburgermenu/%D8%A8%D8%A7%D9%86%D9%8A%D9%87%20%D8%B4%D9%88%D9%8A.jpg","is_visible":true,"sort_order":36},{"id":"p38","category_key":"panegrill","name":"بانيه شوي هوت آند هوت","note":"1 كيلو","price":245,"image_path":"/bagburgermenu/%D8%A8%D8%A7%D9%86%D9%8A%D9%87%20%D8%B4%D9%88%D9%8A.jpg","is_visible":true,"sort_order":37},{"id":"p39","category_key":"panegrill","name":"بانيه شوي كوريا","note":"1 كيلو","price":245,"image_path":"/bagburgermenu/%D8%A8%D8%A7%D9%86%D9%8A%D9%87%20%D8%B4%D9%88%D9%8A%20%D9%83%D9%88%D8%B1%D9%8A%D8%A7.jpg","is_visible":true,"sort_order":38},{"id":"p40","category_key":"panegrill","name":"بانيه شوي ترياكي","note":"1 كيلو","price":245,"image_path":"/bagburgermenu/%D8%A8%D8%A7%D9%86%D9%8A%D9%87%20%D8%B4%D9%88%D9%8A%20%D8%AA%D8%B1%D9%8A%D8%A7%D9%83%D9%8A.jpg","is_visible":true,"sort_order":39},{"id":"p41","category_key":"panegrill","name":"بانيه شوي دبس رمان","note":"1 كيلو","price":245,"image_path":"/bagburgermenu/%D8%A8%D8%A7%D9%86%D9%8A%D9%87%20%D8%B4%D9%88%D9%8A%20%D8%AF%D8%A8%D8%B3%20%D8%B1%D9%85%D8%A7%D9%86.jpg","is_visible":true,"sort_order":40},{"id":"p42","category_key":"kofta","name":"كفتة فراخ","note":"15 سيخ","price":210,"image_path":"/bagburgermenu/%D9%83%D9%81%D8%AA%D8%A9%20%D9%81%D8%B1%D8%A7%D8%AE.jpg","is_visible":true,"sort_order":41},{"id":"p43","category_key":"kofta","name":"برجر فراخ","note":"8 قطع","price":220,"image_path":"/bagburgermenu/%D9%83%D9%81%D8%AA%D8%A9%20%D9%81%D8%B1%D8%A7%D8%AE.jpg","is_visible":true,"sort_order":42},{"id":"p44","category_key":"kofta","name":"حواوشي فراخ","note":"6 أرغفة","price":300,"image_path":"/bagburgermenu/%D9%83%D9%81%D8%AA%D8%A9%20%D9%81%D8%B1%D8%A7%D8%AE.jpg","is_visible":true,"sort_order":43},{"id":"p45","category_key":"special","name":"كبدة فراخ","note":"1 كيلو","price":150,"image_path":"/bagburgermenu/%D9%83%D8%A8%D8%AF%D8%A9%20%D9%81%D8%B1%D8%A7%D8%AE.jpg","is_visible":true,"sort_order":44},{"id":"p46","category_key":"special","name":"كبدة فراخ دبس رمان","note":"1 كيلو","price":150,"image_path":"/bagburgermenu/%D9%83%D8%A8%D8%AF%D8%A9%20%D9%81%D8%B1%D8%A7%D8%AE.jpg","is_visible":true,"sort_order":45},{"id":"p47","category_key":"special","name":"وراك حمام كدابي","note":"3 قطع","price":240,"image_path":"/bagburgermenu/%D9%83%D8%A8%D8%AF%D8%A9%20%D9%81%D8%B1%D8%A7%D8%AE.jpg","is_visible":true,"sort_order":46},{"id":"p48","category_key":"special","name":"وراك حمام كدابي","note":"6 قطع","price":345,"image_path":"/bagburgermenu/%D9%83%D8%A8%D8%AF%D8%A9%20%D9%81%D8%B1%D8%A7%D8%AE.jpg","is_visible":true,"sort_order":47},{"id":"p49","category_key":"special","name":"حمام محشي أرز وجوز","note":"للحبة","price":225,"image_path":"/bagburgermenu/%D9%83%D8%A8%D8%AF%D8%A9%20%D9%81%D8%B1%D8%A7%D8%AE.jpg","is_visible":true,"sort_order":48},{"id":"p50","category_key":"special","name":"حمام محشي فريك وجوز","note":"للحبة","price":225,"image_path":"/bagburgermenu/%D9%83%D8%A8%D8%AF%D8%A9%20%D9%81%D8%B1%D8%A7%D8%AE.jpg","is_visible":true,"sort_order":49}]'::jsonb) as seed(
  id text,
  category_key text,
  name text,
  note text,
  price integer,
  image_path text,
  is_visible boolean,
  sort_order integer
)
on conflict (id) do update set
  category_key = excluded.category_key,
  name = excluded.name,
  note = excluded.note,
  price = excluded.price,
  image_path = excluded.image_path,
  is_visible = excluded.is_visible,
  sort_order = excluded.sort_order,
  updated_at = now();
