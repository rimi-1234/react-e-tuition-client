/**
 * Curated professional teacher / educator portraits (Unsplash).
 * Used so tutor cards always show real human teacher faces
 * instead of random user uploads (pets, toys, etc.).
 */
export const TEACHER_PORTRAITS = [
  // Woman educator – professional portrait
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
  // Man educator – suit portrait
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&h=256&q=80',
  // Woman teacher – smiling
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80',
  // Man teacher – glasses
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&h=256&q=80',
  // Woman educator – hijab-friendly professional
  'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=256&h=256&q=80',
  // Man teacher – classroom vibe
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
  // Woman educator – warm smile
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&h=256&q=80',
  // Man educator – approachable
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
];

/** Local portraits shipped with the app (offline-safe fallbacks). */
export const LOCAL_PORTRAITS = [
  '/images/portrait-1.jpg',
  '/images/portrait-2.jpg',
  '/images/portrait-3.jpg',
];

/**
 * Pick a stable teacher portrait for a tutor id / index.
 * Same id always gets the same face (no flicker on re-render).
 */
export function getTeacherPortrait(seed) {
  const str = String(seed ?? '0');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return TEACHER_PORTRAITS[hash % TEACHER_PORTRAITS.length];
}

/**
 * Prefer a real stored photo only if it looks like a proper profile image.
 * Otherwise return a curated teacher portrait.
 */
export function resolveTutorImage(storedUrl, seed) {
  if (!storedUrl || typeof storedUrl !== 'string') {
    return getTeacherPortrait(seed);
  }

  const url = storedUrl.trim().toLowerCase();

  // Skip generic avatar generators / empty placeholders
  const isGeneric =
    url.includes('ui-avatars.com') ||
    url.includes('placeholder') ||
    url.includes('dicebear') ||
    url.includes('pravatar') ||
    url.endsWith('/null') ||
    url === 'null';

  if (isGeneric) return getTeacherPortrait(seed);

  return storedUrl;
}
