import { useState } from 'react';
import { Link } from 'react-router';
import { Eye, FilePlus2, Info, PencilLine, Trash2, Users } from 'lucide-react';
import {
  Button,
  DataTable,
  EmptyState,
  ErrorState,
  IconButton,
  PageHeader,
  StatusBadge,
  TableSkeleton,
  Tabs,
  confirmAction,
} from '../../../components/ui';
import { useDeleteTuition, useMyTuitions } from '../../../hooks/useApi';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { date, money } from '../../../utils/format';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'Pending', label: 'In review' },
  { value: 'Approved', label: 'Live' },
  { value: 'Booked', label: 'Booked' },
  { value: 'Rejected', label: 'Needs changes' },
];

export default function MyTuitions() {
  useDocumentTitle('My tuitions');
  const [status, setStatus] = useState('all');
  const { data, isPending, error, refetch } = useMyTuitions({ status, limit: 50 });
  const remove = useDeleteTuition();
  const items = data?.items || [];

  const onDelete = async (t) => {
    const ok = await confirmAction({
      title: 'Delete this tuition?',
      text: `“${t.title}” and its pending applications will be removed. This can’t be undone.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (ok) remove.mutate(t.id);
  };

  const columns = [
    {
      key: 'title',
      header: 'Tuition',
      primary: true,
      render: (t) => (
        <div className="min-w-0 max-w-sm">
          <Link to={`/tuitions/${t.id}`} className="line-clamp-1 font-semibold hover:text-primary">
            {t.title}
          </Link>
          <p className="mt-0.5 text-xs text-subtle">
            {t.subject} · {t.classLevel} · {t.location}
          </p>
          {t.status === 'Rejected' && t.rejectionReason && (
            <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-error/8 px-2.5 py-1.5 text-xs text-error">
              <Info className="mt-px size-3.5 shrink-0" /> {t.rejectionReason}
            </p>
          )}
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} labels={{ Pending: 'In review' }} /> },
    { key: 'budget', header: 'Budget', render: (t) => <span className="font-medium tabular-nums">{money(t.budget)}</span> },
    {
      key: 'applicants',
      header: 'Applicants',
      render: (t) =>
        t.applicationsCount ? (
          <Link to={`/dashboard/applied-tutors?tuitionId=${t.id}`} className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
            <Users className="size-4" /> {t.applicationsCount}
          </Link>
        ) : (
          <span className="text-subtle">None yet</span>
        ),
    },
    { key: 'createdAt', header: 'Posted', hideOnMobile: true, render: (t) => <span className="text-muted">{date(t.createdAt)}</span> },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'text-right',
      fullWidthOnMobile: true,
      render: (t) => (
        <div className="flex justify-end gap-1">
          <IconButton icon={Eye} label="View" size="icon-sm" to={`/tuitions/${t.id}`} />
          <IconButton icon={PencilLine} label="Edit" size="icon-sm" to={`/dashboard/edit-tuition/${t.id}`} disabled={t.status === 'Booked'} className={t.status === 'Booked' ? 'pointer-events-none opacity-40' : ''} />
          <IconButton icon={Trash2} label="Delete" size="icon-sm" variant="danger-soft" onClick={() => onDelete(t)} disabled={t.status === 'Booked'} />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="My tuitions"
        description="Everything you’ve posted. Edits to a live post send it back for a quick review."
        actions={
          <Button to="/dashboard/post-tuition" leftIcon={FilePlus2}>
            Post a tuition
          </Button>
        }
      />
      <Tabs tabs={TABS} value={status} onChange={setStatus} className="mb-6" />

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isPending ? (
        <TableSkeleton />
      ) : items.length === 0 ? (
        <EmptyState
          icon={FilePlus2}
          title={status === 'all' ? 'You haven’t posted a tuition yet' : 'Nothing in this tab'}
          description="Describe what you need and verified tutors will start applying, usually within a day."
          action={<Button to="/dashboard/post-tuition">Post your first tuition</Button>}
        />
      ) : (
        <DataTable columns={columns} rows={items} caption="Your tuition posts" />
      )}
    </>
  );
}
