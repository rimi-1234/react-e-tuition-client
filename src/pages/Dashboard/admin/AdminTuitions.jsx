import { useState } from 'react';
import {
  BookOpen,
  CalendarClock,
  Check,
  ExternalLink,
  Eye,
  GraduationCap,
  Info,
  MapPin,
  MonitorSmartphone,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import {
  Badge,
  Button,
  DataTable,
  EmptyState,
  ErrorState,
  IconButton,
  InfoRow,
  Modal,
  PageHeader,
  Pagination,
  StatusBadge,
  TableSkeleton,
  Tabs,
  confirmAction,
} from '../../../components/ui';
import { SearchField } from '../../../components/dashboard/SearchField';
import { TuitionApplicants } from '../../../components/dashboard/TuitionApplicants';
import { useAdminTuitions, useDeleteTuition, useModerateTuition } from '../../../hooks/useApi';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useUrlFilters } from '../../../hooks/useUrlState';
import { cn } from '../../../utils/cn';
import { date, dateTime, money, timeAgo } from '../../../utils/format';

const DEFAULTS = { status: 'Pending', search: '', page: 1 };
const TABS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Live' },
  { value: 'Booked', label: 'Booked' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
];
const LABELS = { Pending: 'In review' };
const EMPTY = {
  Pending: ['The queue is clear', 'New tuition posts land here for review before tutors can see them.'],
  Approved: ['No live tuitions', 'Approved posts that are still open to applications appear here.'],
  Booked: ['No booked tuitions yet', 'Tuitions move here once a student hires and pays a tutor.'],
  Rejected: ['Nothing rejected', 'Posts sent back to students for changes are listed here.'],
  all: ['No tuitions yet', 'Tuition posts from students will appear here.'],
};

/** Moderation buttons for one tuition. Booked tuitions can't be re-moderated. */
function ModerationButtons({ tuition: t, busy, onApprove, onReject, size = 'xs' }) {
  if (t.status === 'Booked') return null;
  return (
    <>
      {t.status !== 'Approved' && (
        <Button size={size} variant="success" leftIcon={Check} loading={busy === 'Approved'} disabled={Boolean(busy)} onClick={() => onApprove(t)} aria-label={`Approve ${t.title}`}>
          Approve
        </Button>
      )}
      {t.status !== 'Rejected' && (
        <Button size={size} variant="danger-soft" leftIcon={X} loading={busy === 'Rejected'} disabled={Boolean(busy)} onClick={() => onReject(t)} aria-label={`Reject ${t.title}`}>
          Reject
        </Button>
      )}
    </>
  );
}

