import { useState } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { ArrowUpRight, ListChecks, PencilLine, Search, Undo2 } from 'lucide-react';
import {
  Button,
  DataTable,
  EmptyState,
  ErrorState,
  Input,
  Modal,
  PageHeader,
  StatusBadge,
  TableSkeleton,
  Tabs,
  Textarea,
  confirmAction,
} from '../../../components/ui';
import { useApplications, useUpdateApplication, useWithdrawApplication } from '../../../hooks/useApi';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { date, money } from '../../../utils/format';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Hired' },
  { value: 'Rejected', label: 'Not selected' },
];
const LABELS = { Approved: 'Hired', Rejected: 'Not selected' };

const EMPTY_COPY = {
  all: ['No applications yet', 'Find a tuition that fits your subjects and send your first application. It takes about a minute.'],
  Pending: ['Nothing waiting on a decision', 'Applications you send appear here until the student decides.'],
  Approved: ['No hires yet', 'When a student hires and pays you, the tuition shows up here and in Ongoing tuitions.'],
  Rejected: ['Nothing here', 'Applications that weren’t selected will be listed here.'],
};

/** Tuition info from the populated doc, falling back to the snapshot on the application. */
const tuitionOf = (a) => ({
  id: a.tuition?.id || (typeof a.tuition === 'string' ? a.tuition : null),
  title: a.tuition?.title || a.tuitionTitle || 'Tuition',
  subject: a.tuition?.subject || a.tuitionSubject,
  location: a.tuition?.location || a.tuitionLocation,
  classLevel: a.tuition?.classLevel,
  budget: a.tuition?.budget,
});

