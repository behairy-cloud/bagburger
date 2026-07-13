export const WHATSAPP_NUMBER_DISPLAY = "0500000000";
export const WHATSAPP_NUMBER_INTL    = "966500000000";

export const CATEGORIES = [
  { key: 'special-burger',  label: 'البرجر المميز',       emoji: '🔥', desc: 'برجر حجم كبير بتتبيلات خاصة تحسسك بالفرق' },
  { key: 'side-beef',       label: 'سايد بيف',            emoji: '🥩', desc: 'سماش برجر كلاسيكي بلحم بقري 100% طازج' },
  { key: 'sub-side',        label: 'ساندويتش سب سايد',    emoji: '🥪', desc: 'ساندويتشات كبيرة بنكهات عالمية' },
  { key: 'side-crunch',     label: 'سايد قرمشة',          emoji: '🍗', desc: 'تشيكن كرسبي مقرمش بتتبيلة البيت' },
  { key: 'side-fries',      label: 'سايد بطاطس',          emoji: '🍟', desc: 'بطاطس مقلية ومحمصة بأشكال متنوعة' },
  { key: 'side-snacks',     label: 'سايد سناك',           emoji: '🧀', desc: 'مقبلات ووجبات جانبية مميزة' },
  { key: 'side-sauces',     label: 'الصوصات',             emoji: '🫙', desc: 'صوصات بيتنا الخاصة لإتمام التجربة' },
  { key: 'side-drinks',     label: 'المشروبات',           emoji: '🥤', desc: 'مشروبات باردة ومنعشة' },
];

