/**
 * Unified storage wrapper supporting Supabase as the primary backend
 * with a robust localStorage/sessionStorage fallback.
 */
import { ORDER_BUCKET, ORDERS_TABLE, supabase, supabaseEnabled } from './supabase';

const ORDER_PREFIX = 'order:';

const isOrderKey = (key) => typeof key === 'string' && key.startsWith(ORDER_PREFIX);
const orderIdFromKey = (key) => key.slice(ORDER_PREFIX.length);

const parseJson = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const dataUrlToBlob = async (dataUrl) => {
  const response = await fetch(dataUrl);
  return await response.blob();
};

const uploadScreenshot = async (orderId, screenshot) => {
  if (!supabaseEnabled || !supabase || typeof screenshot !== 'string') return screenshot;
  if (!screenshot.startsWith('data:')) return screenshot;

  const blob = await dataUrlToBlob(screenshot);
  const extension = blob.type === 'image/png' ? 'png' : 'jpg';
  const path = `${orderId}/${Date.now()}.${extension}`;

  // Not upsert: true. The path already includes Date.now(), so it can
  // never collide with an existing object, and the customer-facing anon
  // role is only granted INSERT on this bucket (not UPDATE) - Supabase's
  // upsert path requires update-capable RLS even when nothing actually
  // conflicts, which fails for anon and isn't needed here anyway.
  const { error } = await supabase.storage.from(ORDER_BUCKET).upload(path, blob, {
    upsert: false,
    contentType: blob.type || 'image/jpeg',
  });

  if (error) throw error;
  return path;
};

const signedScreenshotUrl = async (path) => {
  if (!path || !supabaseEnabled || !supabase) return path || null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;

  const { data, error } = await supabase.storage
    .from(ORDER_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24);
  if (error || !data?.signedUrl) return path;
  return data.signedUrl;
};

/**
 * FIX: Normalize a Supabase DB row → the canonical in-memory order shape.
 * Uses camelCase throughout so AdminDashboard always gets consistent fields.
 * order.name  = customer name (NOT order.customer_name)
 * order.createdAt = timestamp number
 */
const orderRowToValue = async (row) => {
  const order = {
    id: row.id,
    // Consistent field: always `name`, never `customer_name`
    name: row.customer_name || row.name || '',
    phone: row.phone || '',
    address: row.address || '',
    notes: row.notes || '',
    screenshot: await signedScreenshotUrl(row.screenshot_path),
    screenshotPath: row.screenshot_path || '',
    items: Array.isArray(row.items) ? row.items : [],
    total: Number(row.total) || 0,
    status: row.status || 'جديد',
    // Consistent field: always `createdAt` as millisecond timestamp
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
  };

  return JSON.stringify(order);
};

const orderValueToRow = async (value) => {
  const order = typeof value === 'string' ? parseJson(value) : value;
  if (!order || typeof order !== 'object') {
    throw new Error('Invalid order payload');
  }

  const orderId = order.id || crypto.randomUUID();
  const rawScreenshot = order.screenshotPath || order.screenshot || '';
  const screenshotPath = await uploadScreenshot(orderId, rawScreenshot);

  return {
    id: orderId,
    // Accept both field names when writing back
    customer_name: order.name ?? order.customer_name ?? '',
    phone: order.phone ?? '',
    address: order.address ?? '',
    notes: order.notes ?? '',
    items: Array.isArray(order.items) ? order.items : [],
    screenshot_path: screenshotPath || '',
    total: Number(order.total) || 0,
    status: order.status || 'جديد',
    created_at: order.createdAt
      ? new Date(order.createdAt).toISOString()
      : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

const upsertOrder = async (key, value) => {
  const orderId = orderIdFromKey(key);
  const row = await orderValueToRow(value);
  const payload = { ...row, id: orderId || row.id };

  const { error } = await supabase.from(ORDERS_TABLE).upsert(payload, { onConflict: 'id' });
  if (error) throw error;
  return true;
};

const readOrder = async (key) => {
  const orderId = orderIdFromKey(key);
  const { data, error } = await supabase
    .from(ORDERS_TABLE)
    .select('*')
    .eq('id', orderId)
    .maybeSingle();
  if (error || !data) return null;
  return { value: await orderRowToValue(data) };
};

/**
 * FIX: Load ALL orders in a single query instead of fetching IDs then looping.
 * Returns { orders: [...parsed order objects] } for the bulk-load path used by
 * the AdminDashboard. Also keeps the { keys: [...] } path for the old loop.
 */
const listOrders = async () => {
  const { data, error } = await supabase
    .from(ORDERS_TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Resolve signed URLs for screenshots in parallel (capped at 20 to avoid rate limits)
  const rows = data || [];
  const chunk = rows.slice(0, 20);
  const rest = rows.slice(20);

  const resolved = await Promise.all(chunk.map(orderRowToValue));
  const restResolved = await Promise.all(rest.map(orderRowToValue));

  const orders = [...resolved, ...restResolved].map((v) => {
    try { return JSON.parse(v); } catch { return null; }
  }).filter(Boolean);

  return {
    // Keep legacy key list format for any callers still using the loop pattern
    keys: rows.map((row) => `${ORDER_PREFIX}${row.id}`),
    // New bulk format: full parsed order objects
    orders,
  };
};

export const storage = {
  async get(key, persist = false) {
    if (persist && isOrderKey(key) && supabaseEnabled) {
      return await readOrder(key);
    }

    if (window.storage && typeof window.storage.get === 'function') {
      return await window.storage.get(key, persist);
    }
    const store = persist ? localStorage : sessionStorage;
    const val = store.getItem(key);
    return val !== null ? { value: val } : null;
  },

  async set(key, value, persist = false) {
    if (persist && isOrderKey(key) && supabaseEnabled) {
      return await upsertOrder(key, value);
    }

    if (window.storage && typeof window.storage.set === 'function') {
      return await window.storage.set(key, value, persist);
    }
    const store = persist ? localStorage : sessionStorage;
    store.setItem(key, value);
    return true;
  },

  /**
   * FIX: Returns { keys, orders } when supabaseEnabled.
   * AdminDashboard should use result.orders directly instead of looping keys.
   */
  async list(prefix, persist = false) {
    if (persist && prefix === ORDER_PREFIX && supabaseEnabled) {
      return await listOrders();
    }

    if (window.storage && typeof window.storage.list === 'function') {
      return await window.storage.list(prefix, persist);
    }
    const store = persist ? localStorage : sessionStorage;
    const keys = [];
    for (let i = 0; i < store.length; i++) {
      const k = store.key(i);
      if (k && k.startsWith(prefix)) {
        keys.push(k);
      }
    }
    return { keys, orders: [] };
  },
};
