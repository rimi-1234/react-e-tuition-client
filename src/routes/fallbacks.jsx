import { LoadingRegion, Skeleton, SkeletonText, StatCardSkeleton, TableSkeleton } from '../components/ui';
import { LogoMark } from '../components/ui/misc';

/** Lazy-route placeholder for public pages: a page-shaped skeleton, not a spinner. */
export function PageFallback() {
  return (
    <LoadingRegion label="Loading page" className="container-page pb-20 pt-32">
      <Skeleton className="mb-4 h-4 w-28 rounded-full" />
      <Skeleton className="mb-3 h-12 w-3/4 max-w-2xl" />
      <SkeletonText lines={2} className="max-w-xl" />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-56 rounded-[var(--radius-box)]" />
        ))}
      </div>
    </LoadingRegion>
  );
}

export function DashboardFallback() {
  return (
    <LoadingRegion label="Loading dashboard">
      <Skeleton className="mb-2 h-8 w-64" />
      <Skeleton className="mb-8 h-4 w-96 max-w-full" />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <TableSkeleton />
    </LoadingRegion>
  );
}

/** First paint while Firebase restores the session. */
export function AppSplash() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-5 bg-base-200" role="status" aria-live="polite">
      <div className="relative">
        <span className="absolute inset-0 animate-ping rounded-2xl bg-primary/20" aria-hidden />
        <LogoMark className="relative size-14" />
      </div>
      <span className="sr-only">Loading Edurock…</span>
      <div className="h-1 w-32 overflow-hidden rounded-full bg-soft">
        <div className="skeleton-shimmer h-full w-full" />
      </div>
    </div>
  );
}
