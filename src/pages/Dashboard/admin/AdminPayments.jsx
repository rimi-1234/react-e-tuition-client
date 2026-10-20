import { useState } from 'react';
import { ArrowRight, Banknote, Check, Copy, CreditCard, Landmark, Receipt, Wallet } from 'lucide-react';
import {
  DataTable,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingRegion,
  PageHeader,
  Pagination,
  StatCard,
  StatCardSkeleton,
  TableSkeleton,
  notify,
} from '../../../components/ui';
import { Stagger } from '../../../motion';
import { usePayments } from '../../../hooks/useApi';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useUrlFilters } from '../../../hooks/useUrlState';
import { cn } from '../../../utils/cn';
import { dateTime, money, plural } from '../../../utils/format';

const DEFAULTS = { page: 1 };

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      notify.success('Transaction ID copied');
      setTimeout(() => setCopied(false), 1600);
    } catch {
      notify.error('Couldn’t copy. Select the ID and copy it manually.');
    }
  };
  return <IconButton icon={copied ? Check : Copy} label={copied ? 'Copied' : 'Copy transaction ID'} size="icon-sm" onClick={copy} className={copied ? 'text-success' : ''} />;
}

export default function AdminPayments() {
  useDocumentTitle('Transactions');
  const [filters, setFilters] = useUrlFilters(DEFAULTS);
  const { data, isPending, isFetching, error, refetch } = usePayments({ page: filters.page, limit: 15 });
  const items = data?.items || [];
  const meta = data?.meta;
  const summary = meta?.summary || {};

  const columns = [
    {
      key: 'transactionId',
      header: 'Transaction',
      render: (p) => (
        <div className="flex items-center gap-1">
          <code className="max-w-38 truncate rounded-md bg-soft px-2 py-1 font-mono text-xs" title={p.transactionId}>
            {p.transactionId}
          </code>
          {p.transactionId && <CopyButton value={p.transactionId} />}
        </div>
      ),
    },
    {
      key: 'parties',
      header: 'Student → Tutor',
      primary: true,
      render: (p) => (
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-1.5 font-semibold">
            <span className="truncate">{p.studentName || p.studentEmail || 'Student'}</span>
            <ArrowRight className="size-3.5 shrink-0 text-subtle" aria-label="paid" />
            <span className="truncate">{p.tutorName || p.tutorEmail || 'Tutor'}</span>
          </p>
          <p className="mt-0.5 truncate text-xs text-subtle">
            {p.studentEmail}
            {p.tutorEmail && ` → ${p.tutorEmail}`}
          </p>
        </div>
      ),
    },
    {
      key: 'tuition',
      header: 'Tuition',
      render: (p) => (
        <div className="min-w-0 max-w-56">
          <p className="truncate">{p.tuitionTitle || '—'}</p>
          {p.tuitionSubject && <p className="truncate text-xs text-subtle">{p.tuitionSubject}</p>}
        </div>
      ),
    },
    { key: 'amount', header: 'Amount', render: (p) => <span className="font-semibold tabular-nums">{money(p.amount)}</span> },
    {
      key: 'fee',
      header: 'Fee',
      render: (p) => (
        <span className="whitespace-nowrap tabular-nums text-success">
          {money(p.platformFee)}
          {p.platformFeePercent !== undefined && <span className="ml-1 text-xs text-subtle">{p.platformFeePercent}%</span>}
        </span>
      ),
    },
    { key: 'net', header: 'Tutor net', render: (p) => <span className="tabular-nums text-muted">{money(p.netAmount)}</span> },
    { key: 'paidAt', header: 'Date', render: (p) => <span className="whitespace-nowrap text-muted">{dateTime(p.paidAt || p.createdAt)}</span> },
  ];

  return (
    <>
      <PageHeader eyebrow="Finance" title="Transactions" description="Every tuition payment processed through Stripe, with the platform’s commission." />

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isPending ? (
        <LoadingRegion label="Loading transactions" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <TableSkeleton rows={8} cols={6} />
        </LoadingRegion>
      ) : (
        <>
          <Stagger className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Gross volume" value={summary.gross || 0} format={money} icon={Banknote} hint="Paid by students" />
            <StatCard label="Platform earnings" value={summary.fees || 0} format={money} icon={Landmark} tone="success" hint="Commission collected" />
            <StatCard label="Tutor payouts" value={summary.net || 0} format={money} icon={Wallet} tone="info" hint="Net to tutors" />
            <StatCard
              label="Transactions"
              value={summary.count || 0}
              icon={Receipt}
              tone="accent"
              hint={summary.count ? `Avg ${money((summary.gross || 0) / summary.count)} each` : 'No payments yet'}
            />
          </Stagger>

          {items.length === 0 ? (
            <EmptyState icon={CreditCard} title="No transactions yet" description="Payments appear here as soon as a student hires a tutor and checks out." />
          ) : (
            <div className={cn('transition-opacity duration-300', isFetching && 'opacity-60')} aria-busy={isFetching || undefined}>
              <p className="mb-3 text-sm text-muted">{plural(meta?.total ?? items.length, 'transaction')}</p>
              <DataTable columns={columns} rows={items} caption="All payments" />
              <Pagination page={meta?.page || filters.page} totalPages={meta?.totalPages} onChange={(page) => setFilters({ page })} className="mt-8" />
            </div>
          )}
        </>
      )}
    </>
  );
}
