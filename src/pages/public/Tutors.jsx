import { useEffect, useState } from 'react';
import { BadgeCheck, MapPin, RotateCcw, Search, X } from 'lucide-react';
import { TutorCard } from '../../components/tutor/TutorCard';
import { Button, EmptyState, ErrorState, Input, LoadingRegion, Pagination, Select, TutorCardSkeleton } from '../../components/ui';
import { PageHero } from '../../components/ui/PageHero';
import { PHOTOS } from '../../utils/images';
import { useSubjects, useTutors } from '../../hooks/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useDebounce, useUrlFilters } from '../../hooks/useUrlState';
import { Stagger, useMotion } from '../../motion';
import { cn } from '../../utils/cn';
import { TEACHING_MODES, TUTOR_SORTS } from '../../utils/constants';
import { plural } from '../../utils/format';

const DEFAULTS = { search: '', subject: '', location: '', teachingMode: '', verified: '', sort: 'rating', page: 1 };

/** Text input bound to a URL filter, debounced, and resynced when the URL resets. */
function useDebouncedFilter(value, onCommit) {
  const [text, setText] = useState(value);
  const debounced = useDebounce(text);
  const [prev, setPrev] = useState(value);
  if (value !== prev) {
    setPrev(value);
    if (value !== debounced) setText(value);
  }
  useEffect(() => {
    if (debounced !== value) onCommit(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);
  return [text, setText];
}

export default function Tutors() {
  useDocumentTitle('Find a tutor');
  const [filters, setFilters, reset, activeCount] = useUrlFilters(DEFAULTS);
  const [search, setSearch] = useDebouncedFilter(filters.search, (v) => setFilters({ search: v }));
  const [location, setLocation] = useDebouncedFilter(filters.location, (v) => setFilters({ location: v }));
  const { data: subjects } = useSubjects();
  const { scrollTo } = useMotion();

  const { data, isPending, isFetching, error, refetch } = useTutors({ ...filters, limit: 12 });
  const items = data?.items || [];
  const meta = data?.meta;

  return (
    <>
      <PageHero
        photo={PHOTOS.classroom}
        eyebrow="Tutors"
        title={'Learn from people\nwho love teaching.'}
        highlight={['love']}
        description="Browse verified tutors by subject and area. Ratings come only from families who hired them."
      />

      <section className="container-page pb-10">
        {/* Filter bar */}
        <div className="relative mb-8 rounded-[1.4rem] border border-soft bg-base-100 p-3 shadow-[var(--shadow-soft)]">
          <div className="grid gap-2 md:grid-cols-[1.4fr_1fr_1fr_auto_auto]">
            <Input aria-label="Search tutors" icon={Search} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, subject, university…" />
            <Select
              aria-label="Subject"
              value={filters.subject}
              onChange={(e) => setFilters({ subject: e.target.value })}
              placeholder="All subjects"
              options={(subjects || []).filter((s) => s.tutors > 0).map((s) => ({ value: s.subject, label: `${s.subject} (${s.tutors})` }))}
            />
            <Input aria-label="Area" icon={MapPin} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Area" />
            <Select aria-label="Sort tutors" value={filters.sort} onChange={(e) => setFilters({ sort: e.target.value })} options={TUTOR_SORTS} />
            <button
              onClick={() => setFilters({ verified: filters.verified ? '' : 'true' })}
              aria-pressed={Boolean(filters.verified)}
              className={cn(
                'inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors',
                filters.verified ? 'border-primary bg-primary/10 text-primary' : 'border-soft hover:border-base-content/20',
              )}
            >
              <BadgeCheck className="size-4" /> Verified only
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 px-1">
            {['', ...TEACHING_MODES].map((m) => (
              <button
                key={m || 'any'}
                onClick={() => setFilters({ teachingMode: m })}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  filters.teachingMode === m ? 'bg-neutral text-neutral-content' : 'text-muted hover:bg-soft',
                )}
              >
                {m || 'Any mode'}
              </button>
            ))}
            {activeCount > 0 && (
              <button onClick={reset} className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                <X className="size-3.5" /> Clear filters
              </button>
            )}
          </div>
        </div>

        <p id="results" className="mb-5 text-sm text-muted" aria-live="polite">
          {meta ? (
            <>
              <span className="font-semibold text-base-content">{plural(meta.total, 'tutor')}</span> available
            </>
          ) : (
            'Finding tutors…'
          )}
        </p>

        {error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : isPending ? (
          <LoadingRegion label="Loading tutors" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <TutorCardSkeleton key={i} />
            ))}
          </LoadingRegion>
        ) : items.length === 0 ? (
          <EmptyState
            title="No tutors match yet"
            description="Try another subject or area, or post a tuition and let tutors come to you."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="outline" leftIcon={RotateCcw} onClick={reset}>
                  Clear filters
                </Button>
                <Button to="/dashboard/post-tuition">Post a tuition</Button>
              </div>
            }
          />
        ) : (
          <Stagger
            key={`${filters.page}-${filters.sort}-${filters.subject}-${filters.verified}`}
            className={cn('grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', isFetching && 'opacity-60')}
            stagger={0.05}
          >
            {items.map((t) => (
              <TutorCard key={t.id} tutor={t} />
            ))}
          </Stagger>
        )}

        <Pagination
          className="mt-10"
          page={filters.page}
          totalPages={meta?.totalPages}
          onChange={(page) => {
            setFilters({ page });
            scrollTo('#results', { offset: -200 });
          }}
        />
      </section>
    </>
  );
}
