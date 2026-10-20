import { CountUp } from '../../motion';
import { cn } from '../../utils/cn';
import { Card } from './Card';

const toneBg = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/15 text-accent',
  success: 'bg-success/12 text-success',
  warning: 'bg-warning/14 text-warning',
  error: 'bg-error/10 text-error',
  info: 'bg-info/10 text-info',
};

/** KPI tile: label, animated value, optional hint and icon. */
export function StatCard({ label, value, format, prefix, suffix, hint, icon: Icon, tone = 'primary', className }) {
  const numeric = typeof value === 'number';
  return (
    <Card className={cn('group relative overflow-hidden', className)}>
      <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-primary/5 transition-transform duration-700 ease-out-soft group-hover:scale-150" aria-hidden />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted">{label}</p>
        {Icon && (
          <span className={cn('flex size-10 items-center justify-center rounded-xl', toneBg[tone])}>
            <Icon className="size-5" aria-hidden />
          </span>
        )}
      </div>
      <p className="relative mt-3 font-display text-3xl font-semibold tracking-tight">
        {numeric ? <CountUp to={value} format={format} prefix={prefix} suffix={suffix} duration={1.2} /> : value}
      </p>
      {hint && <p className="relative mt-1.5 text-xs text-subtle">{hint}</p>}
    </Card>
  );
}

/** Title row at the top of every dashboard page. */
export function PageHeader({ title, description, actions, eyebrow, className }) {
  return (
    <div className={cn('mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>}
        <h1 className="text-[1.75rem] font-semibold leading-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/**
 * Table on tablet/desktop, stacked cards on phones — same column config.
 *
 *   columns: [{ key, header, render?(row), className?, hideOnMobile?, primary? }]
 * The `primary` column becomes the card title on mobile.
 */
export function DataTable({ columns, rows, rowKey = (r) => r.id, onRowClick, className, caption }) {
  const primary = columns.find((c) => c.primary) || columns[0];
  const rest = columns.filter((c) => c !== primary && !c.hideOnMobile);
  const cell = (c, row) => (c.render ? c.render(row) : row[c.key]);

  return (
    <div className={className}>
      {/* Desktop table */}
      <Card padded={false} className="hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            {caption && <caption className="sr-only">{caption}</caption>}
            <thead>
              <tr className="border-b border-soft bg-soft/60">
                {columns.map((c) => (
                  <th key={c.key} scope="col" className={cn('whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-subtle', c.className)}>
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn('border-b border-soft transition-colors last:border-0 hover:bg-soft/50', onRowClick && 'cursor-pointer')}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={cn('px-5 py-4 align-middle', c.className)}>
                      {cell(c, row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile cards */}
      <ul className="space-y-3 md:hidden">
        {rows.map((row) => (
          <li key={rowKey(row)}>
            <Card className="p-4!" onClick={onRowClick ? () => onRowClick(row) : undefined}>
              <div className="mb-3">{cell(primary, row)}</div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                {rest.map((c) => (
                  <div key={c.key} className={cn('min-w-0', c.fullWidthOnMobile && 'col-span-2')}>
                    <dt className="text-[11px] font-medium uppercase tracking-wider text-subtle">{c.header}</dt>
                    <dd className="mt-1 text-sm">{cell(c, row)}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
