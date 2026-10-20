import { Link } from 'react-router';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const base =
  'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-medium ' +
  'transition-[background-color,color,box-shadow,transform,border-color] duration-200 ease-out-soft ' +
  'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

const variants = {
  primary: 'bg-primary text-primary-content shadow-[0_1px_0_rgb(255_255_255/0.18)_inset,var(--shadow-glow)] hover:brightness-110 hover:-translate-y-px',
  accent: 'bg-accent text-accent-content hover:brightness-105 hover:-translate-y-px shadow-[0_10px_30px_-12px_var(--color-accent)]',
  dark: 'bg-neutral text-neutral-content hover:opacity-90 hover:-translate-y-px',
  secondary: 'bg-primary/10 text-primary hover:bg-primary/15',
  outline: 'border border-soft bg-base-100 text-base-content hover:border-primary/40 hover:text-primary',
  ghost: 'text-base-content/80 hover:bg-soft hover:text-base-content',
  danger: 'bg-error text-error-content hover:brightness-110',
  'danger-soft': 'bg-error/10 text-error hover:bg-error/15',
  success: 'bg-success/12 text-success hover:bg-success/20',
  link: 'text-primary underline-offset-4 hover:underline px-0! h-auto!',
};

const sizes = {
  xs: 'h-8 px-3 text-xs rounded-lg',
  sm: 'h-9 px-3.5 text-sm rounded-xl',
  md: 'h-11 px-5 text-sm rounded-xl',
  lg: 'h-13 px-7 text-base rounded-2xl',
  icon: 'size-10 rounded-xl',
  'icon-sm': 'size-8 rounded-lg',
};

/**
 * The one button for the whole app.
 * Renders a <Link> when `to` is given, an <a> for `href`, else a <button>.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon: Left,
  rightIcon: Right,
  to,
  href,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}) {
  const classes = cn(base, variants[variant], sizes[size], className);
  const content = (
    <>
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : Left && <Left className="size-4 shrink-0" aria-hidden />}
      {/* inline-flex keeps any inline icons and text on one line (svgs are display:block globally) */}
      {children && <span className={cn('inline-flex items-center gap-2', loading && size.startsWith('icon') && 'sr-only')}>{children}</span>}
      {Right && !loading && <Right className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={cn('group', classes)} {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={cn('group', classes)} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button type={type} className={cn('group', classes)} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  );
}

export function IconButton({ label, icon: Icon, size = 'icon', variant = 'ghost', className, ...rest }) {
  return (
    <Button variant={variant} size={size} aria-label={label} title={label} className={className} {...rest}>
      <Icon className={size === 'icon-sm' ? 'size-4' : 'size-[18px]'} aria-hidden />
    </Button>
  );
}
