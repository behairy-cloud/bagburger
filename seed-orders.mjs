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
  { id: 'p1',  cat: 'shawarma',  name: 'شاورما فراخ', price: 245 },
  { id: 'p2',  cat: 'shawarma',  name: 'فاهيتا فراخ', price: 245 },
  { id: 'p6',  cat: 'shish',     name: 'شيش جريل', price: 240 },
  { id: 'p10', cat: 'shish',     name: 'شيش طاووق', price: 235 },
  { id: 'p11', cat: 'grill',     name: 'فراخ شوي مشروم', price: 230 },
  { id: 'p16', cat: 'grill',     name: 'وراك شوي', price: 235 },
  { id: 'p21', cat: 'wings',     name: 'أجنحة شوي', price: 110 },
  { id: 'p24', cat: 'panefry',   name: 'بانيه قلي', price: 230 },
  { id: 'p28', cat: 'panefry',   name: 'كوردون بلو', price: 230 },
  { id: 'p30', cat: 'panefry',   name: 'فينجرز', price: 240 },
  { id: 'p31', cat: 'panegrill', name: 'بانيه شوي', price: 245 },
  { id: 'p42', cat: 'kofta',     name: 'كفتة فراخ', price: 210 },
  { id: 'p43', cat: 'kofta',     name: 'برجر فراخ', price: 220 },
  { id: 'p44', cat: 'kofta',     name: 'حواوشي فراخ', price: 300 },
  { id: 'p45', cat: 'special',   name: 'كبدة فراخ', price: 150 },
  { id: 'p49', cat: 'special',   name: 'حمام محشي أرز وجوز', price: 225 },
];

const NAMES = [
  'أحمد حسن', 'محمد علي', 'محمود إبراهيم', 'عمر فاروق', 'طارق مصطفى',
  'سارة كمال', 'نور عبد الله', 'ياسمين السيد', 'منى سمير', 'هند مجدي',
  'كريم عادل', 'عمرو دياب', 'رامي سعيد', 'هاني شاكر', 'تامر حسني',
  'شيرين عبد الوهاب', 'أنغام', 'إليسا', 'نانسي عجرم', 'أصالة',
];

const ADDRESSES = [
  'الرحاب، مجموعة ١٥، عمارة ٤',
  'مدينتي، B1، مجموعة 12، عمارة 5',
  'التجمع الخامس، النرجس عمارات',
  'التجمع الأول، مجاورة 3، فيلا 12',
  'المعادي، شارع 9، عمارة 45',
  'مدينة نصر، شارع مكرم عبيد',
  'مصر الجديدة، الكوربة، شارع بغداد',
  'المهندسين، شارع جامعة الدول',
  'الدقي، شارع التحرير',
  'الشيخ زايد، الحي الثامن',
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
  const prefix = rand(['010', '011', '012', '015']);
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

  console.log('📊 Stats:');
  console.log(`  - Total Revenue Generated: ${totals.toLocaleString()} ج.م`);
  console.log('  - Status Breakdown:');
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`    • ${status}: ${count}`);
  });
  console.log('');
};

seedOrders();
