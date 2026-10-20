/**
 * Responsive Unsplash helpers. Unsplash's CDN resizes and re-encodes on the
 * fly (`auto=format` serves AVIF/WebP), so each screen downloads only the
 * width it needs via srcSet.
 */
const base = (id, w, q = 72) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;

export function unsplash(id, { widths = [640, 1024, 1440, 1920], quality = 68 } = {}) {
  return {
    src: base(id, widths[Math.min(2, widths.length - 1)], quality),
    srcSet: widths.map((w) => `${base(id, w, quality)} ${w}w`).join(', '),
  };
}

/** Curated photos, each paired with a local fallback that works offline. */
export const PHOTOS = {
  hero: { ...unsplash('1522202176988-66273c2fd55f'), fallback: '/images/students-collab.jpg', alt: 'Students learning together around laptops' },
  classroom: { ...unsplash('1509062522246-3755977927d7'), fallback: '/images/lecture.jpg', alt: 'A teacher leading a lively classroom' },
  library: { ...unsplash('1427504494785-3a9ca7044f45'), fallback: '/images/study-notes.jpg', alt: 'A student walking through a library aisle' },
  books: { ...unsplash('1497633762265-9d179a990aa6'), fallback: '/images/study-notes.jpg', alt: 'A colourful stack of books' },
  desk: { ...unsplash('1503676260728-1c00da094a0b', { widths: [480, 800, 1200] }), fallback: '/images/study-notes.jpg', alt: 'Books, an apple and alphabet blocks on a desk' },
  focus: { ...unsplash('1513258496099-48168024aec0', { widths: [480, 800, 1200] }), fallback: '/images/tutor-session.jpg', alt: 'A student concentrating on an online lesson' },
};
