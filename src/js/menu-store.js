import { PRODUCTS, CATEGORIES } from './products.js';
import { menuImageFor, resolveMenuImageSource } from './menu-images.js';
import { MENU_IMAGE_BUCKET, supabase, supabaseEnabled } from './supabase.js';
export const MENU_TABLE = 'menu_items';

const CATEGORY_LABELS = new Map(CATEGORIES.map((category) => [category.key, category.label]));

const toBoolean = (value, fallback = true) => {
  if (value === null || value === undefined) return fallback;
  return Boolean(value);
};

const normalizeText = (value = '') => String(value ?? '').trim();

export const DEFAULT_MENU_ITEMS = PRODUCTS.map((product, index) => ({
  ...product,
  categoryKey: product.cat,
  categoryLabel: CATEGORY_LABELS.get(product.cat) || product.cat,
  imagePath: menuImageFor(product),
  isVisible: true,
  sortOrder: index,
}));

const toRow = (item) => ({
  id: item.id,
  category_key: item.categoryKey || item.cat || 'special',
  name: normalizeText(item.name),
  note: normalizeText(item.note),
  price: Number(item.price) || 0,
  image_path: normalizeText(item.imagePath || item.image_path) || menuImageFor(item),
  is_visible: toBoolean(item.isVisible ?? item.is_visible, true),
  sort_order: Number(item.sortOrder ?? item.sort_order ?? 0),
  ...(item.createdAt ? { created_at: new Date(item.createdAt).toISOString() } : {}),
  updated_at: new Date().toISOString(),
});

const fromRow = (row, index = 0) => ({
  id: row.id,
  cat: row.category_key,
  categoryKey: row.category_key,
  categoryLabel: CATEGORY_LABELS.get(row.category_key) || row.category_key,
  name: row.name || '',
  note: row.note || '',
  price: Number(row.price) || 0,
  imagePath: row.image_path || menuImageFor({ name: row.name, cat: row.category_key }),
  isVisible: row.is_visible !== false,
  sortOrder: Number(row.sort_order ?? index),
  createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
});

export async function loadMenuItems({ seedIfEmpty = true } = {}) {
  if (!supabaseEnabled || !supabase) {
    return DEFAULT_MENU_ITEMS;
  }

  const { data, error } = await supabase
    .from(MENU_TABLE)
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    return DEFAULT_MENU_ITEMS;
  }

  if ((!data || data.length === 0) && seedIfEmpty) {
    await seedMenuItems(DEFAULT_MENU_ITEMS);
    return DEFAULT_MENU_ITEMS;
  }

  return (data || []).map(fromRow);
}

export async function seedMenuItems(items = DEFAULT_MENU_ITEMS) {
  if (!supabaseEnabled || !supabase) return false;

  const payload = items.map(toRow);
  const { error } = await supabase.from(MENU_TABLE).upsert(payload, { onConflict: 'id' });
  if (error) throw error;
  return true;
}

// FIX: was incorrectly using supabaseAuth.from() — supabaseAuth is auth-only.
// All DB writes must go through the main supabase client.
export async function upsertMenuItem(item) {
  if (!supabaseEnabled || !supabase) throw new Error('Supabase is not configured.');

  const payload = toRow({
    ...item,
    id: item.id || crypto.randomUUID(),
  });

  const { error } = await supabase.from(MENU_TABLE).upsert(payload, { onConflict: 'id' });
  if (error) throw error;
  return payload.id;
}

export async function uploadMenuImage(file, itemId = crypto.randomUUID()) {
  if (!supabaseEnabled || !supabase) throw new Error('Supabase is not configured.');
  if (!(file instanceof File)) throw new Error('Invalid image file.');

  const extension = file.name?.split('.').pop()?.toLowerCase() || file.type?.split('/')?.[1] || 'jpg';
  let safeName = file.name ? file.name.replace(/\.[^.]+$/, '') : 'image';
  safeName = safeName
    .replace(/[^a-zA-Z0-9\-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  if (!safeName) safeName = 'image';

  const objectPath = `${itemId}/${Date.now()}-${safeName}.${extension}`;

  // FIX: was using supabaseAuth.storage — must use supabase.storage
  const { error } = await supabase.storage.from(MENU_IMAGE_BUCKET).upload(objectPath, file, {
    contentType: file.type || 'image/jpeg',
  });

  if (error) throw error;
  return {
    path: `${MENU_IMAGE_BUCKET}/${objectPath}`,
    url: resolveMenuImageSource(`${MENU_IMAGE_BUCKET}/${objectPath}`),
  };
}

export async function deleteMenuItem(id) {
  if (!supabaseEnabled || !supabase) throw new Error('Supabase is not configured.');
  // FIX: was using supabaseAuth.from() — must use supabase
  const { error } = await supabase.from(MENU_TABLE).delete().eq('id', id);
  if (error) throw error;
  return true;
}
