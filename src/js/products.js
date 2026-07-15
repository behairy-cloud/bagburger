export const WHATSAPP_NUMBER_DISPLAY = "0570559039";
export const WHATSAPP_NUMBER_INTL    = "966570559039";

export const CATEGORIES = [
  { key: 'beef-burgers',    label: 'Beef Burger Sandwiches',    emoji: '🍔', desc: 'Angus beef burgers, smashed and stacked fresh' },
  { key: 'chicken-burgers', label: 'Chicken Burger Sandwiches', emoji: '🍗', desc: 'Crispy and grilled chicken burgers' },
  { key: 'beef-meals',      label: 'Beef Burger Meals',         emoji: '🍟', desc: 'Beef burgers served with fries and a drink' },
  { key: 'chicken-meals',   label: 'Chicken Burger Meals',      emoji: '🥤', desc: 'Chicken burgers served with fries and a drink' },
  { key: 'box',             label: 'Box',                       emoji: '📦', desc: 'Shareable boxes for the table' },
  { key: 'diet',            label: 'Diet',                      emoji: '🥗', desc: 'Lighter burgers, no bun' },
  { key: 'diet-meals',      label: 'Diet Meal',                 emoji: '🥑', desc: 'Diet burgers served as a full meal' },
  { key: 'sides',           label: 'Sides',                     emoji: '🍟', desc: 'Fries, bombs, strips, and more' },
  { key: 'beverages',       label: 'Beverages',                 emoji: '🥤', desc: 'Cold drinks and refreshers' },
  { key: 'sauce',           label: 'Sauce',                     emoji: '🫙', desc: 'House-made sauces and dips' },
  { key: 'salad',           label: 'Salad',                     emoji: '🥗', desc: 'Fresh salads made to order' },
];

