import { compressImage } from './compressImage';
import { IMAGE_HOST_KEY } from './constants';

const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Compresses an image in the browser, then uploads it to ImgBB (free tier).
 * Returns the hosted URL.
 */
export async function uploadImage(file, { maxWidth = 1200, quality = 0.82 } = {}) {
  if (!IMAGE_HOST_KEY) throw new Error('Image uploads are not configured (VITE_IMAGE_HOST_KEY).');
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
  if (file.size > MAX_BYTES) throw new Error('Images must be smaller than 8 MB.');

  const blob = await compressImage(file, maxWidth, quality);
  const form = new FormData();
  form.append('image', blob, file.name.replace(/\.\w+$/, '.jpg'));

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMAGE_HOST_KEY}`, { method: 'POST', body: form });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.data?.url) throw new Error('Image upload failed. Please try another image.');
  return json.data.display_url || json.data.url;
}
