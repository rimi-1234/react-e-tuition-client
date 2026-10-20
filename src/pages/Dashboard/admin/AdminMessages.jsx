import { useState, useSyncExternalStore } from 'react';
import { Archive, ArchiveRestore, Inbox, Mail, MailOpen, Reply } from 'lucide-react';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingRegion,
  Modal,
  PageHeader,
  Pagination,
  Skeleton,
  SkeletonText,
  StatusBadge,
  Tabs,
  notify,
} from '../../../components/ui';
import { useContactMessages, useContactStatus } from '../../../hooks/useApi';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useUrlFilters } from '../../../hooks/useUrlState';
import { cn } from '../../../utils/cn';
import { dateTime, timeAgo } from '../../../utils/format';

const DEFAULTS = { status: 'new', page: 1 };
const TABS = [
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'archived', label: 'Archived' },
  { value: 'all', label: 'All' },
];
const LABELS = { new: 'New', read: 'Read', archived: 'Archived' };
const EMPTY = {
  new: ['Inbox zero', 'No unread messages. New questions from the contact form land here.'],
  read: ['Nothing read yet', 'Messages you’ve opened move here.'],
  archived: ['No archived messages', 'Archive messages once they’re handled to keep the inbox tidy.'],
  all: ['No messages yet', 'Messages sent through the contact page will appear here.'],
};

/* Two-pane reader on lg+, modal reader below. */
const DESKTOP = '(min-width: 64rem)';
const subscribe = (cb) => {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
const useIsDesktop = () => useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP).matches, () => true);

