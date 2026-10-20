import { AlertTriangle, RefreshCw, SearchX } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

/** Friendly "nothing here yet" panel with an optional next step. */
export function EmptyState({ icon: Icon = SearchX, title, description, action, className, compact }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-[var(--radius-box)] border border-dashed border-soft bg-base-100/60 text-center',
        compact ? 'px-6 py-10' : 'px-6 py-16',
        className,
      )}
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 scale-150 rounded-full bg-primary/10 blur-xl" aria-hidden />
        <div className="relative flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-6" aria-hidden />
        </div>
      </div>
      <h3 className="font-sans text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/** Error panel with retry; shows the API's human message. */
export function ErrorState({ error, onRetry, title = 'We couldn’t load this', className }) {
  return (
    <div className={cn('flex flex-col items-center rounded-[var(--radius-box)] border border-error/20 bg-error/5 px-6 py-12 text-center', className)} role="alert">
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-error/10 text-error">
        <AlertTriangle className="size-6" aria-hidden />
      </div>
      <h3 className="font-sans text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted">{error?.message || 'Something went wrong. Please try again.'}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" leftIcon={RefreshCw} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
