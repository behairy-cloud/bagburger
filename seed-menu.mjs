/**
 * seed-menu.mjs
 * Run once: node seed-menu.mjs
 * Uploads the full PRODUCTS catalogue to the Supabase menu_items table.
 */

import { createClient } from '@supabase/supabase-js';

// ── Config (from environment — see .env.local's SUPABASE_SERVICE_ROLE_KEY) ──
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tzfpkzxvolnclhvojjwg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY env var is required. Run with: node --env-file=.env.local seed-menu.mjs');
}

const MENU_TABLE  = 'menu_items';

// ── Categories ───────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'shawarma',  label: 'شاورما وفاهيتا' },
  { key: 'shish',     label: 'شيش جريل' },
  { key: 'grill',     label: 'فراخ ووراك شوي' },
  { key: 'wings',     label: 'أجنحة' },
  { key: 'panefry',   label: 'بانيه قلي' },
  { key: 'panegrill', label: 'بانيه شوي' },
  { key: 'kofta',     label: 'كفتة، برجر وحواوشي' },
  { key: 'special',   label: 'كبدة وأطباق الحمام' },
];

// ── Products ─────────────────────────────────────────────────────
const PRODUCTS = [
  { id: 'p1',  cat: 'shawarma',  name: 'شاورما فراخ',              note: '1 كيلو',  price: 245 },
  { id: 'p2',  cat: 'shawarma',  name: 'فاهيتا فراخ',              note: '1 كيلو',  price: 245 },
  { id: 'p3',  cat: 'shawarma',  name: 'استراجانوف فراخ',           note: '1 كيلو',  price: 245 },
  { id: 'p4',  cat: 'shawarma',  name: 'ستريبس فراخ',              note: '1 كيلو',  price: 245 },
  { id: 'p5',  cat: 'shawarma',  name: 'كسادي فراخ',               note: '1 كيلو',  price: 245 },
  { id: 'p6',  cat: 'shish',     name: 'شيش جريل',                 note: '1 كيلو',  price: 240 },
  { id: 'p7',  cat: 'shish',     name: 'شيش جريل باربيكيو',         note: '1 كيلو',  price: 240 },
  { id: 'p8',  cat: 'shish',     name: 'شيش جريل دبس رمان',        note: '1 كيلو',  price: 240 },
  { id: 'p9',  cat: 'shish',     name: 'شيش جريل كباب',            note: '1 كيلو',  price: 240 },
  { id: 'p10', cat: 'shish',     name: 'شيش طاووق',                note: '1 كيلو',  price: 235 },
  { id: 'p11', cat: 'grill',     name: 'فراخ شوي مشروم',           note: '1 كيلو',  price: 230 },
  { id: 'p12', cat: 'grill',     name: 'فراخ شوي تندوري',          note: '1 كيلو',  price: 230 },
  { id: 'p13', cat: 'grill',     name: 'فراخ شوي باربيكيو',        note: '1 كيلو',  price: 230 },
  { id: 'p14', cat: 'grill',     name: 'فراخ شوي دبس رمان',        note: '1 كيلو',  price: 230 },
  { id: 'p15', cat: 'grill',     name: 'فراخ شوي كباب',            note: '1 كيلو',  price: 230 },
  { id: 'p16', cat: 'grill',     name: 'وراك شوي',                 note: '3 قطع',   price: 235 },
  { id: 'p17', cat: 'grill',     name: 'وراك شوي باربيكيو',        note: '3 قطع',   price: 235 },
  { id: 'p18', cat: 'grill',     name: 'وراك شوي كباب',            note: '3 قطع',   price: 235 },
  { id: 'p19', cat: 'grill',     name: 'وراك شوي مشروم',           note: '3 قطع',   price: 235 },
  { id: 'p20', cat: 'grill',     name: 'وراك شوي تندوري',          note: '3 قطع',   price: 235 },
  { id: 'p21', cat: 'wings',     name: 'أجنحة شوي',                note: '1 كيلو',  price: 110 },
  { id: 'p22', cat: 'wings',     name: 'أجنحة شوي باربيكيو',       note: '1 كيلو',  price: 110 },
  { id: 'p23', cat: 'wings',     name: 'أجنحة شوي دبس رمان',      note: '1 كيلو',  price: 110 },
  { id: 'p24', cat: 'panefry',   name: 'بانيه قلي',                note: '1 كيلو',  price: 230 },
  { id: 'p25', cat: 'panefry',   name: 'بانيه قلي شيدر',           note: '1 كيلو',  price: 230 },
  { id: 'p26', cat: 'panefry',   name: 'بانيه قلي ذرة أصفر',       note: '1 كيلو',  price: 230 },
  { id: 'p27', cat: 'panefry',   name: 'بانيه قلي كريسبي',         note: '1 كيلو',  price: 230 },
  { id: 'p28', cat: 'panefry',   name: 'كوردون بلو',               note: '5 قطع',   price: 230 },
  { id: 'p29', cat: 'panefry',   name: 'كوردون بلو بسطرمة',        note: '5 قطع',   price: 230 },
  { id: 'p30', cat: 'panefry',   name: 'فينجرز',                   note: '1 كيلو',  price: 240 },
  { id: 'p31', cat: 'panegrill', name: 'بانيه شوي',                note: '1 كيلو',  price: 245 },
  { id: 'p32', cat: 'panegrill', name: 'بانيه شوي باربيكيو',       note: '1 كيلو',  price: 245 },
  { id: 'p33', cat: 'panegrill', name: 'بانيه شوي كاري',           note: '1 كيلو',  price: 245 },
  { id: 'p34', cat: 'panegrill', name: 'بانيه شوي دي ليمون',       note: '1 كيلو',  price: 245 },
  { id: 'p35', cat: 'panegrill', name: 'بانيه شوي بيكاتا',         note: '1 كيلو',  price: 245 },
  { id: 'p36', cat: 'panegrill', name: 'بانيه شوي ريحان',          note: '1 كيلو',  price: 245 },
  { id: 'p37', cat: 'panegrill', name: 'بانيه شوي هوني مسترد',     note: '1 كيلو',  price: 245 },
  { id: 'p38', cat: 'panegrill', name: 'بانيه شوي هوت آند هوت',    note: '1 كيلو',  price: 245 },
  { id: 'p39', cat: 'panegrill', name: 'بانيه شوي كوريا',          note: '1 كيلو',  price: 245 },
  { id: 'p40', cat: 'panegrill', name: 'بانيه شوي ترياكي',         note: '1 كيلو',  price: 245 },
  { id: 'p41', cat: 'panegrill', name: 'بانيه شوي دبس رمان',       note: '1 كيلو',  price: 245 },
  { id: 'p42', cat: 'kofta',     name: 'كفتة فراخ',                note: '15 سيخ',  price: 210 },
  { id: 'p43', cat: 'kofta',     name: 'برجر فراخ',                note: '8 قطع',   price: 220 },
  { id: 'p44', cat: 'kofta',     name: 'حواوشي فراخ',              note: '6 أرغفة', price: 300 },
  { id: 'p45', cat: 'special',   name: 'كبدة فراخ',                note: '1 كيلو',  price: 150 },
  { id: 'p46', cat: 'special',   name: 'كبدة فراخ دبس رمان',       note: '1 كيلو',  price: 150 },
  { id: 'p47', cat: 'special',   name: 'وراك حمام كدابي',           note: '3 قطع',   price: 240 },
  { id: 'p48', cat: 'special',   name: 'وراك حمام كدابي',           note: '6 قطع',   price: 345 },
  { id: 'p49', cat: 'special',   name: 'حمام محشي أرز وجوز',       note: 'للحبة',   price: 225 },
  { id: 'p50', cat: 'special',   name: 'حمام محشي فريك وجوز',      note: 'للحبة',   price: 225 },
];

