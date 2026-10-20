import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { Bell, BellOff, CheckCheck, CircleDollarSign, FileCheck2, MessageSquareText, ShieldCheck, Star, UserPlus, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useMarkAllRead, useMarkRead, useNotifications } from '../../hooks/useApi';
import { cn } from '../../utils/cn';
import { timeAgo } from '../../utils/format';
import { Skeleton } from '../ui';

const ICONS = {
  new_application: [UserPlus, 'text-primary bg-primary/10'],
  application_rejected: [XCircle, 'text-error bg-error/10'],
  payment_confirmed: [CircleDollarSign, 'text-success bg-success/12'],
  hire_confirmed: [CircleDollarSign, 'text-success bg-success/12'],
  tuition_approved: [FileCheck2, 'text-success bg-success/12'],
  tuition_rejected: [XCircle, 'text-error bg-error/10'],
  tuition_submitted: [FileCheck2, 'text-warning bg-warning/14'],
  position_filled: [MessageSquareText, 'text-base-content/70 bg-soft'],
  new_review: [Star, 'text-accent bg-accent/15'],
  verified: [ShieldCheck, 'text-primary bg-primary/10'],
  role_changed: [ShieldCheck, 'text-info bg-info/10'],
  chat_started: [MessageSquareText, 'text-primary bg-primary/10'],
};

export function NotificationBell() {
  const { data, isPending } = useNotifications();
  const markAll = useMarkAllRead();
  const markOne = useMarkRead();
  const navigate = useNavigate();
  const items = data?.items || [];
  const unread = data?.meta?.unreadCount || 0;

  return (
    <Popover className="relative">
      <PopoverButton
        className="relative flex size-10 items-center justify-center rounded-xl text-base-content/75 transition-colors hover:bg-soft hover:text-base-content data-open:bg-soft"
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
      >
        <Bell className="size-[18px]" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-semibold leading-4 text-error-content ring-2 ring-base-100">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </PopoverButton>

      <PopoverPanel
        transition
        anchor="bottom end"
        className="z-[70] w-[min(92vw,380px)] rounded-2xl border border-soft bg-base-100 shadow-[var(--shadow-lift)] outline-none [--anchor-gap:8px] origin-top-right transition duration-200 ease-out-soft data-closed:scale-95 data-closed:opacity-0"
      >
        {({ close }) => (
          <>
            <div className="flex items-center justify-between border-b border-soft px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
              {unread > 0 && (
                <button onClick={() => markAll.mutate()} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                  <CheckCheck className="size-3.5" /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-1.5" data-lenis-prevent>
              {isPending ? (
                Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="flex gap-3 p-3">
                    <Skeleton className="size-9 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center px-6 py-10 text-center">
                  <BellOff className="mb-3 size-8 text-subtle" />
                  <p className="text-sm font-medium">You’re all caught up</p>
                  <p className="mt-1 text-xs text-subtle">Updates about tuitions and payments appear here.</p>
                </div>
              ) : (
                items.map((n) => {
                  const [Icon, tone] = ICONS[n.type] || [Bell, 'bg-soft text-base-content/70'];
                  return (
                    <button
                      key={n.id}
                      onClick={() => {
                        if (!n.read) markOne.mutate(n.id);
                        close();
                        if (n.link) navigate(n.link);
                      }}
                      className={cn('flex w-full gap-3 rounded-xl p-3 text-left transition-colors hover:bg-soft', !n.read && 'bg-primary/[0.04]')}
                    >
                      <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', tone)}>
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn('block text-sm leading-snug', n.read ? 'text-muted' : 'font-medium')}>{n.message}</span>
                        <span className="mt-1 block text-xs text-subtle">{timeAgo(n.createdAt)}</span>
                      </span>
                      {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}
      </PopoverPanel>
    </Popover>
  );
}
