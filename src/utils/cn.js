/** Join class names, skipping falsy values: cn('a', cond && 'b') */
export const cn = (...parts) => parts.flat().filter(Boolean).join(' ');
