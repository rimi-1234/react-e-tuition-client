import { cn } from '../../utils/cn';

const tones = {
  neutral: 'bg-soft text-base-content/75',
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/15 text-[color-mix(in_oklab,var(--color-accent)_70%,var(--color-base-content))]',
  success: 'bg-success/12 text-success',
  warning: 'bg-warning/14 text-warning',
  error: 'bg-error/10 text-error',
  info: 'bg-info/10 text-info',
  outline: 'border border-soft text-base-content/75',
};

export function Badge({ tone = 'neutral', icon: Icon, dot, className, children }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium leading-none', tones[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {Icon && <Icon className="size-3.5" aria-hidden />}
      {children}
    </span>
  );
}

const STATUS_TONE = {
  Pending: 'warning',
  Approved: 'success',
  Booked: 'primary',
  Rejected: 'error',
  paid: 'success',
  refunded: 'neutral',
  new: 'info',
  read: 'neutral',
  archived: 'neutral',
};
const STATUS_LABEL = { Approved: 'Live', paid: 'Paid' };

/** Consistent colours for tuition / application / payment statuses everywhere. */
export function StatusBadge({ status, labels = {}, className }) {
  return (
    <Badge tone={STATUS_TONE[status] || 'neutral'} dot className={className}>
      {labels[status] || STATUS_LABEL[status] || status}
    </Badge>
  );
}
