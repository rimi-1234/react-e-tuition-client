import { Link } from 'react-router';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Button, Card, CardHeader, ChartSkeleton, LoadingRegion, PageHeader, Skeleton, StatCardSkeleton } from '../ui';
import { Reveal, Stagger } from '../../motion';
import { cn } from '../../utils/cn';
import { firstName } from '../../utils/format';
import { useGreeting } from './greeting';

/** Dashboard greeting: "Good evening, Rahim" + a contextual line + primary actions. */
export function GreetingHeader({ name, line, actions, eyebrow }) {
  const greeting = useGreeting();
  return <PageHeader eyebrow={eyebrow} title={`${greeting}, ${firstName(name)}`} description={line} actions={actions} />;
}

/** Responsive 1 → 2 → 4 column row of KPI tiles that fades in one by one. */
export function StatGrid({ children, className }) {
  return <Stagger className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-4', className)}>{children}</Stagger>;
}

/** Card with a title row, used for every chart / list panel on the overview. */
export function Panel({ title, description, action, className, children, delay = 0 }) {
  return (
    <Reveal delay={delay} className={cn('min-w-0', className)}>
      <Card className="h-full">
        <CardHeader title={title} description={description} action={action} />
        {children}
      </Card>
    </Reveal>
  );
}

/** "View all →" link placed in a panel header. */
export function PanelLink({ to, children = 'View all' }) {
  return (
    <Link to={to} className="group inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline">
      {children}
      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}

/** One row of an activity list. Renders a link when `to` is given. */
export function ActivityRow({ to, leading, title, meta, trailing }) {
  const body = (
    <>
      {leading}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        {meta && <p className="mt-0.5 truncate text-xs text-subtle">{meta}</p>}
      </div>
      {trailing && <div className="flex shrink-0 flex-col items-end gap-1 text-right">{trailing}</div>}
      {to && <ChevronRight className="size-4 shrink-0 text-subtle transition-transform group-hover:translate-x-0.5" aria-hidden />}
    </>
  );
  const cls = 'group -mx-2 flex items-center gap-3 rounded-xl px-2 py-3 transition-colors';
  return to ? (
    <Link to={to} className={cn(cls, 'hover:bg-soft')}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/** Divided list of ActivityRows with a calm inline empty message. */
export function ActivityList({ items, empty, children }) {
  if (!items?.length) {
    return <p className="rounded-xl border border-dashed border-soft px-4 py-8 text-center text-sm text-muted">{empty}</p>;
  }
  return <ul className="divide-y divide-base-content/7">{items.map(children)}</ul>;
}

/** Square icon tile used as the leading element of rows. */
export function IconTile({ icon: Icon, tone = 'bg-primary/10 text-primary', className }) {
  return (
    <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', tone, className)}>
      <Icon className="size-[18px]" aria-hidden />
    </span>
  );
}

/** Simple horizontal CSS bars (top subjects, etc.). */
export function HBarList({ items, empty = 'No data yet' }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (!items.length) return <p className="py-8 text-center text-sm text-muted">{empty}</p>;
  return (
    <Stagger as="ul" className="space-y-4" stagger={0.06}>
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-medium">{item.label}</span>
            <span className="shrink-0 tabular-nums text-muted">{item.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-soft" aria-hidden>
            <div className="h-full rounded-full bg-primary/80" style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </Stagger>
  );
}

/** Quick action tile list (icon + label + description). */
export function QuickActions({ actions }) {
  return (
    <ul className="space-y-2">
      {actions.map((a) => (
        <li key={a.to}>
          <Link
            to={a.to}
            className="group flex items-center gap-3 rounded-2xl border border-soft p-3 transition-[border-color,transform,background-color] duration-300 ease-out-soft hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5"
          >
            <IconTile icon={a.icon} tone={a.tone} />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{a.label}</span>
              {a.description && <span className="block truncate text-xs text-subtle">{a.description}</span>}
            </span>
            <ArrowRight className="size-4 shrink-0 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Numbered onboarding steps with a call to action. */
export function StepsCard({ title, description, steps, action }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-16 -top-16 size-56 glow-primary" aria-hidden />
      <div className="relative">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {description && <p className="mt-1.5 max-w-xl text-sm text-muted">{description}</p>}
        <Stagger as="ol" className="mt-6 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-soft bg-base-100 p-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-content">{i + 1}</span>
                {s.icon && <s.icon className="size-5 text-primary" aria-hidden />}
              </div>
              <p className="font-semibold">{s.title}</p>
              <p className="mt-1 text-sm text-muted">{s.text}</p>
            </li>
          ))}
        </Stagger>
        {action && <div className="mt-6">{action}</div>}
      </div>
    </Card>
  );
}

/** Dark call-to-action banner. */
export function CtaBanner({ title, text, to, label, icon }) {
  return (
    <Reveal>
      <div className="relative overflow-hidden rounded-[var(--radius-box)] bg-neutral p-6 text-neutral-content sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-20 size-64 glow-primary" aria-hidden />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 size-56 glow-accent" aria-hidden />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <h2 className="text-2xl font-semibold">{title}</h2>
            <p className="mt-1.5 text-sm opacity-75">{text}</p>
          </div>
          <Button to={to} variant="accent" rightIcon={icon || ArrowRight} className="self-start sm:self-auto">
            {label}
          </Button>
        </div>
      </div>
    </Reveal>
  );
}

/** Loading layout shared by all three overviews. */
export function OverviewSkeleton() {
  return (
    <LoadingRegion label="Loading your dashboard" className="space-y-6">
      <div className="mb-8 space-y-3">
        <Skeleton className="h-8 w-72 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <ChartSkeleton />
      </div>
    </LoadingRegion>
  );
}
