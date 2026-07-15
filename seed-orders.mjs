/**
 * seed-orders.mjs
 * Run once: node seed-orders.mjs
 * Generates 50 realistic, randomized orders over the last 14 days and uploads them to Supabase.
 */

import { createClient } from '@supabase/supabase-js';

// ── Config (from environment — see .env.local's SUPABASE_SERVICE_ROLE_KEY) ──
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tzfpkzxvolnclhvojjwg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY env var is required. Run with: node --env-file=.env.local seed-orders.mjs');
}

const ORDERS_TABLE = 'orders';

// ── Data Banks ────────────────────────────────────────────────────
const PRODUCTS = [
  { id: 'bb1',  cat: 'beef-burgers',    name: 'Classic Burger', price: 33 },
  { id: 'bb4',  cat: 'beef-burgers',    name: 'Capital Burger', price: 34 },
  { id: 'bb6',  cat: 'beef-burgers',    name: 'Signature Burger', price: 37 },
  { id: 'cb1',  cat: 'chicken-burgers', name: 'Crispy Chicken Burger', price: 38 },
  { id: 'cb3',  cat: 'chicken-burgers', name: 'Grilled Chicken Burger', price: 35 },
  { id: 'bm1',  cat: 'beef-meals',      name: 'Classic Burger Meal', price: 39 },
  { id: 'bm6',  cat: 'beef-meals',      name: 'Signature Burger Meal', price: 43 },
  { id: 'cm1',  cat: 'chicken-meals',   name: 'Crispy Chicken Burger Meal', price: 43 },
  { id: 'sd1',  cat: 'sides',           name: 'French Fries', price: 14 },
  { id: 'sd6',  cat: 'sides',           name: 'Super Bomb', price: 38 },
  { id: 'sd8',  cat: 'sides',           name: 'Chicken Strips', price: 35 },
  { id: 'bx1',  cat: 'box',             name: '4 Piece Classic Burger Box', price: 119 },
  { id: 'bx5',  cat: 'box',             name: 'Mix Box (4 Pcs)', price: 149 },
  { id: 'bv4',  cat: 'beverages',       name: 'Cola', price: 4 },
  { id: 'bv6',  cat: 'beverages',       name: 'Citrus', price: 4 },
  { id: 'bv7',  cat: 'beverages',       name: 'Water', price: 2 },
];

const NAMES = [
  'أحمد حسن', 'محمد علي', 'عمر فاروق', 'طارق مصطفى',
  'سارة كمال', 'نور عبد الله', 'ياسمين السيد', 'منى سمير',
  'كريم عادل', 'رامي سعيد', 'خالد المالكي', 'فيصل الدوسري',
  'نورة القحطاني', 'رهف الشمري', 'سعود العتيبي', 'مشعل الزهراني',
];

const ADDRESSES = [
  'الأندلس، شارع عمر بن عبد العزيز، الرياض',
  'الرياض، حي النرجس، شارع ابن سينا',
  'الرياض، حي الياسمين، شارع الجبل',
  'الرياض، حي الورود، شارع ١٥',
  'الرياض، حي الملقا، شارع الأمير تركي',
  'الرياض، حي العقيق، شارع الجوهرة',
  'الرياض، حي القدس، شارع الحسن بن علي',
  'الرياض، حي السويدي، شارع عبد الرحمن بن عوف',
  'الرياض، حي طويق، شارع الملك سلمان',
  'الرياض، حي الربوة، شارع صلاح الدين',
];

const NOTES = [
  'برجاء التوصيل بعد الساعة ٥',
  'من فضلك بدون شطة',
  'الدفع كاش عند الاستلام',
  'بواب العمارة هيستلم الطلب',
  'الرجاء الاتصال قبل الوصول بـ ١٠ دقائق',
  '', '', '', '', '', // Empty notes are common
];

const STATUSES = ['جديد', 'جديد', 'جديد', 'تم التأكيد', 'تم التأكيد', 'جاري التحضير', 'جاري التحضير', 'تم التوصيل', 'تم التوصيل', 'تم التوصيل', 'تم التوصيل', 'ملغي'];

// ── Helpers ───────────────────────────────────────────────────────
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generatePhone = () => {
  const prefix = '05';
  const suffix = Math.floor(10000000 + Math.random() * 90000000).toString().substring(0, 8);
  return prefix + suffix;
};

const generateDateInLastDays = (days) => {
  const now = Date.now();
  const past = now - days * 24 * 60 * 60 * 1000;
  return new Date(past + Math.random() * (now - past));
};

// ── Generator ─────────────────────────────────────────────────────
const generateOrder = () => {
  const numItems = randInt(1, 5);
  const items = [];
  let total = 0;

  for (let i = 0; i < numItems; i++) {
    const p = rand(PRODUCTS);
    const qty = randInt(1, 3);
    
    // Prevent duplicate items
    const existing = items.find(item => item.id === p.id);
    if (existing) {
      existing.qty += qty;
      total += p.price * qty;
    } else {
      items.push({
        id: p.id,
        name: p.name,
        price: p.price,
        qty: qty,
        categoryKey: p.cat
      });
      total += p.price * qty;
    }
  }

  const createdAt = generateDateInLastDays(14); // Spread over last 14 days
  
  // Make today's orders more likely to be "جديد" or "جاري التحضير"
  const isToday = (Date.now() - createdAt.getTime()) < 24 * 60 * 60 * 1000;
  let status;
  if (isToday) {
    status = rand(['جديد', 'جديد', 'تم التأكيد', 'جاري التحضير']);
  } else {
    status = rand(['تم التوصيل', 'تم التوصيل', 'تم التوصيل', 'ملغي']);
  }

  return {
    id: crypto.randomUUID(),
    customer_name: rand(NAMES),
    phone: generatePhone(),
    address: rand(ADDRESSES),
    notes: rand(NOTES),
    items: items,
    screenshot_path: '',
    total: total,
    status: status,
    created_at: createdAt.toISOString(),
    updated_at: new Date(createdAt.getTime() + randInt(0, 3600000)).toISOString(), // Updated shortly after creation
  };
};

// ── Seed Script ───────────────────────────────────────────────────
const seedOrders = async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });

  const orders = Array.from({ length: 50 }, generateOrder);

  // Sort chronologically just in case
  orders.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  console.log(`\n🔄  Generating 50 realistic orders…\n`);
  
  const { data, error } = await supabase
    .from(ORDERS_TABLE)
    .upsert(orders, { onConflict: 'id' });

  if (error) {
    console.error('❌  Seed failed:\n', error);
    process.exit(1);
  }

  console.log(`✅  Done! 50 realistic orders upserted to "${ORDERS_TABLE}".\n`);
  
  // Print some stats
  const totals = orders.reduce((sum, o) => sum + o.total, 0);
  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  console.log('Stats:');
  console.log(`  - Total Revenue Generated: ${totals.toLocaleString()} SAR`);
  console.log('  - Status Breakdown:');
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`    • ${status}: ${count}`);
  });
  console.log('');
};

seedOrders();