export const PRODUCTS = [
  // === Beef Burger Sandwiches ===
  { id: 'bb1',  cat: 'beef-burgers', name: 'Classic Burger',          note: '100g angus beef, lettuce, cheese, and sauce',                     price: 33,  labels: [] },
  { id: 'bb2',  cat: 'beef-burgers', name: 'Double Classic Burger',   note: '200g angus beef, lettuce, cheese, and sauce',                     price: 38,  labels: [] },
  { id: 'bb3',  cat: 'beef-burgers', name: 'Triple Classic Burger',   note: '300g angus beef, lettuce, cheese, and sauce',                     price: 45,  labels: [] },
  { id: 'bb4',  cat: 'beef-burgers', name: 'Capital Burger',          note: 'Angus beef, special sauce, pickles, and lettuce',                 price: 34,  labels: [] },
  { id: 'bb5',  cat: 'beef-burgers', name: 'Bacaon Burger',           note: 'Angus beef, sauce, lettuce, tomatoes, and onions',                price: 45,  labels: [] },
  { id: 'bb6',  cat: 'beef-burgers', name: 'Signature Burger',        note: 'Angus beef, lettuce, tomatoes, onions, and special sauce',        price: 37,  labels: ['best-seller'] },
  { id: 'bb7',  cat: 'beef-burgers', name: 'Truffle Mushroom Burger', note: 'Angus beef, lettuce, truffle sauce, and mushrooms',               price: 44,  labels: [] },
  { id: 'bb8',  cat: 'beef-burgers', name: 'Egg Burger',              note: 'Angus beef, sauce, omelet, mushrooms, and cheese',                price: 38,  labels: [] },
  { id: 'bb9',  cat: 'beef-burgers', name: 'Crazy Cheetos Burger',    note: 'Angus beef, hot sauce, spicy cheetos, and cheese',                price: 33,  labels: ['spicy'] },
  { id: 'bb10', cat: 'beef-burgers', name: 'Mozzarella Bomb Burger',  note: 'Angus beef, special sauce, mozzarella, and lettuce',              price: 43,  labels: [] },

  // === Chicken Burger Sandwiches ===
  { id: 'cb1',  cat: 'chicken-burgers', name: 'Crispy Chicken Burger',  note: 'Chicken breast, sauce, red cabbage, and lettuce',              price: 38,  labels: [] },
  { id: 'cb2',  cat: 'chicken-burgers', name: 'Chicken Crunch Burger',  note: 'Chicken breast, special sauce, coleslaw, and lettuce',         price: 41,  labels: [] },
  { id: 'cb3',  cat: 'chicken-burgers', name: 'Grilled Chicken Burger', note: 'Chicken breast, lettuce, special sauce, and tomatoes',         price: 35,  labels: [] },

  // === Beef Burger Meals ===
  { id: 'bm1',  cat: 'beef-meals', name: 'Classic Burger Meal',          note: '100g angus beef, lettuce, cheese, sauce, and fries',          price: 39,  labels: [] },
  { id: 'bm2',  cat: 'beef-meals', name: 'Double Classic Burger Meal',   note: '200g angus beef, lettuce, cheese, sauce, and fries',          price: 45,  labels: [] },
  { id: 'bm3',  cat: 'beef-meals', name: 'Triple Classic Burger Meal',   note: '300g angus beef, lettuce, cheese, sauce, and fries',          price: 52,  labels: [] },
  { id: 'bm4',  cat: 'beef-meals', name: 'Capital Burger Meal',          note: 'Angus beef, special sauce, pickles, lettuce, and fries',      price: 40,  labels: [] },
  { id: 'bm5',  cat: 'beef-meals', name: 'Bacaon Burger Meal',           note: 'Angus beef, bacon, sauce, lettuce, and tomatoes, with fries', price: 51,  labels: [] },
  { id: 'bm6',  cat: 'beef-meals', name: 'Signature Burger Meal',        note: 'Angus beef, lettuce, tomatoes, onions, and special sauce, with fries', price: 43, labels: ['best-seller'] },
  { id: 'bm7',  cat: 'beef-meals', name: 'Truffle Mushroom Burger Meal', note: 'Angus beef, lettuce, truffle sauce, mushrooms, and fries',    price: 50,  labels: [] },
  { id: 'bm8',  cat: 'beef-meals', name: 'Egg Burger Meal',              note: 'Angus beef, sauce, omelet, mushrooms, pickles, and fries',    price: 43,  labels: [] },
  { id: 'bm9',  cat: 'beef-meals', name: 'Crazy Cheetos Burger Meal',    note: 'Angus beef, hot sauce, spicy cheetos, cheese, and fries',     price: 40,  labels: ['spicy'] },
  { id: 'bm10', cat: 'beef-meals', name: 'Mozzarella Bomb Burger Meal',  note: 'Angus beef, special sauce, mozzarella, lettuce, with fries',  price: 51,  labels: [] },

  // === Chicken Burger Meals ===
  { id: 'cm1',  cat: 'chicken-meals', name: 'Crispy Chicken Burger Meal',  note: 'Chicken breast, sauce, red cabbage, lettuce, and fries',   price: 43,  labels: [] },
  { id: 'cm2',  cat: 'chicken-meals', name: 'Chicken Crunch Burger Meal',  note: 'Chicken breast, special sauce, coleslaw, lettuce, and fries', price: 47, labels: [] },
  { id: 'cm3',  cat: 'chicken-meals', name: 'Grilled Chicken Burger Meal', note: 'Chicken breast, lettuce, special sauce, tomatoes, and fries', price: 41, labels: [] },

  // === Box ===
  { id: 'bx1',  cat: 'box', name: '4 Piece Classic Burger Box',       note: '100g angus beef, lettuce, cheese, and sauce, x4 with fries',     price: 119, labels: ['combo'] },
  { id: 'bx2',  cat: 'box', name: '6 Piece Classic Burger Box',       note: 'Angus beef 100g, lettuce, cheese, sauce, x6 with fries',         price: 179, labels: ['combo'] },
  { id: 'bx3',  cat: 'box', name: '4 Piece Crispy Chicken Burger Box',note: 'Chicken breast, sauce, red cabbage, and lettuce, x4 with fries', price: 139, labels: ['combo'] },
  { id: 'bx4',  cat: 'box', name: '6 Piece Crispy Chicken Burger Box',note: 'Chicken breast, sauce, red cabbage, and lettuce, x6 with fries', price: 199, labels: ['combo'] },
  { id: 'bx5',  cat: 'box', name: 'Mix Box (4 Pcs)',                  note: '2 chicken crunch burgers, 2 classic burgers, with fries',        price: 149, labels: ['combo'] },
  { id: 'bx6',  cat: 'box', name: 'Duo Deal Box',                     note: '2 classic burgers, 2 pieces fried chicken strips, with fries',   price: 99,  labels: ['combo'] },
  { id: 'bx7',  cat: 'box', name: 'Adventure Box (4 Pcs)',            note: 'Spicy burger, bacaon burger, signature burger, and more',        price: 169, labels: ['combo', 'spicy'] },

  // === Diet ===
  { id: 'dt1',  cat: 'diet', name: 'Green Chicken', note: 'Grilled chicken, lettuce, tomatoes, pickles, and sauce', price: 38, labels: [] },
  { id: 'dt2',  cat: 'diet', name: 'Green Beef',    note: '100g angus beef, lettuce, tomatoes, pickles, and sauce', price: 40, labels: [] },

  // === Diet Meal ===
  { id: 'dm1',  cat: 'diet-meals', name: 'Green Chicken Meal', note: 'Grilled chicken, lettuce, tomatoes, pickles, and sauce, with fries', price: 43, labels: [] },
  { id: 'dm2',  cat: 'diet-meals', name: 'Green Beef Meal',    note: '100g angus beef, lettuce, tomatoes, pickles, and sauce, with fries', price: 45, labels: [] },

  // === Sides ===
  { id: 'sd1',  cat: 'sides', name: 'French Fries',           note: 'Fresh fried potato wedges',                             price: 14, labels: [] },
  { id: 'sd2',  cat: 'sides', name: 'Jalapeno Cheese Sticks',  note: '5 pieces of fried spicy cheese sticks',                 price: 28, labels: ['spicy'] },
  { id: 'sd3',  cat: 'sides', name: 'Chicken Nuggets',         note: '5 pieces of fried chicken nuggets',                     price: 25, labels: [] },
  { id: 'sd4',  cat: 'sides', name: 'Chicken Bomb',            note: 'French fries topped with cheese',                       price: 26, labels: [] },
  { id: 'sd5',  cat: 'sides', name: 'Angus Bomb',              note: 'French fries topped with cheese and angus beef',        price: 30, labels: [] },
  { id: 'sd6',  cat: 'sides', name: 'Super Bomb',               note: 'French fries topped with cheese, angus beef, and more', price: 38, labels: [] },
  { id: 'sd7',  cat: 'sides', name: 'Spicy Bomb',               note: 'French fries topped with cheese, angus beef, and hot sauce', price: 39, labels: ['spicy'] },
  { id: 'sd8',  cat: 'sides', name: 'Chicken Strips',           note: '3 pieces of chicken strips with fries',                 price: 35, labels: [] },
  { id: 'sd9',  cat: 'sides', name: 'Fried Kibbeh',             note: '3 fried kibbeh served with golden fries',               price: 22, labels: [] },
  { id: 'sd10', cat: 'sides', name: 'Chicken Cheese Bomb',       note: 'French fries with cheese and fried chicken',            price: 30, labels: [] },
  { id: 'sd11', cat: 'sides', name: 'Bag Wings',                note: '6 pcs fried wings',                                     price: 25, labels: [] },
  { id: 'sd12', cat: 'sides', name: 'Chicken Mozza Pops',       note: '4 crispy chicken bites stuffed with melted mozzarella', price: 26, labels: [] },

  // === Beverages ===
  { id: 'bv1',  cat: 'beverages', name: 'Lemon',      note: 'The soft drink with a unique and refreshing flavor', price: 4, labels: [] },
  { id: 'bv2',  cat: 'beverages', name: 'Orange',     note: 'The soft drink with a unique and refreshing flavor', price: 4, labels: [] },
  { id: 'bv3',  cat: 'beverages', name: 'Diet Cola',  note: 'The soft drink with a unique and refreshing flavor', price: 4, labels: [] },
  { id: 'bv4',  cat: 'beverages', name: 'Cola',       note: 'The soft drink with a unique and refreshing flavor', price: 4, labels: [] },
  { id: 'bv5',  cat: 'beverages', name: 'Zaro Lemon', note: 'The soft drink with a unique and refreshing flavor', price: 4, labels: [] },
  { id: 'bv6',  cat: 'beverages', name: 'Citrus',     note: 'The soft drink with a unique and refreshing flavor', price: 4, labels: [] },
  { id: 'bv7',  cat: 'beverages', name: 'Water',      note: 'Pure and refreshing fresh drinking water',           price: 2, labels: [] },

  // === Sauce ===
  { id: 'sc1',  cat: 'sauce', name: 'Cheese Sauce',  note: 'A traditional sauce made from cheese, milk, and spices',      price: 6, labels: [] },
  { id: 'sc2',  cat: 'sauce', name: 'Hot Sauce',     note: 'Sauce prepared from pepper extract and delicious spices',     price: 6, labels: ['spicy'] },
  { id: 'sc3',  cat: 'sauce', name: 'Special Sauce', note: 'A rich balanced sauce that adds a signature flavor',          price: 7, labels: [] },
  { id: 'sc4',  cat: 'sauce', name: 'Truffle Sauce', note: 'Rich truffle flavored sauce for a gourmet touch',             price: 9, labels: [] },
  { id: 'sc5',  cat: 'sauce', name: 'Mayonnaise',    note: 'Smooth creamy mayo perfect for sandwiches',                   price: 6, labels: [] },
  { id: 'sc6',  cat: 'sauce', name: 'Bbq Sauce',     note: 'A sauce with a smoky flavor and delicious spices',            price: 8, labels: [] },

  // === Salad ===
  { id: 'sl1',  cat: 'salad', name: 'Coleslaw',              note: 'Fresh shredded cabbage and carrots with creamy dressing', price: 15, labels: [] },
  { id: 'sl2',  cat: 'salad', name: 'Caesar Salad',          note: 'Crisp romaine lettuce with parmesan and croutons',        price: 22, labels: [] },
  { id: 'sl3',  cat: 'salad', name: 'Chicken Caesar Salad',  note: 'Grilled chicken with fresh lettuce, parmesan, and dressing', price: 31, labels: [] },
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
  'جديد':           { bg: 'rgba(245,196,0,.18)',   fg: '#FFD84D' },
  'تم التأكيد':     { bg: 'rgba(255,179,0,.18)',   fg: '#FFB300' },
  'جاري التحضير':   { bg: 'rgba(232,69,47,.2)',    fg: '#E8452F' },
  'تم التوصيل':     { bg: 'rgba(91,140,90,.28)',   fg: '#5B8C5A' },
  'ملغي':           { bg: 'rgba(168,38,74,.22)',   fg: '#C24569' },
};

export const fmt = n => n.toLocaleString('en-US') + ' SR';
export const productById = id => menuProductsById.get(id) || PRODUCTS_BY_ID.get(id) || PRODUCTS.find(p => p.id === id);
