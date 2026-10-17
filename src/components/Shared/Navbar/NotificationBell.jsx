import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

/* ------------------------------------------------------------------ */
/*  FEATURE 2 – Notification center                                     */
/*  Shows a badge with the unread count, opens a dropdown with the      */
/*  20 most recent notifications. Clicking "Mark all read" sends one    */
/*  PATCH to the backend and updates the local cache instantly.         */
/* ------------------------------------------------------------------ */
const typeIcon = {
  new_application: '📩',
  payment_confirmed: '💳',
  hire_confirmed: '🎉',
  new_review: '⭐',
  verified: '✅',
};

const NotificationBell = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    enabled: !!user,
    refetchInterval: 30_000,   // poll every 30 seconds
    queryFn: async () => {
      const res = await axiosSecure.get('/notifications');
      return res.data;
    }
  });

  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = useMutation({
    mutationFn: () => axiosSecure.patch('/notifications/read-all'),
    onSuccess: () => {
      // Optimistically update the cache so the badge disappears immediately
      queryClient.setQueryData(['notifications', user?.email], (old = []) =>
        old.map(n => ({ ...n, read: true }))
      );
    }
  });

  if (!user) return null;

  return (
    <div className="relative">
      <button
        aria-label={`Notifications, ${unread} unread`}
        onClick={() => {
          setOpen(o => !o);
          if (!open && unread > 0) markAllRead.mutate();
        }}
        className="btn btn-ghost btn-circle relative border border-base-300 bg-base-100 text-base-content hover:border-primary hover:text-primary"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white"
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-full z-50 mt-3 w-80 overflow-hidden rounded-2xl border border-base-300 bg-base-100 text-base-content shadow-2xl">
            <div className="flex items-center justify-between border-b border-base-300 px-4 py-3">
              <h3 className="font-bold">Notifications</h3>
              {unread > 0 && (
                <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-semibold text-secondary">
                  {unread} new
                </span>
              )}
            </div>

            <ul className="max-h-80 divide-y divide-base-300 overflow-y-auto">
              {notifications.length === 0 && (
                <li className="px-4 py-8 text-center text-sm text-base-content/50">
                  Nothing here yet.
                </li>
              )}
              {notifications.map(n => (
                <li key={n._id}>
                  {n.link ? (
                    <Link
                      to={n.link}
                      onClick={() => setOpen(false)}
                      className={`flex gap-3 px-4 py-3 text-sm transition-colors hover:bg-base-200 ${
                        !n.read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <span className="text-xl" aria-hidden="true">
                        {typeIcon[n.type] ?? '🔔'}
                      </span>
                      <span className="flex-1">
                        <span className={!n.read ? 'font-semibold' : ''}>{n.message}</span>
                        <br />
                        <span className="text-[10px] text-base-content/40">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </span>
                    </Link>
                  ) : (
                    <div
                      className={`flex gap-3 px-4 py-3 text-sm ${!n.read ? 'bg-primary/5' : ''}`}
                    >
                      <span className="text-xl" aria-hidden="true">
                        {typeIcon[n.type] ?? '🔔'}
                      </span>
                      <span className="flex-1">
                        <span className={!n.read ? 'font-semibold' : ''}>{n.message}</span>
                        <br />
                        <span className="text-[10px] text-base-content/40">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