function DetailsModal({ tuition, onClose, busy, onApprove, onReject }) {
  // Keep showing the last tuition while the dialog animates out.
  const [last, setLast] = useState(tuition);
  if (tuition && tuition !== last) setLast(tuition);
  const t = tuition || last;
  return (
    <Modal
      open={Boolean(tuition)}
      onClose={onClose}
      size="lg"
      title={t?.title}
      description={t ? `Posted by ${t.studentName || t.studentEmail || 'a student'} · ${timeAgo(t.createdAt)}` : undefined}
      footer={
        t && (
          <>
            <Button variant="outline" size="sm" to={`/tuitions/${t.id}`} rightIcon={ExternalLink}>
              Open public page
            </Button>
            <ModerationButtons tuition={t} busy={busy} onApprove={onApprove} onReject={onReject} size="sm" />
          </>
        )
      }
    >
      {t && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={t.status} labels={LABELS} />
            <Badge tone="primary">{t.subject}</Badge>
            <Badge>{t.classLevel}</Badge>
          </div>

          {t.status === 'Rejected' && t.rejectionReason && (
            <p className="flex items-start gap-2 rounded-xl bg-error/8 px-3.5 py-2.5 text-sm text-error">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden /> {t.rejectionReason}
            </p>
          )}

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-subtle">Description</p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-base-content/85">{t.description || '—'}</p>
          </div>

          <div className="grid gap-x-6 border-t border-soft pt-2 sm:grid-cols-2">
            <InfoRow icon={UserRound} label="Student" value={[t.studentName, t.studentEmail].filter(Boolean).join(' · ')} />
            <InfoRow icon={Wallet} label="Monthly budget" value={money(t.budget)} />
            <InfoRow icon={BookOpen} label="Subject" value={t.subject} />
            <InfoRow icon={GraduationCap} label="Class" value={t.classLevel} />
            <InfoRow icon={MapPin} label="Location" value={t.location} />
            <InfoRow icon={MonitorSmartphone} label="Teaching mode" value={t.teachingMode} />
            <InfoRow icon={CalendarClock} label="Schedule" value={t.schedule} />
            <InfoRow icon={UserRound} label="Preferred tutor" value={[t.preferredTutor === 'Any' ? 'No preference' : t.preferredTutor, t.experienceNeeded !== 'Any' && t.experienceNeeded].filter(Boolean).join(' · ')} />
            <InfoRow icon={Users} label="Applicants · views" value={`${t.applicationsCount || 0} · ${t.views || 0}`} />
            <InfoRow icon={CalendarClock} label="Posted" value={dateTime(t.createdAt)} />
          </div>

          <div className="border-t border-soft pt-5">
            <h3 className="mb-4 font-sans text-base font-semibold">Applicants &amp; contacts</h3>
            <TuitionApplicants tuitionId={t.id} />
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function AdminTuitions() {
  useDocumentTitle('Moderate tuitions');
  const [filters, setFilters] = useUrlFilters(DEFAULTS);
  const [detailsId, setDetailsId] = useState(null);
  const { data, isPending, isFetching, error, refetch } = useAdminTuitions({ ...filters, limit: 15 });
  const moderate = useModerateTuition();
  const remove = useDeleteTuition({ success: 'Tuition deleted' });
  const items = data?.items || [];
  const meta = data?.meta;
  const details = items.find((t) => t.id === detailsId) || null;

  const busyFor = (t) => (moderate.isPending && moderate.variables?.id === t.id ? moderate.variables.status : null);

  const onApprove = (t) => moderate.mutate({ id: t.id, status: 'Approved' });

  const onReject = async (t) => {
    const reason = await confirmAction({
      title: 'Reject this tuition?',
      text: `Tell ${t.studentName || 'the student'} what to change. They’ll see this note and can edit and resubmit.`,
      input: 'textarea',
      inputPlaceholder: 'e.g. Please add the class level and a clearer weekly schedule.',
      inputValidator: (v) => {
        const value = (v || '').trim();
        if (value.length < 3) return 'Please give a short reason (at least 3 characters).';
        if (value.length > 300) return 'Keep the reason under 300 characters.';
        return undefined;
      },
      confirmText: 'Reject',
      danger: true,
    });
    if (reason) moderate.mutate({ id: t.id, status: 'Rejected', reason: reason.trim() });
  };

  const onDelete = async (t) => {
    const ok = await confirmAction({
      title: 'Delete this tuition?',
      text:
        t.status === 'Booked'
          ? `“${t.title}” is booked. The post will be removed but its payment records are kept. This can’t be undone.`
          : `“${t.title}” and its pending applications will be removed. This can’t be undone.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (ok) {
      if (detailsId === t.id) setDetailsId(null);
      remove.mutate(t.id);
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Tuition',
      primary: true,
      render: (t) => (
        <div className="min-w-0 max-w-sm">
          <button type="button" onClick={() => setDetailsId(t.id)} className="line-clamp-1 text-left font-semibold hover:text-primary">
            {t.title}
          </button>
          <p className="mt-0.5 text-xs text-subtle">
            {t.studentName || t.studentEmail} · {t.subject} · {t.classLevel} · {t.location}
          </p>
          {t.status === 'Rejected' && t.rejectionReason && <p className="mt-1.5 line-clamp-1 text-xs text-error">“{t.rejectionReason}”</p>}
        </div>
      ),
    },
    { key: 'budget', header: 'Budget', render: (t) => <span className="font-medium tabular-nums">{money(t.budget)}</span> },
    {
      key: 'applicants',
      header: 'Applicants',
      render: (t) => (
        <button
          type="button"
          onClick={() => setDetailsId(t.id)}
          aria-label={`View ${t.applicationsCount || 0} applicants`}
          className={cn('inline-flex items-center gap-1.5 rounded-lg tabular-nums hover:text-primary', t.applicationsCount ? 'font-medium' : 'text-subtle')}
        >
          <Users className="size-4 text-subtle" aria-hidden /> {t.applicationsCount || 0}
        </button>
      ),
    },
    { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} labels={LABELS} /> },
    {
      key: 'createdAt',
      header: 'Posted',
      hideOnMobile: true,
      render: (t) => (
        <span className="whitespace-nowrap text-muted" title={dateTime(t.createdAt)}>
          {date(t.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'text-right',
      fullWidthOnMobile: true,
      render: (t) => (
        <div className="flex flex-wrap items-center justify-end gap-1.5 max-md:justify-start">
          <ModerationButtons tuition={t} busy={busyFor(t)} onApprove={onApprove} onReject={onReject} />
          <IconButton icon={Eye} label={`Details for ${t.title}`} size="icon-sm" onClick={() => setDetailsId(t.id)} />
          <IconButton
            icon={Trash2}
            label={`Delete ${t.title}`}
            size="icon-sm"
            variant="danger-soft"
            onClick={() => onDelete(t)}
            disabled={remove.isPending && remove.variables === t.id}
          />
        </div>
      ),
    },
  ];

  const [emptyTitle, emptyText] = EMPTY[filters.status] || EMPTY.all;

  return (
    <>
      <PageHeader
        eyebrow="Moderation"
        title="Tuitions"
        description="Review new posts before tutors see them. Rejections go back to the student with your note."
      />

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs tabs={TABS} value={filters.status} onChange={(status) => setFilters({ status })} />
        <SearchField value={filters.search} onSearch={(search) => setFilters({ search })} label="Search tuitions" placeholder="Search title, subject, area…" />
      </div>

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isPending ? (
        <TableSkeleton rows={8} cols={5} />
      ) : items.length === 0 ? (
        filters.search ? (
          <EmptyState
            title={`No tuitions match “${filters.search}”`}
            description="Try a different keyword or another tab."
            action={
              <Button variant="outline" onClick={() => setFilters({ search: '' })}>
                Clear search
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={ShieldCheck}
            title={emptyTitle}
            description={emptyText}
            action={
              filters.status === 'Pending' ? (
                <Button variant="outline" onClick={() => setFilters({ status: 'Approved' })}>
                  View live tuitions
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setFilters({ status: 'Pending' })}>
                  Back to the queue
                </Button>
              )
            }
          />
        )
      ) : (
        <div className={cn('transition-opacity duration-300', isFetching && 'opacity-60')} aria-busy={isFetching || undefined}>
          {meta?.total !== undefined && (
            <p className="mb-3 text-sm text-muted">
              {meta.total} {meta.total === 1 ? 'tuition' : 'tuitions'}
              {filters.search && <> matching “{filters.search}”</>}
            </p>
          )}
          <DataTable columns={columns} rows={items} caption="Tuitions for moderation" />
          <Pagination page={meta?.page || filters.page} totalPages={meta?.totalPages} onChange={(page) => setFilters({ page })} className="mt-8" />
        </div>
      )}

      {/* The dialog closes before moderating so SweetAlert isn't trapped behind its focus lock. */}
      <DetailsModal
        tuition={details}
        onClose={() => setDetailsId(null)}
        busy={details ? busyFor(details) : null}
        onApprove={(t) => {
          setDetailsId(null);
          onApprove(t);
        }}
        onReject={(t) => {
          setDetailsId(null);
          onReject(t);
        }}
      />
    </>
  );
}
