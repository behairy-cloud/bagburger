// SIDE BURGER — menu image URL resolution

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL?.trim?.() ||
  'https://tzfpkzxvolnclhvojjwg.supabase.co';

export function getMenuImageUrl(storedPath) {
  if (!storedPath) return null;
  if (/^(https?:|data:)/i.test(storedPath)) return storedPath;
  if (storedPath.startsWith('/')) return storedPath;
  if (storedPath.includes('/') && !storedPath.startsWith('http')) {
    const bucket = storedPath.split('/')[0];
    return `${SUPABASE_URL}/storage/v1/object/public/${storedPath}`;
  }
  return storedPath;
}

/**
 * Resolve the final image source for a menu item.
 * Returns null when there's no real uploaded photo — callers render an
 * empty state instead of a generated placeholder graphic.
 */
export function resolveMenuImageSource(imagePath) {
  if (!imagePath) return null;
  if (/^(https?:|data:)/i.test(imagePath)) return imagePath;
  if (imagePath.startsWith('/')) return imagePath;
  return getMenuImageUrl(imagePath) || null;
}
