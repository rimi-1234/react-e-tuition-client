import { compact, money } from '../../utils/format';

/** Resolve a series colour: a token name ('primary', 'accent' …), a raw value, or the n-th categorical colour. */
export const resolveColor = (colors, color, index = 0) => (color ? colors[color] || color : colors.series[index % colors.series.length] || colors.primary);

/** Value formatter for tooltips. */
export const valueFormatter = (format, isMoney) => format || (isMoney ? money : (v) => new Intl.NumberFormat('en').format(v ?? 0));

/** Short axis tick formatter (৳12k, 1.2k). */
export const tickFormatter = (isMoney) => (v) => (isMoney ? `৳${compact(v)}` : compact(v));

/** SVG ids can't contain the punctuation React's useId emits. */
export const svgId = (id) => id.replace(/[^a-zA-Z0-9_-]/g, '');

export const isAllZero = (data, keys) => !data?.length || data.every((d) => keys.every((k) => !Number(d[k])));
