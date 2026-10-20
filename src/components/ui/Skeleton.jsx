import { cn } from '../../utils/cn';
import { Card } from './Card';

/** Base shimmer block. Size it with utility classes. */
export const Skeleton = ({ className, rounded = 'rounded-lg', ...rest }) => (
  <div aria-hidden className={cn('skeleton-shimmer', rounded, className)} {...rest} />
);

export const SkeletonText = ({ lines = 3, className }) => (
  <div className={cn('space-y-2', className)} aria-hidden>
    {Array.from({ length: lines }, (_, i) => (
      <Skeleton key={i} className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')} />
    ))}
  </div>
);

/** Wrapper announcing a loading region to assistive tech exactly once. */
export const LoadingRegion = ({ label = 'Loading', className, children }) => (
  <div role="status" aria-live="polite" aria-busy="true" className={className}>
    <span className="sr-only">{label}…</span>
    {children}
  </div>
);

export const TuitionCardSkeleton = () => (
  <Card padded={false} className="flex flex-col overflow-hidden">
    <Skeleton className="aspect-video w-full" rounded="rounded-none" />
    <div className="flex flex-col gap-4 p-5">
      <Skeleton className="h-6 w-4/5" />
      <SkeletonText lines={2} />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-soft pt-4">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  </Card>
);

export const TutorCardSkeleton = () => (
  <Card className="flex flex-col items-center gap-3 text-center">
    <Skeleton className="size-20" rounded="rounded-full" />
    <Skeleton className="h-5 w-32" />
    <Skeleton className="h-3 w-40" />
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <Skeleton className="mt-2 h-10 w-full rounded-xl" />
  </Card>
);

export const StatCardSkeleton = () => (
  <Card className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="size-10 rounded-xl" />
    </div>
    <Skeleton className="h-8 w-28" />
    <Skeleton className="h-3 w-20" />
  </Card>
);

export const TableSkeleton = ({ rows = 6, cols = 4 }) => (
  <Card padded={false} className="overflow-hidden">
    <div className="border-b border-soft px-5 py-4">
      <Skeleton className="h-4 w-40" />
    </div>
    {Array.from({ length: rows }, (_, r) => (
      <div key={r} className="flex items-center gap-4 border-b border-soft px-5 py-4 last:border-0">
        <Skeleton className="size-9" rounded="rounded-full" />
        {Array.from({ length: cols - 1 }, (_, c) => (
          <Skeleton key={c} className={cn('h-3', c === 0 ? 'w-1/4' : 'w-1/6')} />
        ))}
      </div>
    ))}
  </Card>
);

export const ChartSkeleton = ({ height = 'h-72' }) => (
  <Card>
    <Skeleton className="mb-6 h-4 w-40" />
    <div className={cn('flex items-end gap-2', height)}>
      {[40, 65, 50, 80, 55, 90, 70, 60, 85, 45, 75, 95].map((h, i) => (
        <Skeleton key={i} className="flex-1" rounded="rounded-md" style={{ height: `${h}%` }} />
      ))}
    </div>
  </Card>
);

export const DetailSkeleton = () => (
  <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
    <div className="space-y-6">
      <Skeleton className="h-6 w-32 rounded-full" />
      <Skeleton className="h-12 w-4/5" />
      <SkeletonText lines={2} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
      <SkeletonText lines={6} />
    </div>
    <Skeleton className="h-80 rounded-3xl" />
  </div>
);
