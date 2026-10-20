import { useState } from 'react';
import { Copy, CreditCard, Percent, Receipt, Search, Wallet } from 'lucide-react';
import {
  Button,
  DataTable,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingRegion,
  PageHeader,
  Pagination,
  StatCard,
  StatCardSkeleton,
  StatusBadge,
  TableSkeleton,
  notify,
} from '../../../components/ui';
import { usePayments } from '../../../hooks/useApi';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Stagger } from '../../../motion';
import { useAuth } from '../../../providers/AuthProvider';
import { cn } from '../../../utils/cn';
import { date, money, plural } from '../../../utils/format';

const COPY = {
  Student: {
    title: 'Payments',
    description: 'Every tuition you’ve paid for through Edurock, with transaction IDs for your records.',
    caption: 'Your payments',
    emptyTitle: 'No payments yet',
    emptyText: 'When you hire a tutor and pay through Stripe, the receipt will appear here.',
    emptyAction: { to: '/dashboard/applied-tutors', label: 'Review applicants' },
  },
  Tutor: {
    title: 'Earnings',
    description: 'Payments from students who hired you, shown after the platform fee.',
    caption: 'Your earnings',
    emptyTitle: 'No earnings yet',
    emptyText: 'Once a student hires you and pays, the payment will show up here.',
    emptyAction: { to: '/tuitions', label: 'Find tuitions' },
  },
};

const copyId = async (id) => {
  try {
    await navigator.clipboard.writeText(id);
    notify.success('Transaction ID copied');
  } catch {
    notify.error('Couldn’t copy. Select the ID and copy it manually.');
  }
};

function TransactionId({ id }) {
  if (!id) return <span className="text-subtle">—</span>;
  return (
    <span className="inline-flex max-w-full items-center gap-1">
      <code className="max-w-36 truncate rounded-md bg-soft px-1.5 py-0.5 font-mono text-xs text-base-content/80" title={id}>
        {id}
      </code>
      <IconButton icon={Copy} label="Copy transaction ID" size="icon-sm" onClick={() => copyId(id)} />
    </span>
  );
}

const gridFor = (isTutor) => cn('mb-8 grid gap-4 sm:grid-cols-2', isTutor && 'lg:grid-cols-3');

function SummaryCards({ summary = {}, isTutor }) {
  const count = summary.count || 0;
  const cards = isTutor
    ? [
        { label: 'Net earned', value: summary.net || 0, format: money, icon: Wallet, tone: 'success', hint: 'After platform fees' },
        { label: 'Gross', value: summary.gross || 0, format: money, icon: CreditCard, tone: 'primary', hint: `From ${plural(count, 'payment')}` },
        { label: 'Platform fees', value: summary.fees || 0, format: money, icon: Percent, tone: 'warning', hint: 'Deducted per payment' },
      ]
    : [
        { label: 'Total spent', value: summary.gross || 0, format: money, icon: Wallet, tone: 'primary', hint: 'Across all hires' },
        { label: 'Payments', value: count, icon: Receipt, tone: 'success', hint: 'Completed securely via Stripe' },
      ];
  return (
    <Stagger className={gridFor(isTutor)}>
      {cards.map((c) => (
        <StatCard key={c.label} {...c} />
      ))}
    </Stagger>
  );
}

export default function PaymentHistory() {
  const { role } = useAuth();
  const isTutor = role === 'Tutor';
  const copy = COPY[isTutor ? 'Tutor' : 'Student'];
  useDocumentTitle(copy.title);

  const [page, setPage] = useState(1);
  const { data, isPending, isPlaceholderData, error, refetch } = usePayments({ page, limit: 10 });
  const items = data?.items || [];
  const meta = data?.meta || {};

  const columns = [
    {
      key: 'tuition',
      header: 'Tuition',
      primary: true,
      render: (p) => (
        <div className="min-w-0 max-w-xs">
          <p className="line-clamp-1 font-semibold">{p.tuitionTitle || 'Tuition'}</p>
          {p.tuitionSubject && <p className="mt-0.5 text-xs text-subtle">{p.tuitionSubject}</p>}
        </div>
      ),
    },
    {
      key: 'counterpart',
      header: isTutor ? 'Student' : 'Tutor',
      render: (p) => <span className="font-medium">{(isTutor ? p.studentName : p.tutorName) || '—'}</span>,
    },
    {
      key: 'amount',
      header: isTutor ? 'You received' : 'Amount',
      render: (p) =>
        isTutor ? (
          <div>
            <p className="font-semibold tabular-nums text-success">{money(p.netAmount)}</p>
            <p className="text-xs tabular-nums text-subtle">
              fee {money(p.platformFee)}
              {p.platformFeePercent ? ` (${p.platformFeePercent}%)` : ''}
            </p>
          </div>
        ) : (
          <span className="font-semibold tabular-nums">{money(p.amount)}</span>
        ),
    },
    { key: 'transactionId', header: 'Transaction', fullWidthOnMobile: true, render: (p) => <TransactionId id={p.transactionId} /> },
    { key: 'paidAt', header: 'Date', render: (p) => <span className="whitespace-nowrap text-muted">{date(p.paidAt)}</span> },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status || 'paid'} /> },
  ];

  return (
    <>
      <PageHeader
        title={copy.title}
        description={copy.description}
        actions={
          isTutor ? (
            <Button variant="outline" to="/tuitions" leftIcon={Search}>
              Find tuitions
            </Button>
          ) : null
        }
      />

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isPending ? (
        <LoadingRegion label={`Loading ${copy.title.toLowerCase()}`}>
          <div className={gridFor(isTutor)}>
            {Array.from({ length: isTutor ? 3 : 2 }, (_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <TableSkeleton cols={5} />
        </LoadingRegion>
      ) : (
        <>
          <SummaryCards summary={meta.summary} isTutor={isTutor} />
          {items.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title={copy.emptyTitle}
              description={copy.emptyText}
              action={<Button to={copy.emptyAction.to}>{copy.emptyAction.label}</Button>}
            />
          ) : (
            <div className={cn('transition-opacity', isPlaceholderData && 'opacity-60')} aria-busy={isPlaceholderData || undefined}>
              <DataTable columns={columns} rows={items} caption={copy.caption} />
              <Pagination page={meta.page || page} totalPages={meta.totalPages} onChange={setPage} className="mt-8" />
            </div>
          )}
        </>
      )}
    </>
  );
}
