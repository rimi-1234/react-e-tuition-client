import { cn } from '../../utils/cn';

/** Surface primitive. `interactive` adds the lift-on-hover treatment. */
export function Card({ as: Tag = 'div', interactive, padded = true, className, children, ...rest }) {
  return (
    <Tag
      className={cn(
        'rounded-[var(--radius-box)] border border-soft bg-base-100 shadow-[var(--shadow-soft)]',
        padded && 'p-5 sm:p-6',
        interactive && 'transition-[transform,box-shadow,border-color] duration-300 ease-out-soft hover:-translate-y-1 hover:border-primary/25 hover:shadow-[var(--shadow-lift)]',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ title, description, action, className }) {
  return (
    <div className={cn('mb-5 flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <h3 className="font-sans text-base font-semibold tracking-tight">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