function EditApplicationModal({ application, onClose }) {
  const update = useUpdateApplication({ success: 'Application updated', onSuccess: onClose });
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      expectedSalary: application.expectedSalary,
      qualifications: application.qualifications || '',
      experience: application.experience ?? 0,
      message: application.message || '',
    },
  });

  const onSubmit = (values) =>
    update.mutate({
      id: application.id,
      expectedSalary: Number(values.expectedSalary),
      experience: Number(values.experience),
      qualifications: values.qualifications.trim(),
      message: values.message.trim(),
    });

  const t = tuitionOf(application);

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit application"
      description={`For “${t.title}”${t.budget ? ` · budget ${money(t.budget)}/mo` : ''}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="edit-application" loading={update.isPending} disabled={!isDirty}>
            Save changes
          </Button>
        </>
      }
    >
      <form id="edit-application" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Your monthly rate (৳)"
            type="number"
            inputMode="numeric"
            min={500}
            required
            error={errors.expectedSalary?.message}
            {...register('expectedSalary', {
              required: 'Enter your expected monthly fee',
              min: { value: 500, message: 'At least ৳500' },
              validate: (v) => Number.isFinite(Number(v)) || 'Enter a number',
            })}
          />
          <Input
            label="Teaching experience (years)"
            type="number"
            inputMode="numeric"
            min={0}
            max={60}
            required
            error={errors.experience?.message}
            {...register('experience', {
              required: 'Required',
              min: { value: 0, message: 'Can’t be negative' },
              max: { value: 60, message: 'That seems too high' },
              validate: (v) => Number.isInteger(Number(v)) || 'Whole years only',
            })}
          />
        </div>
        <Input
          label="Qualifications"
          placeholder="e.g. BSc in Physics, BUET"
          required
          error={errors.qualifications?.message}
          {...register('qualifications', {
            required: 'Tell the student about your qualifications',
            validate: (v) => v.trim().length >= 3 || 'At least 3 characters',
            maxLength: { value: 300, message: 'Keep it under 300 characters' },
          })}
        />
        <Textarea
          label="Message to the student"
          rows={4}
          hint="Optional. A short note on how you would approach the lessons."
          error={errors.message?.message}
          {...register('message', { maxLength: { value: 1000, message: 'Keep it under 1000 characters' } })}
        />
      </form>
    </Modal>
  );
}

export default function MyApplications() {
  useDocumentTitle('My applications');
  const [status, setStatus] = useState('all');
  const [editing, setEditing] = useState(null);
  const { data, isPending, error, refetch } = useApplications('mine', { status });
  const withdraw = useWithdrawApplication({ success: 'Application withdrawn' });
  const items = data?.items || [];

  const onWithdraw = async (a) => {
    const ok = await confirmAction({
      title: 'Withdraw this application?',
      text: `The student will no longer see your application for “${tuitionOf(a).title}”. You can apply again while the tuition is open.`,
      confirmText: 'Withdraw',
      danger: true,
    });
    if (ok) withdraw.mutate(a.id);
  };

  const columns = [
    {
      key: 'tuition',
      header: 'Tuition',
      primary: true,
      render: (a) => {
        const t = tuitionOf(a);
        return (
          <div className="min-w-0 max-w-sm">
            {t.id ? (
              <Link to={`/tuitions/${t.id}`} className="line-clamp-1 font-semibold hover:text-primary">
                {t.title}
              </Link>
            ) : (
              <p className="line-clamp-1 font-semibold">{t.title}</p>
            )}
            <p className="mt-0.5 text-xs text-subtle">{[t.subject, t.classLevel, t.location].filter(Boolean).join(' · ')}</p>
          </div>
        );
      },
    },
    {
      key: 'rate',
      header: 'Your rate',
      render: (a) => (
        <span className="font-medium tabular-nums">
          {money(a.expectedSalary)}
          <span className="text-xs font-normal text-subtle">/mo</span>
        </span>
      ),
    },
    {
      key: 'budget',
      header: 'Budget',
      render: (a) => {
        const budget = tuitionOf(a).budget;
        return budget ? <span className="tabular-nums text-muted">{money(budget)}</span> : <span className="text-subtle">—</span>;
      },
    },
    { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} labels={LABELS} /> },
    { key: 'createdAt', header: 'Applied', render: (a) => <span className="text-muted">{date(a.createdAt)}</span> },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'text-right',
      fullWidthOnMobile: true,
      render: (a) => {
        if (a.status === 'Pending') {
          const busy = withdraw.isPending && withdraw.variables === a.id;
          return (
            <div className="flex justify-end gap-1.5 max-md:justify-start">
              <Button size="xs" variant="outline" leftIcon={PencilLine} onClick={() => setEditing(a)} aria-label={`Edit application for ${tuitionOf(a).title}`}>
                Edit
              </Button>
              <Button size="xs" variant="danger-soft" leftIcon={Undo2} loading={busy} onClick={() => onWithdraw(a)} aria-label={`Withdraw application for ${tuitionOf(a).title}`}>
                Withdraw
              </Button>
            </div>
          );
        }
        if (a.status === 'Approved') {
          return (
            <div className="flex justify-end max-md:justify-start">
              <Button size="xs" variant="success" rightIcon={ArrowUpRight} to="/dashboard/ongoing-tuitions">
                Open
              </Button>
            </div>
          );
        }
        return <span className="text-xs text-subtle">{a.decidedAt ? `Decided ${date(a.decidedAt)}` : '—'}</span>;
      },
    },
  ];

  const [emptyTitle, emptyText] = EMPTY_COPY[status] || EMPTY_COPY.all;

  return (
    <>
      <PageHeader
        title="My applications"
        description="Track every tuition you’ve applied to. You can edit or withdraw while a decision is pending."
        actions={
          <Button to="/tuitions" leftIcon={Search}>
            Browse tuitions
          </Button>
        }
      />
      <Tabs tabs={TABS} value={status} onChange={setStatus} className="mb-6" />

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isPending ? (
        <TableSkeleton />
      ) : items.length === 0 ? (
        <EmptyState icon={ListChecks} title={emptyTitle} description={emptyText} action={<Button to="/tuitions">Browse tuitions</Button>} />
      ) : (
        <DataTable columns={columns} rows={items} caption="Your tuition applications" />
      )}

      {editing && <EditApplicationModal key={editing.id} application={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
