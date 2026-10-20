import { useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, MessagesSquare, Phone, RotateCcw, SendHorizontal } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { SearchField } from '../../../components/dashboard/SearchField';
import { Avatar, Badge, Button, Card, EmptyState, ErrorState, PageHeader, Skeleton, Tabs } from '../../../components/ui';
import { useChatReply, useChatSessions, useChatStatus, useChatThread } from '../../../hooks/useApi';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useUrlFilters } from '../../../hooks/useUrlState';
import { cn } from '../../../utils/cn';
import { timeAgo } from '../../../utils/format';

const DEFAULTS = { status: 'open', search: '', page: 1 };
const TABS = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Resolved' },
  { value: 'all', label: 'All' },
];
const waLink = (phone) => `https://wa.me/${phone.replace(/\D/g, '').replace(/^0/, '880')}`;
const time = (d) => new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function SessionList({ items, isPending, activeId, onSelect }) {
  if (isPending) {
    return Array.from({ length: 5 }, (_, i) => (
      <div key={i} className="flex gap-3 p-3">
        <Skeleton className="size-10" rounded="rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    ));
  }
  if (!items.length) return <EmptyState compact icon={MessagesSquare} title="No chats here" description="New conversations from the website appear here." className="m-3" />;

  return items.map((s) => (
    <button
      key={s.id}
      onClick={() => onSelect(s.id)}
      className={cn('flex w-full gap-3 rounded-2xl p-3 text-left transition-colors', activeId === s.id ? 'bg-primary/8' : 'hover:bg-soft')}
    >
      <Avatar name={s.name} size="md" />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className={cn('truncate text-sm', s.unreadForAdmin ? 'font-semibold' : 'font-medium')}>{s.name}</span>
          <span className="shrink-0 text-[11px] text-subtle">{timeAgo(s.lastMessageAt)}</span>
        </span>
        <span className="mt-0.5 flex items-center gap-2">
          <span className={cn('line-clamp-1 flex-1 text-xs', s.unreadForAdmin ? 'text-base-content' : 'text-subtle')}>
            {s.lastSender === 'admin' && 'You: '}
            {s.lastMessage}
          </span>
          {s.unreadForAdmin > 0 && <span className="flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold leading-5 text-primary-content">{s.unreadForAdmin}</span>}
        </span>
      </span>
    </button>
  ));
}

function Thread({ id, onBack }) {
  const { data, isPending, error, refetch } = useChatThread(id);
  const reply = useChatReply(id);
  const status = useChatStatus();
  const [draft, setDraft] = useState('');
  const list = useRef(null);
  const messages = data?.messages || [];
  const session = data?.session;

  useLayoutEffect(() => {
    if (list.current) list.current.scrollTop = list.current.scrollHeight;
  }, [messages.length, id]);

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    reply.mutate(body, { onSuccess: () => setDraft('') });
  };

  if (error) return <ErrorState error={error} onRetry={refetch} className="m-4" />;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b border-soft p-4">
        <button onClick={onBack} className="rounded-lg p-1.5 hover:bg-soft lg:hidden" aria-label="Back to chats">
          <ArrowLeft className="size-5" />
        </button>
        {isPending ? (
          <Skeleton className="h-10 w-48" />
        ) : (
          <>
            <Avatar name={session.name} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{session.name}</p>
              <p className="flex flex-wrap items-center gap-x-3 text-xs text-subtle">
                <a href={`tel:${session.phone}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                  <Phone className="size-3" /> {session.phone}
                </a>
                <a href={waLink(session.phone)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                  <FaWhatsapp className="size-3" /> WhatsApp
                </a>
                {session.page && <span>from {session.page}</span>}
              </p>
            </div>
            {session.status === 'open' ? (
              <Button size="sm" variant="success" leftIcon={CheckCircle2} loading={status.isPending} onClick={() => status.mutate({ id, status: 'closed' })}>
                <span className="hidden sm:inline">Resolve</span>
              </Button>
            ) : (
              <Button size="sm" variant="outline" leftIcon={RotateCcw} loading={status.isPending} onClick={() => status.mutate({ id, status: 'open' })}>
                <span className="hidden sm:inline">Reopen</span>
              </Button>
            )}
          </>
        )}
      </div>

      <div ref={list} className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4" data-lenis-prevent>
        {messages.map((m) => {
          const mine = m.sender === 'admin';
          return (
            <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
              <div className={cn('max-w-[78%] rounded-2xl px-3.5 py-2 text-sm', mine ? 'rounded-br-md bg-primary text-primary-content' : 'rounded-bl-md bg-soft')}>
                {mine && <p className="mb-0.5 text-[11px] font-semibold opacity-80">{m.senderName || 'Edurock'}</p>}
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={cn('mt-1 text-right text-[10px]', mine ? 'opacity-70' : 'text-subtle')}>{time(m.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-end gap-2 border-t border-soft p-3"
      >
        <label htmlFor="admin-reply" className="sr-only">
          Reply
        </label>
        <textarea
          id="admin-reply"
          rows={1}
          value={draft}
          maxLength={2000}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={session ? `Reply to ${session.name.split(' ')[0]}…` : 'Reply…'}
          className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-soft bg-base-100 px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/12"
        />
        <Button type="submit" size="icon" loading={reply.isPending} disabled={!draft.trim()} aria-label="Send reply">
          {!reply.isPending && <SendHorizontal className="size-[18px]" />}
        </Button>
      </form>
    </div>
  );
}

export default function AdminChats() {
  useDocumentTitle('Live chat');
  const [filters, setFilters] = useUrlFilters(DEFAULTS);
  const [activeId, setActiveId] = useState(null);
  const { data, isPending, error, refetch } = useChatSessions({ status: filters.status, search: filters.search, page: filters.page, limit: 50 });
  const items = data?.items || [];
  const unread = data?.meta?.unread || 0;

  return (
    <>
      <PageHeader
        title="Live chat"
        description="Conversations started from the website chat. Visitors see your replies instantly in their chat window."
        actions={unread > 0 && <Badge tone="primary">{unread} unread</Badge>}
      />

      <Card padded={false} className="grid h-[calc(100dvh-14rem)] min-h-[520px] overflow-hidden lg:grid-cols-[340px_1fr]">
        <div className={cn('flex min-h-0 flex-col border-soft lg:border-r', activeId && 'max-lg:hidden')}>
          <div className="space-y-3 border-b border-soft p-3">
            <Tabs tabs={TABS} value={filters.status} onChange={(status) => setFilters({ status })} className="w-full" />
            <SearchField value={filters.search} onSearch={(search) => setFilters({ search })} label="Search chats" placeholder="Name, phone or message…" />
          </div>
          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2" data-lenis-prevent>
            {error ? <ErrorState error={error} onRetry={refetch} /> : <SessionList items={items} isPending={isPending} activeId={activeId} onSelect={setActiveId} />}
          </div>
        </div>

        <div className={cn('min-h-0', !activeId && 'max-lg:hidden')}>
          {activeId ? (
            <Thread key={activeId} id={activeId} onBack={() => setActiveId(null)} />
          ) : (
            <div className="flex h-full items-center justify-center p-6">
              <EmptyState compact icon={MessagesSquare} title="Select a conversation" description="Pick a chat on the left to read and reply." className="border-0" />
            </div>
          )}
        </div>
      </Card>
    </>
  );
}
