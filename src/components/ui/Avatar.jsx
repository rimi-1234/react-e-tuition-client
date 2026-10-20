import { useState } from 'react';
import { BadgeCheck } from 'lucide-react';
import { cn } from '../../utils/cn';
import { initials } from '../../utils/format';

const sizes = { xs: 'size-7 text-[10px]', sm: 'size-9 text-xs', md: 'size-11 text-sm', lg: 'size-14 text-base', xl: 'size-20 text-xl', '2xl': 'size-28 text-3xl' };

/** Hash a name to one of a few on-brand hues so fallbacks don't all look the same. */
const hues = ['from-primary/80 to-primary', 'from-accent/80 to-accent', 'from-secondary/80 to-secondary', 'from-info/70 to-primary'];
const hueFor = (name = '') => hues[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % hues.length];

export function Avatar({ src, name, size = 'md', verified, ring, className }) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;
  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <span
        className={cn(
          'inline-flex items-center justify-center overflow-hidden rounded-full font-semibold text-white',
          sizes[size],
          !showImage && `bg-linear-to-br ${hueFor(name)}`,
          ring && 'ring-4 ring-base-100',
        )}
      >
        {showImage ? (
          <img src={src} alt={name ? `${name}` : ''} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} className="size-full object-cover" />
        ) : (
          <span aria-hidden>{initials(name)}</span>
        )}
      </span>
      {verified && (
        <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-base-100 p-[1px]" title="Verified tutor">
          <BadgeCheck className={cn('fill-primary text-primary-content', size === 'xl' || size === '2xl' ? 'size-6' : 'size-4')} aria-label="Verified" />
        </span>
      )}
    </span>
  );
}
