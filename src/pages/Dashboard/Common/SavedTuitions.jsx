import { Bookmark, Search } from 'lucide-react';
import { TuitionCard } from '../../../components/tuition/TuitionCard';
import { Button, EmptyState, ErrorState, LoadingRegion, PageHeader, TuitionCardSkeleton } from '../../../components/ui';
import { useBookmarks } from '../../../hooks/useApi';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Stagger } from '../../../motion';
import { plural } from '../../../utils/format';

const GRID = 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3';

export default function SavedTuitions() {
  useDocumentTitle('Saved tuitions');
  const { data, isPending, error, refetch } = useBookmarks();
  // A bookmark can outlive its tuition (deleted post); skip those.
  const saved = (data || []).filter((b) => b.tuition);

  return (
    <>
      <PageHeader
        title="Saved tuitions"
        description={
          saved.length
            ? `${plural(saved.length, 'tuition')} you’ve bookmarked. Tap the bookmark again to remove one.`
            : 'Bookmark tuitions while browsing and they’ll wait for you here.'
        }
        actions={
          <Button variant="outline" to="/tuitions" leftIcon={Search}>
            Browse tuitions
          </Button>
        }
      />

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isPending ? (
        <LoadingRegion label="Loading saved tuitions" className={GRID}>
          {Array.from({ length: 6 }, (_, i) => (
            <TuitionCardSkeleton key={i} />
          ))}
        </LoadingRegion>
      ) : saved.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved tuitions yet"
          description="Tap the bookmark on any tuition to keep it here and come back to it later."
          action={<Button to="/tuitions">Find tuitions</Button>}
        />
      ) : (
        <Stagger as="ul" className={GRID}>
          {saved.map((b) => (
            <li key={b.id}>
              <TuitionCard tuition={b.tuition} showStatus={Boolean(b.tuition.status) && b.tuition.status !== 'Approved'} />
            </li>
          ))}
        </Stagger>
      )}
    </>
  );
}
