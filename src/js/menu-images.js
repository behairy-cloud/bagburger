// SIDE BURGER — Category emoji and fallback image mappings
// All images use inline SVG gradients as placeholders — no external image dependency

const CATEGORY_GRADIENTS = {
  'special-burger': ['#FF4500', '#FFB300'],
  'side-beef':      ['#8B0000', '#FF4500'],
  'sub-side':       ['#FF6B35', '#FFD700'],
  'side-crunch':    ['#FF8C00', '#FFD700'],
  'side-fries':     ['#FFB300', '#FF6B35'],
  'side-snacks':    ['#FF4500', '#FF8C00'],
  'side-sauces':    ['#CC0000', '#FF4500'],
  'side-drinks':    ['#1a1a2e', '#FF4500'],
};

const CATEGORY_EMOJIS = {
  'special-burger': '🔥',
  'side-beef':      '🥩',
  'sub-side':       '🥪',
  'side-crunch':    '🍗',
  'side-fries':     '🍟',
  'side-snacks':    '🧀',
  'side-sauces':    '🫙',
  'side-drinks':    '🥤',
};

/**
 * Generate a gorgeous SVG placeholder for a menu item.
 * Uses fiery gradients matching the SIDE BURGER brand identity.
 */
function generateSvgPlaceholder(product) {
  const cat = product?.cat || 'special-burger';
  const colors = CATEGORY_GRADIENTS[cat] || ['#FF4500', '#FFB300'];
  const emoji = CATEGORY_EMOJIS[cat] || '🍔';
  const id = `g-${cat}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${colors[1]};stop-opacity:1"/>
    </linearGradient>
    <filter id="blur-${cat}">
      <feGaussianBlur stdDeviation="8"/>
    </filter>
  </defs>
  <!-- Background -->
  <rect width="400" height="300" fill="#0a0a0a"/>
  <!-- Fiery glow -->
  <ellipse cx="200" cy="160" rx="180" ry="120" fill="url(#${id})" opacity="0.15" filter="url(#blur-${cat})"/>
  <!-- Grid pattern overlay -->
  <rect width="400" height="300" fill="url(#${id})" opacity="0.04"/>
  <!-- Decorative rings -->
  <circle cx="200" cy="150" r="90" fill="none" stroke="url(#${id})" stroke-width="1" opacity="0.3"/>
  <circle cx="200" cy="150" r="70" fill="none" stroke="url(#${id})" stroke-width="0.5" opacity="0.2"/>
  <!-- Emoji -->
  <text x="200" y="165" font-size="72" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
  <!-- Brand tag -->
  <rect x="130" y="220" width="140" height="24" rx="12" fill="${colors[0]}" opacity="0.2"/>
  <text x="200" y="236" font-size="11" text-anchor="middle" fill="${colors[1]}" font-family="sans-serif" font-weight="bold" opacity="0.8">SIDE BURGER</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

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
 * Prefers any explicit imagePath; falls back to branded SVG placeholder.
 */
export function resolveMenuImageSource(imagePath, fallbackProduct) {
  if (!imagePath) return generateSvgPlaceholder(fallbackProduct);
  if (/^(https?:|data:)/i.test(imagePath)) return imagePath;
  if (imagePath.startsWith('/')) return imagePath;
  const publicUrl = getMenuImageUrl(imagePath);
  if (publicUrl) return publicUrl;
  return generateSvgPlaceholder(fallbackProduct);
}

export function menuImageFor(product) {
  return generateSvgPlaceholder(product);
}