export const PRODUCTS = [
  // === البرجر المميز ===
  { id: 'sb1',  cat: 'special-burger', name: 'شرووم 911',         note: 'لحم أنجوس مع مشروم سوتيه وبصل مكرمل وجبنة سويسرية وصوص الأعشاب المميز', price: 28, labels: [] },
  { id: 'sb2',  cat: 'special-burger', name: 'سموكي بلاست',       note: 'دجاج مشوي مع جبنة شيدر مدخنة وبصل مكرمل وخس وصوص سموكي بلاست الخاص',   price: 28, labels: [] },
  { id: 'sb3',  cat: 'special-burger', name: 'سبايسي كرنش',       note: 'دجاج مقلي كريسبي مع مخلل وخس وصوص الرانش الحار',                       price: 28, labels: ['spicy'] },

  // === سايد بيف ===
  { id: 'bf1',  cat: 'side-beef', name: 'دبل سماش برجر',          note: 'طبقتين لحم أنجوس سماش مع صوص سايد وخس ومخلل على خبز بريوش',            price: 24, labels: [] },
  { id: 'bf2',  cat: 'side-beef', name: 'تربل سماش برجر',         note: 'ثلاث طبقات لحم أنجوس سماش مع صوص سايد وخس ومخلل على خبز بريوش',         price: 28, labels: [] },
  { id: 'bf3',  cat: 'side-beef', name: 'تربل سماش بيري بيري',    note: 'ثلاث طبقات لحم أنجوس سماش مع صوص بيري بيري وخس ومخلل على خبز بريوش',    price: 28, labels: ['spicy'] },

  // === ساندويتش سب سايد ===
  { id: 'ss1',  cat: 'sub-side', name: 'دايناميت تشيكن',          note: 'مكعبات دجاج مشوي مع صوص دايناميت الحار وخس وجبنة',                     price: 32, labels: ['spicy'] },
  { id: 'ss2',  cat: 'sub-side', name: 'ماكسيكان ساندويتش',       note: 'قطع دجاج متبلة بصلصة خاصة وجبنة أمريكية ذائبة وخس في خبز الصاموللي',    price: 26, labels: [] },
  { id: 'ss3',  cat: 'sub-side', name: 'تويستد تشيكن',            note: 'مكعبات دجاج مع صوص الأعشاب وبندورة وخس وجبنة سويسرية',                  price: 26, labels: [] },

  // === سايد قرمشة ===
  { id: 'cr1',  cat: 'side-crunch', name: 'لحم كلاسيك (قرمشة)',   note: 'شريحة لحم أنجوس مغطاة بجبنة أمريكية ذائبة ومخلل وخس اسباني وصوص سايد',   price: 22, labels: [] },
  { id: 'cr2',  cat: 'side-crunch', name: 'دجاج كرسبي كلاسيك',    note: 'صدر دجاج كرسبي بالخلطة الخاصة مع جبنة أمريكية ذائبة وخس وصوص سايد',      price: 24, labels: [] },
  { id: 'cr3',  cat: 'side-crunch', name: 'دجاج كرسبي كرنشي',     note: 'صدر دجاج كرسبي مع جبنة أمريكية ذائبة وصوص البيري الحار وسلطة ملفوف',    price: 26, labels: ['spicy'] },
  { id: 'cr4',  cat: 'side-crunch', name: 'دجاج كرسبي دبل',       note: 'قطعتين دجاج كرسبي مع جبنة أمريكية ذائبة وخس وصوص سايد',                 price: 28, labels: [] },

  // === سايد بطاطس ===
  { id: 'fr1',  cat: 'side-fries', name: 'بطاطس حلوة',            note: 'بطاطس حلوة مقلية',                        price: 16,  labels: [] },
  { id: 'fr2',  cat: 'side-fries', name: 'بطاطس كرسبي',           note: 'بطاطس كرسبي كلاسيك',                      price: 7,   labels: [] },
  { id: 'fr3',  cat: 'side-fries', name: 'كوريان تشيكن فرايز',    note: 'بطاطس مع دجاج وصوص كوري حار',              price: 20,  labels: ['spicy'] },
  { id: 'fr4',  cat: 'side-fries', name: 'بطاطس ودجز',            note: 'بطاطس ودجز محمصة',                        price: 7,   labels: [] },
  { id: 'fr5',  cat: 'side-fries', name: 'سايد سجنيتشر',          note: 'بطاطس بصوص السر الخاص وجبنة',              price: 20,  labels: [] },

  // === سايد سناك ===
  { id: 'sn1',  cat: 'side-snacks', name: 'اصابع موزاريلا',       note: 'أصابع موزاريلا مقلية',                    price: 14,  labels: [] },
  { id: 'sn2',  cat: 'side-snacks', name: 'حلقات بصل',            note: 'حلقات بصل مقرمشة',                        price: 10,  labels: [] },
  { id: 'sn3',  cat: 'side-snacks', name: 'فطيرة تفاح',           note: 'فطيرة تفاح',                              price: 12,  labels: [] },
  { id: 'sn4',  cat: 'side-snacks', name: 'تشيزي ناتشو',          note: 'ناتشو بجبنة ذائبة',                       price: 10,  labels: [] },
  { id: 'sn5',  cat: 'side-snacks', name: 'سلطة سيزر',            note: 'سلطة سيزر',                               price: 12,  labels: [] },
  { id: 'sn6',  cat: 'side-snacks', name: 'سلطة ملفوف',           note: 'سلطة ملفوف',                              price: 6,   labels: [] },
  { id: 'sn7',  cat: 'side-snacks', name: 'سلطة جرجير',           note: 'سلطة جرجير',                              price: 12,  labels: [] },

  // === الصوصات ===
  { id: 'sc1',  cat: 'side-sauces', name: 'كوكتيل',               note: 'صوص كوكتيل بيتنا',                        price: 2,   labels: [] },
  { id: 'sc2',  cat: 'side-sauces', name: 'سايد',                 note: 'صوص سايد الخاص',                          price: 2,   labels: [] },
  { id: 'sc3',  cat: 'side-sauces', name: 'هني ماسترد',           note: 'عسل مع خردل متوازن',                      price: 2,   labels: [] },
  { id: 'sc4',  cat: 'side-sauces', name: 'ترتار',                note: 'صوص ترتار كريمي',                         price: 2,   labels: [] },
  { id: 'sc5',  cat: 'side-sauces', name: 'ثوم',                  note: 'صوص ثوم كريمي',                           price: 2,   labels: [] },
  { id: 'sc6',  cat: 'side-sauces', name: 'بربري',                note: 'صوص بربري',                               price: 2,   labels: [] },
  { id: 'sc7',  cat: 'side-sauces', name: 'دايناميت',             note: 'صوص حار ناري',                            price: 2,   labels: ['spicy'] },
  { id: 'sc8',  cat: 'side-sauces', name: 'رانش',                 note: 'صوص رانش كريمي',                          price: 2,   labels: [] },

  // === المشروبات ===
  { id: 'dr1',  cat: 'side-drinks', name: 'مشروبات غازية',        note: 'بيبسي / سفن أب / ميرندا / بيبسي دايت',    price: 4,   labels: [] },
  { id: 'dr2',  cat: 'side-drinks', name: 'ماء',                  note: 'ماء بارد معبأ',                           price: 2,   labels: [] },
  { id: 'dr3',  cat: 'side-drinks', name: 'آيس تي',               note: 'شاي مثلج',                                price: 5,   labels: [] },
  { id: 'dr4',  cat: 'side-drinks', name: 'عصير موسمي صغير',      note: 'عصير رمان أو عصيرات موسمية',              price: 6,   labels: [] },
  { id: 'dr5',  cat: 'side-drinks', name: 'عصير موسمي كبير',      note: 'عصير رمان أو عصيرات موسمية',              price: 10,  labels: [] },
];

const PRODUCTS_BY_ID = new Map(PRODUCTS.map((product) => [product.id, product]));
let menuProductsById = new Map(PRODUCTS_BY_ID);

export const setMenuProducts = (items = []) => {
  const next = new Map(PRODUCTS_BY_ID);
  for (const item of items || []) {
    if (item?.id) next.set(item.id, item);
  }
  menuProductsById = next;
};

export const ORDER_STATUSES = ['جديد', 'تم التأكيد', 'جاري التحضير', 'تم التوصيل', 'ملغي'];

export const STATUS_COLORS = {
  'جديد':           { bg: 'rgba(255,100,30,.18)',  fg: '#FF6B35' },
  'تم التأكيد':     { bg: 'rgba(255,179,0,.18)',   fg: '#FFB300' },
  'جاري التحضير':   { bg: 'rgba(255,69,0,.2)',     fg: '#FF4500' },
  'تم التوصيل':     { bg: 'rgba(91,140,90,.28)',   fg: '#5B8C5A' },
  'ملغي':           { bg: 'rgba(168,38,74,.22)',   fg: '#C24569' },
};

export const fmt = n => n.toLocaleString('en-US') + ' ريال';
export const productById = id => menuProductsById.get(id) || PRODUCTS_BY_ID.get(id) || PRODUCTS.find(p => p.id === id);