// ── Image path resolver (mirrors menu-images.js logic) ───────────
const MENU_ALIASES = {
  'شاورما فراخ':           'شاورما.jpg',
  'فاهيتا فراخ':           'فاهيتا.jpg',
  'استراجانوف فراخ':        'استراجانوف.jpg',
  'ستريبس فراخ':           'فينجرز.jpg',
  'كسادي فراخ':            'كاساديا.jpg',
  'شيش جريل':              'شيش طاووق.jpg',
  'شيش جريل باربيكيو':      'شيش طاووق.jpg',
  'شيش جريل دبس رمان':     'شيش طاووق.jpg',
  'شيش جريل كباب':         'شيش طاووق.jpg',
  'شيش طاووق':             'شيش طاووق.jpg',
  'فراخ شوي مشروم':        'فراخ شوي.jpg',
  'فراخ شوي تندوري':       'فراخ شوي.jpg',
  'فراخ شوي باربيكيو':     'فراخ شوي باربكيو.jpg',
  'فراخ شوي دبس رمان':     'فراخ شوي.jpg',
  'فراخ شوي كباب':         'فراخ شوي.jpg',
  'وراك شوي':              'وراك شوي.jpg',
  'وراك شوي باربيكيو':     'وراك باربكيو.jpg',
  'وراك شوي دبس رمان':     'وراك دبس رمان.jpg',
  'وراك شوي كباب':         'وراك شوي.jpg',
  'وراك شوي مشروم':        'وراك شوي.jpg',
  'وراك شوي تندوري':       'وراك شوي.jpg',
  'أجنحة شوي':             'اجنحة شوي.jpg',
  'أجنحة شوي باربيكيو':    'اجنحة شوي باربكيو.jpg',
  'أجنحة شوي دبس رمان':   'اجنحة شوي دبس رمان.jpg',
  'بانيه قلي':             'بانيه قلي.jpg',
  'بانيه قلي شيدر':        'بانيه قلي شيدر.jpg',
  'بانيه قلي ذرة أصفر':    'بانيه قلي ذرة.jpg',
  'بانيه قلي كريسبي':      'بانيه قلي كرسبي.jpg',
  'كوردون بلو':            'كوردون بلو.jpg',
  'كوردون بلو بسطرمة':     'كوردون بلو ميكس.jpg',
  'فينجرز':                'فينجرز.jpg',
  'بانيه شوي':             'بانيه شوي.jpg',
  'بانيه شوي باربيكيو':    'بانيه شوي باربكيو.jpg',
  'بانيه شوي كاري':        'بانيه شوي كاري.jpg',
  'بانيه شوي دي ليمون':    'بانيه شوي دي  ليمون.jpg',
  'بانيه شوي بيكاتا':      'بانيه شوي بيكاتا.jpg',
  'بانيه شوي ريحان':       'بانيه شوي.jpg',
  'بانيه شوي هوني مسترد':  'بانيه شوي.jpg',
  'بانيه شوي هوت آند هوت': 'بانيه شوي هوت أند هوت.jpg',
  'بانيه شوي كوريا':       'بانيه شوي كوريا.jpg',
  'بانيه شوي ترياكي':      'بانيه شوي ترياكي.jpg',
  'بانيه شوي دبس رمان':    'بانيه شوي دبس رمان.jpg',
  'كفتة فراخ':             'كفتة فراخ.jpg',
  'برجر فراخ':             'كفتة فراخ.jpg',
  'حواوشي فراخ':           'كفتة فراخ.jpg',
  'كبدة فراخ':             'كبدة فراخ.jpg',
  'كبدة فراخ دبس رمان':    'كبدة فراخ.jpg',
  'وراك حمام كدابي':        'حمام كداب.jpg',
  'حمام محشي أرز وجوز':    'حمام حشو رز.jpg',
  'حمام محشي فريك وجوز':   'حمام حشو رز.jpg',
};