function MessageReader({ message: m, busy, onStatus }) {
  const subject = m.subject || 'Message from the contact form';
  const mailto = `mailto:${m.email}?subject=${encodeURIComponent(`Re: ${subject}`)}&body=${encodeURIComponent(`Hi ${m.name?.split(' ')[0] || 'there'},\n\n`)}`;
  const archived = m.status === 'archived';
  return (
    <article className="flex h-full flex-col">
      <header className="border-b border-soft pb-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <StatusBadge status={m.status} labels={LABELS} />
          <time className="text-xs text-subtle" dateTime={m.createdAt}>
            {dateTime(m.createdAt)}
          </time>
        </div>
        <h2 className="text-xl font-semibold leading-snug sm:text-2xl">{subject}</h2>
        <div className="mt-4 flex items-center gap-3">
          <Avatar name={m.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{m.name}</p>
            <a href={`mailto:${m.email}`} className="truncate text-xs text-primary hover:underline">
              {m.email}
            </a>
          </div>
        </div>
      </header>

      <p className="flex-1 whitespace-pre-line wrap-break-word py-6 text-[15px] leading-relaxed text-base-content/85">{m.message}</p>

      <footer className="flex flex-wrap gap-2 border-t border-soft pt-5">
        <Button href={mailto} leftIcon={Reply} size="sm">
          Reply by email
        </Button>
        <Button
          variant="outline"
          size="sm"
          leftIcon={archived ? ArchiveRestore : Archive}
          loading={busy === (archived ? 'read' : 'archived')}
          disabled={Boolean(busy)}
          onClick={() => onStatus(m, archived ? 'read' : 'archived')}
        >
          {archived ? 'Restore' : 'Archive'}
        </Button>
        {m.status === 'read' && (
          <Button variant="ghost" size="sm" leftIcon={Mail} loading={busy === 'new'} disabled={Boolean(busy)} onClick={() => onStatus(m, 'new')}>
            Mark unread
          </Button>
        )}
      </footer>
    </article>
  );
}

function ListSkeleton() {
  return (
    <LoadingRegion label="Loading messages" className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
      <Card padded={false} className="divide-y divide-base-content/7">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="space-y-2 p-4">
            <div className="flex justify-between">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </Card>
      <Card className="hidden space-y-4 lg:block">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-7 w-2/3" />
        <SkeletonText lines={6} />
      </Card>
    </LoadingRegion>
  );
}

export default function AdminMessages() {
  useDocumentTitle('Messages');
  const [filters, setFilters] = useUrlFilters(DEFAULTS);
  const [selected, setSelected] = useState(null);
  const isDesktop = useIsDesktop();
  const { data, isPending, isFetching, error, refetch } = useContactMessages({ status: filters.status, page: filters.page, limit: 20 });
  const setStatus = useContactStatus();
  const items = data?.items || [];
  const meta = data?.meta;

  // Prefer the freshest copy from the list; fall back to the snapshot when it left this tab.
  const current = selected ? items.find((m) => m.id === selected.id) || selected : null;
  const busy = setStatus.isPending && setStatus.variables?.id === current?.id ? setStatus.variables.status : null;

  const open = (m) => {
    setSelected(m.status === 'new' ? { ...m, status: 'read' } : m);
    if (m.status === 'new') setStatus.mutate({ id: m.id, status: 'read' });
  };

  const changeStatus = (m, status) =>
    setStatus.mutate(
      { id: m.id, status },
      {
        onSuccess: () => {
          setSelected((s) => (s?.id === m.id ? { ...s, status } : s));
          notify.success(status === 'archived' ? 'Message archived' : status === 'new' ? 'Marked as unread' : 'Moved back to the inbox');
        },
      },
    );

  const [emptyTitle, emptyText] = EMPTY[filters.status] || EMPTY.all;

  return (
    <>
      <PageHeader eyebrow="Support" title="Messages" description="Questions and feedback sent through the contact page." />
      <Tabs
        tabs={TABS}
        value={filters.status}
        onChange={(status) => {
          setFilters({ status });
          setSelected(null);
        }}
        className="mb-6"
      />

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isPending ? (
        <ListSkeleton />
      ) : items.length === 0 && !current ? (
        <EmptyState icon={filters.status === 'new' ? MailOpen : Inbox} title={emptyTitle} description={emptyText} />
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
          <div className={cn('min-w-0 transition-opacity duration-300', isFetching && 'opacity-70')} aria-busy={isFetching || undefined}>
            {items.length === 0 ? (
              <p className="rounded-[var(--radius-box)] border border-dashed border-soft px-4 py-10 text-center text-sm text-muted">No more messages in this tab.</p>
            ) : (
              <Card padded={false} className="overflow-hidden">
                <ul className="divide-y divide-base-content/7" aria-label="Messages">
                  {items.map((m) => {
                    const active = current?.id === m.id;
                    const unread = m.status === 'new';
                    return (
                      <li key={m.id}>
                        <button
                          type="button"
                          onClick={() => open(m)}
                          aria-current={active || undefined}
                          className={cn(
                            'relative block w-full px-4 py-4 text-left transition-colors sm:px-5',
                            active ? 'bg-primary/6' : 'hover:bg-soft/70',
                          )}
                        >
                          {active && <span className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-primary" aria-hidden />}
                          <div className="flex items-center justify-between gap-3">
                            <span className={cn('flex min-w-0 items-center gap-2 text-sm', unread ? 'font-semibold' : 'font-medium text-base-content/85')}>
                              {unread && <span className="size-2 shrink-0 rounded-full bg-info" aria-label="Unread" />}
                              <span className="truncate">{m.name}</span>
                            </span>
                            <span className="shrink-0 text-xs text-subtle">{timeAgo(m.createdAt)}</span>
                          </div>
                          <p className={cn('mt-1 truncate text-sm', unread ? 'font-medium' : 'text-muted')}>{m.subject || 'No subject'}</p>
                          <p className="mt-0.5 line-clamp-1 text-xs text-subtle">{m.message}</p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            )}
            <Pagination page={meta?.page || filters.page} totalPages={meta?.totalPages} onChange={(page) => setFilters({ page })} className="mt-6" />
          </div>

          <Card className="sticky top-24 hidden min-h-112 lg:block">
            {current ? (
              <MessageReader key={current.id} message={current} busy={busy} onStatus={changeStatus} />
            ) : (
              <div className="flex h-full min-h-96 flex-col items-center justify-center text-center">
                <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <MailOpen className="size-6" aria-hidden />
                </span>
                <p className="font-semibold">Select a message</p>
                <p className="mt-1 max-w-xs text-sm text-muted">Pick a message on the left to read it and reply by email.</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {!isDesktop && (
        <Modal open={Boolean(current)} onClose={() => setSelected(null)} size="lg" title={current ? <span className="sr-only">Message from {current.name}</span> : undefined}>
          {current && <MessageReader message={current} busy={busy} onStatus={changeStatus} />}
        </Modal>
      )}
    </>
  );
}
