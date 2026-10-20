import { useEffect, useState } from 'react';
import { MapPin, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { TuitionCard } from '../../components/tuition/TuitionCard';
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Input,
  LoadingRegion,
  Modal,
  Pagination,
  Select,
  TuitionCardSkeleton,
} from '../../components/ui';
import { PageHero } from '../../components/ui/PageHero';
import { PHOTOS } from '../../utils/images';
import { useSubjects, useTuitions } from '../../hooks/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useDebounce, useUrlFilters } from '../../hooks/useUrlState';
import { Stagger, useMotion } from '../../motion';
import { CLASS_LEVELS, TEACHING_MODES, TUITION_SORTS } from '../../utils/constants';
import { plural } from '../../utils/format';

const DEFAULTS = { search: '', subject: '', location: '', classLevel: '', teachingMode: '', minBudget: '', maxBudget: '', sort: 'newest', page: 1 };
const BUDGETS = [
  { label: 'Any budget', min: '', max: '' },
  { label: 'Under ৳4,000', min: '', max: '4000' },
  { label: '৳4,000 – ৳8,000', min: '4000', max: '8000' },
  { label: '৳8,000 – ৳12,000', min: '8000', max: '12000' },
  { label: '৳12,000+', min: '12000', max: '' },
];

function Filters({ filters, setFilters }) {
  const { data: subjects } = useSubjects();
  const [location, setLocation] = useState(filters.location);
  const debouncedLocation = useDebounce(location);
  // Resync when the URL changes from outside (Reset, back button).
  const [urlLocation, setUrlLocation] = useState(filters.location);
  if (filters.location !== urlLocation) {
    setUrlLocation(filters.location);
    if (filters.location !== debouncedLocation) setLocation(filters.location);
  }

  useEffect(() => {
    if (debouncedLocation !== filters.location) setFilters({ location: debouncedLocation });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedLocation]);

  const budgetValue = BUDGETS.findIndex((b) => b.min === filters.minBudget && b.max === filters.maxBudget);

  return (
    <div className="space-y-5">
      <Select
        label="Subject"
        value={filters.subject}
        onChange={(e) => setFilters({ subject: e.target.value })}
        placeholder="All subjects"
        options={(subjects || []).map((s) => ({ value: s.subject, label: `${s.subject} (${s.tuitions})` }))}
      />
      <Select label="Class / level" value={filters.classLevel} onChange={(e) => setFilters({ classLevel: e.target.value })} placeholder="All levels" options={CLASS_LEVELS} />
      <Input label="Area" icon={MapPin} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Mirpur" />
      <div>
        <p className="mb-2 text-sm font-medium">Teaching mode</p>
        <div className="flex flex-wrap gap-2">
          {['', ...TEACHING_MODES].map((m) => (
            <button
              key={m || 'any'}
              onClick={() => setFilters({ teachingMode: m })}
              className={`rounded-xl border px-3 py-1.5 text-sm transition-colors ${filters.teachingMode === m ? 'border-primary bg-primary/10 text-primary' : 'border-soft bg-base-100 hover:border-base-content/20'}`}
            >
              {m || 'Any'}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">Monthly budget</p>
        <div className="space-y-1">
          {BUDGETS.map((b, i) => (
            <label key={b.label} className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 text-sm hover:bg-soft">
              <input
                type="radio"
                name="budget"
                className="radio radio-primary radio-sm"
                checked={budgetValue === i || (budgetValue === -1 && i === 0)}
                onChange={() => setFilters({ minBudget: b.min, maxBudget: b.max })}
              />
              {b.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Tuitions() {
  useDocumentTitle('Browse tuitions');
  const [filters, setFilters, reset, activeCount] = useUrlFilters(DEFAULTS);
  const [search, setSearch] = useState(filters.search);
  const debouncedSearch = useDebounce(search);
  const [urlSearch, setUrlSearch] = useState(filters.search);
  if (filters.search !== urlSearch) {
    setUrlSearch(filters.search);
    if (filters.search !== debouncedSearch) setSearch(filters.search);
  }
  const [sheetOpen, setSheetOpen] = useState(false);
  const { scrollTo } = useMotion();

  useEffect(() => {
    if (debouncedSearch !== filters.search) setFilters({ search: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const query = { ...filters, limit: 9 };
  const { data, isPending, isFetching, error, refetch } = useTuitions(query);
  const items = data?.items || [];
  const meta = data?.meta;

  const chips = [
    filters.subject && ['subject', filters.subject],
    filters.classLevel && ['classLevel', filters.classLevel],
    filters.location && ['location', filters.location],
    filters.teachingMode && ['teachingMode', filters.teachingMode],
    (filters.minBudget || filters.maxBudget) && ['budget', `৳${filters.minBudget || 0} – ${filters.maxBudget ? `৳${filters.maxBudget}` : 'any'}`],
  ].filter(Boolean);

  const clearChip = (key) => (key === 'budget' ? setFilters({ minBudget: '', maxBudget: '' }) : setFilters({ [key]: '' }));

  return (
    <>
      <PageHero
        photo={PHOTOS.library}
        eyebrow="Tuitions"
        title={'Find your next\nstudent.'}
        highlight={['student.']}
        description="Every request is reviewed by our team. Filter by subject, level, area and budget, then apply in a minute."
      >
        <label className="mt-8 flex max-w-2xl items-center gap-3 rounded-2xl border border-soft bg-base-100 px-4 shadow-[var(--shadow-soft)] focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
          <Search className="size-5 text-subtle" aria-hidden />
          <span className="sr-only">Search tuitions</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, subject, class or area…"
            className="h-14 w-full bg-transparent outline-none placeholder:text-subtle"
          />
          {search && (
            <button onClick={() => setSearch('')} className="rounded-lg p-1.5 text-subtle hover:bg-soft" aria-label="Clear search">
              <X className="size-4" />
            </button>
          )}
        </label>
      </PageHero>

      <section className="container-page grid gap-8 pb-10 lg:grid-cols-[280px_1fr]">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <div className="rounded-[var(--radius-box)] border border-soft bg-base-100 p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-sans text-base font-semibold">Filters</h2>
              {activeCount > 0 && (
                <button onClick={reset} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                  <RotateCcw className="size-3" /> Reset
                </button>
              )}
            </div>
            <Filters filters={filters} setFilters={setFilters} />
          </div>
        </aside>

        <div id="results" className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted" aria-live="polite">
              {meta ? (
                <>
                  <span className="font-semibold text-base-content">{plural(meta.total, 'tuition')}</span> found
                </>
              ) : (
                'Searching…'
              )}
              {isFetching && !isPending && <span className="ml-2 inline-block size-1.5 animate-pulse rounded-full bg-primary align-middle" />}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" leftIcon={SlidersHorizontal} className="lg:hidden" onClick={() => setSheetOpen(true)}>
                Filters {activeCount > 0 && <Badge tone="primary">{activeCount}</Badge>}
              </Button>
              <Select aria-label="Sort tuitions" value={filters.sort} onChange={(e) => setFilters({ sort: e.target.value })} options={TUITION_SORTS} className="w-44" />
            </div>
          </div>

          {chips.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {chips.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => clearChip(key)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 py-1 pl-3 pr-2 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
                >
                  {label} <X className="size-3.5" aria-label={`Remove ${label} filter`} />
                </button>
              ))}
            </div>
          )}

          {error ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : isPending ? (
            <LoadingRegion label="Loading tuitions" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <TuitionCardSkeleton key={i} />
              ))}
            </LoadingRegion>
          ) : items.length === 0 ? (
            <EmptyState
              title="No tuitions match these filters"
              description="Try a broader area, a different level, or clear the filters to see everything."
              action={
                <Button variant="outline" leftIcon={RotateCcw} onClick={reset}>
                  Clear all filters
                </Button>
              }
            />
          ) : (
            <Stagger
              key={`${filters.page}-${filters.sort}-${filters.subject}`}
              className={`grid gap-5 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${isFetching ? 'opacity-60' : ''}`}
              stagger={0.05}
            >
              {items.map((t) => (
                <TuitionCard key={t.id} tuition={t} />
              ))}
            </Stagger>
          )}

          <Pagination
            className="mt-10"
            page={filters.page}
            totalPages={meta?.totalPages}
            onChange={(page) => {
              setFilters({ page });
              scrollTo('#results', { offset: -110 });
            }}
          />
        </div>
      </section>

      <Modal
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filters"
        footer={
          <>
            <Button variant="ghost" onClick={reset} leftIcon={RotateCcw}>
              Reset
            </Button>
            <Button onClick={() => setSheetOpen(false)}>Show {meta ? plural(meta.total, 'result') : 'results'}</Button>
          </>
        }
      >
        <Filters filters={filters} setFilters={setFilters} />
      </Modal>
    </>
  );
}
