import { STAFF_IMAGE_BUCKET, supabase, supabaseEnabled } from './supabase.js';
import { resolveMenuImageSource } from './menu-images.js';
import { squareCropToInstagramSize } from './image-resize.js';

export const STAFF_TABLE = 'staff';

/* ─── Mapping ────────────────────────────────────────── */
const toRow = (member) => ({
  id: member.id,
  name: (member.name || '').trim(),
  role: (member.role || '').trim(),
  image_path: (member.imagePath || member.image_path || '').trim(),
  is_visible: member.is_visible !== false && member.isVisible !== false,
  sort_order: Number(member.sortOrder ?? member.sort_order ?? 0),
  updated_at: new Date().toISOString(),
  ...(member.createdAt ? { created_at: new Date(member.createdAt).toISOString() } : {}),
});

const fromRow = (row) => ({
  id: row.id,
  name: row.name || '',
  role: row.role || '',
  imagePath: row.image_path || '',
  isVisible: row.is_visible !== false,
  sortOrder: Number(row.sort_order ?? 0),
  createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
});

/* ─── CRUD ───────────────────────────────────────────── */
export async function loadStaff() {
  if (!supabaseEnabled || !supabase) return [];

  const { data, error } = await supabase
    .from(STAFF_TABLE)
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) return [];
  return (data || []).map(fromRow);
}

export async function upsertStaffMember(member) {
  if (!supabaseEnabled || !supabase) throw new Error('Supabase is not configured.');

  const payload = toRow({
    ...member,
    id: member.id || crypto.randomUUID(),
  });

  const { error } = await supabase.from(STAFF_TABLE).upsert(payload, { onConflict: 'id' });
  if (error) throw error;
  return payload.id;
}

export async function deleteStaffMember(id) {
  if (!supabaseEnabled || !supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase.from(STAFF_TABLE).delete().eq('id', id);
  if (error) throw error;
  return true;
}

/* ─── Image upload ────────────────────────────────────── */
export async function uploadStaffImage(file, memberId = crypto.randomUUID()) {
  if (!supabaseEnabled || !supabase) throw new Error('Supabase is not configured.');
  if (!(file instanceof File)) throw new Error('Invalid image file.');

  const resized = await squareCropToInstagramSize(file);

  let safeName = file.name ? file.name.replace(/\.[^.]+$/, '') : 'image';
  safeName = safeName
    .replace(/[^a-zA-Z0-9\-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  if (!safeName) safeName = 'image';

  const objectPath = `${memberId}/${Date.now()}-${safeName}.jpg`;

  const { error } = await supabase.storage.from(STAFF_IMAGE_BUCKET).upload(objectPath, resized, {
    contentType: 'image/jpeg',
  });

  if (error) throw error;
  return {
    path: `${STAFF_IMAGE_BUCKET}/${objectPath}`,
    url: resolveMenuImageSource(`${STAFF_IMAGE_BUCKET}/${objectPath}`),
  };
}

export async function deleteStaffImage(imagePath) {
  if (!supabaseEnabled || !supabase) throw new Error('Supabase is not configured.');
  const path = (imagePath || '').trim();
  const prefix = `${STAFF_IMAGE_BUCKET}/`;
  if (!path.startsWith(prefix)) return false;

  const objectPath = path.slice(prefix.length);
  const { error } = await supabase.storage.from(STAFF_IMAGE_BUCKET).remove([objectPath]);
  if (error) throw error;
  return true;
}
