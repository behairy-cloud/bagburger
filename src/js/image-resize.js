// Client-side resize: crops any uploaded photo to a square (Instagram-post
// style, 1080x1080) before it reaches Supabase Storage — keeps every menu
// image visually consistent and shrinks upload size.

const IG_SIZE = 1080;
const JPEG_QUALITY = 0.86;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image-load-failed'));
    };
    img.src = url;
  });
}

export async function squareCropToInstagramSize(file, size = IG_SIZE) {
  if (!(file instanceof File)) throw new Error('Invalid image file.');

  const { img, url } = await loadImage(file);
  try {
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - side) / 2;
    const sy = (img.naturalHeight - side) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error('canvas-export-failed'))),
        'image/jpeg',
        JPEG_QUALITY
      );
    });

    const baseName = (file.name || 'image').replace(/\.[^.]+$/, '');
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
  } finally {
    URL.revokeObjectURL(url);
  }
}
