const bdt = new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 });

/** ৳ 6,000 */
export const money = (n) => `৳${bdt.format(Math.round(Number(n) || 0))}`;

/** 6.5k style compact numbers for stats. */
export const compact = (n) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(n) || 0);

export const date = (d, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  d ? new Date(d).toLocaleDateString('en-GB', opts) : '—';

export const dateTime = (d) =>
  d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const UNITS = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];
/** "3 days ago", "just now" */
export function timeAgo(d) {
  if (!d) return '';
  const seconds = (new Date(d).getTime() - Date.now()) / 1000;
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return 'just now';
}

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'U';

export const plural = (n, word, pluralWord = `${word}s`) => `${n} ${n === 1 ? word : pluralWord}`;

export const firstName = (name = '') => name.split(' ')[0] || 'there';

/** True when the date is within the last `days` days. */
export const isRecent = (d, days = 3) => Boolean(d) && Date.now() - new Date(d).getTime() < days * 86_400_000;