const CATEGORY_FALLBACKS = {
  shawarma:  'فاهيتا.jpg',
  shish:     'شيش طاووق.jpg',
  grill:     'فراخ شوي.jpg',
  wings:     'اجنحة شوي.jpg',
  panefry:   'بانيه قلي.jpg',
  panegrill: 'بانيه شوي.jpg',
  kofta:     'كفتة فراخ.jpg',
  special:   'كبدة فراخ.jpg',
};

function imagePathFor(product) {
  const file = MENU_ALIASES[product.name] || CATEGORY_FALLBACKS[product.cat] || 'فاهيتا.jpg';
  return `/tatbelamenu/${file}`;
}

// ── Build rows ────────────────────────────────────────────────────
const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label]));

const rows = PRODUCTS.map((p, index) => ({
  id:           p.id,
  category_key: p.cat,
  name:         p.name,
  note:         p.note,
  price:        p.price,
  image_path:   imagePathFor(p),
  is_visible:   true,
  sort_order:   index,
  updated_at:   new Date().toISOString(),
  // created_at intentionally omitted → DB default now() on insert
}));

// ── Seed ─────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});

console.log(`\n🔄  Seeding ${rows.length} menu items to Supabase…\n`);

const { error } = await supabase
  .from(MENU_TABLE)
  .upsert(rows, { onConflict: 'id' });

if (error) {
  console.error('❌  Seed failed:\n', error);
  process.exit(1);
}

console.log(`✅  Done! ${rows.length} items upserted to "${MENU_TABLE}".\n`);
console.log('   Items seeded:');
rows.forEach((r) => console.log(`   • [${r.id}] ${r.name} — ${r.price} ج`));
console.log('');
