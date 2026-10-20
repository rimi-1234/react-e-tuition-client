import { useState } from 'react';
import { Link } from 'react-router';
import ReactPaginate from 'react-paginate';
import { ChevronLeft, ChevronRight, Moon, Star, Sun } from 'lucide-react';
import { useTheme } from '../../providers/ThemeProvider';
import { cn } from '../../utils/cn';

/* ── Brand: typographic wordmark — no icon ─────────────────────────── */
export function Logo({ className, to = '/', compact }) {
  return (
    <Link to={to} className={cn('group inline-flex items-baseline leading-none', className)} aria-label="Edurock home">
      <span
        className={cn(
          'font-display font-semibold tracking-[-0.03em] text-base-content transition-colors group-hover:text-primary',
          compact ? 'text-[1.2rem]' : 'text-[1.5rem]',
        )}
      >
        Edu<span className="text-primary">rock</span>
      </span>
    </Link>
  );
}

/** Lettermark for splash / chat avatars — the letter E, not a pictorial icon. */
export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" rx="10" className="fill-primary" />
      <text
        x="20"
        y="28"
        textAnchor="middle"
        fill="currentColor"
        className="fill-primary-content"
        style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '22px', fontWeight: 650 }}
      >
        E
      </text>
    </svg>
  );
}

/* ── Theme toggle with a rotating sun/moon ─────────────────────────── */
export function ThemeToggle({ className }) {
  const { resolved, toggleTheme } = useTheme();
  const dark = resolved === 'dark';
  return (
    <button
      onClick={toggleTheme}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className={cn('relative flex size-10 items-center justify-center overflow-hidden rounded-xl text-base-content/75 transition-colors hover:bg-soft hover:text-base-content', className)}
    >
      <Sun className={cn('absolute size-[18px] transition-all duration-500 ease-out-soft', dark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100')} />
      <Moon className={cn('absolute size-[18px] transition-all duration-500 ease-out-soft', dark ? 'rotate-0 scale-100' : '-rotate-90 scale-0 opacity-0')} />
    </button>
  );
}

/* ── Section heading used on marketing pages ───────────────────────── */
export function SectionHeading({ eyebrow, title, description, align = 'center', className, children }) {
  return (
    <div className={cn('max-w-2xl', align === 'center' ? 'mx-auto text-center' : 'text-left', className)}>
      {eyebrow && (
        <p className={cn('mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary', align === 'center' && 'justify-center')}>
          <span className="h-px w-6 bg-primary/50" aria-hidden />
          {eyebrow}
        </p>
      )}
      {typeof title === 'string' ? <h2 className="text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-[2.75rem]">{title}</h2> : title}
      {description && <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{description}</p>}
      {children}
    </div>
  );
}

/* ── Rating stars (display) ────────────────────────────────────────── */
export function Stars({ value = 0, size = 'sm', className }) {
  const px = size === 'lg' ? 'size-5' : 'size-3.5';
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn(px, i <= Math.round(value) ? 'fill-accent text-accent' : 'fill-base-content/10 text-base-content/10')} aria-hidden />
      ))}
    </span>
  );
}

/* ── Rating input ──────────────────────────────────────────────────── */
export function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const labels = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];
  const shown = hover || value;
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} star${i > 1 ? 's' : ''}`}
            onMouseEnter={() => setHover(i)}
            onClick={() => onChange(i)}
            className="rounded-md p-0.5 transition-transform hover:scale-115 active:scale-95"
          >
            <Star className={cn('size-8 transition-colors', i <= shown ? 'fill-accent text-accent' : 'text-base-content/20')} />
          </button>
        ))}
      </div>
      <span className="text-sm font-medium text-muted">{labels[shown]}</span>
    </div>
  );
}

/* ── Pagination (react-paginate, themed) ───────────────────────────── */
export function Pagination({ page, totalPages, onChange, className }) {
  if (!totalPages || totalPages <= 1) return null;
  const item = 'flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-medium transition-colors';
  return (
    <nav aria-label="Pagination" className={cn('flex justify-center', className)}>
      <ReactPaginate
        forcePage={page - 1}
        pageCount={totalPages}
        onPageChange={({ selected }) => onChange(selected + 1)}
        marginPagesDisplayed={1}
        pageRangeDisplayed={2}
        previousLabel={<ChevronLeft className="size-4" aria-label="Previous page" />}
        nextLabel={<ChevronRight className="size-4" aria-label="Next page" />}
        breakLabel="…"
        containerClassName="flex flex-wrap items-center gap-1.5"
        pageLinkClassName={cn(item, 'text-base-content/75 hover:bg-soft')}
        activeLinkClassName="!bg-neutral !text-neutral-content"
        previousLinkClassName={cn(item, 'border border-soft bg-base-100 hover:border-primary/40')}
        nextLinkClassName={cn(item, 'border border-soft bg-base-100 hover:border-primary/40')}
        breakLinkClassName={cn(item, 'text-subtle')}
        disabledLinkClassName="opacity-40 pointer-events-none"
      />
    </nav>
  );
}

/* ── Segmented tabs with a sliding indicator ───────────────────────── */
export function Tabs({ tabs, value, onChange, className }) {
  return (
    <div className={cn('inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-soft bg-base-100 p-1 no-scrollbar', className)} role="tablist">
      {tabs.map((t) => {
        const tab = typeof t === 'string' ? { value: t, label: t } : t;
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-300 ease-out-soft',
              active ? 'bg-neutral text-neutral-content shadow-sm' : 'text-muted hover:text-base-content',
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn('rounded-full px-1.5 py-0.5 text-[11px] leading-none tabular-nums', active ? 'bg-neutral-content/15' : 'bg-soft')}>{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Lazy image with fade-in and graceful fallback ─────────────────── */
export function Img({ src, alt, className, imgClassName, fallback = '/images/study-notes.jpg', ...rest }) {
  const [loaded, setLoaded] = useState(false);
  const [current, setCurrent] = useState(src);
  const [prevSrc, setPrevSrc] = useState(src);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setCurrent(src);
    setLoaded(false);
  }
  return (
    <span className={cn('relative block overflow-hidden bg-soft', !loaded && 'skeleton-shimmer', className)}>
      <img
        src={current}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => current !== fallback && setCurrent(fallback)}
        className={cn('size-full object-cover transition-[opacity,transform] duration-700 ease-out-soft', loaded ? 'scale-100 opacity-100' : 'scale-105 opacity-0', imgClassName)}
        {...rest}
      />
    </span>
  );
}

/* ── Key/value row used in detail sidebars ─────────────────────────── */
export function InfoRow({ icon: Icon, label, value, className }) {
  return (
    <div className={cn('flex items-center gap-3 py-3', className)}>
      {Icon && (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-soft text-base-content/70">
          <Icon className="size-4" aria-hidden />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-xs text-subtle">{label}</p>
        <p className="truncate text-sm font-medium">{value || '—'}</p>
      </div>
    </div>
  );
}
