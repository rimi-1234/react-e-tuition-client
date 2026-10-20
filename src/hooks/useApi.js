import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, qk } from '../api/endpoints';
import { notify } from '../components/ui/feedback';
import { useAuth } from '../providers/AuthProvider';

/* ─────────────────────────────── Queries ──────────────────────────── */

// Public, mostly static data: cache generously.
export const usePublicStats = () => useQuery({ queryKey: qk.stats, queryFn: api.meta.stats, staleTime: 5 * 60_000 });
export const useSubjects = () => useQuery({ queryKey: qk.subjects, queryFn: api.meta.subjects, staleTime: 10 * 60_000 });
export const useLocations = () => useQuery({ queryKey: qk.locations, queryFn: api.meta.locations, staleTime: 10 * 60_000 });

export const useTuitions = (params) =>
  useQuery({ queryKey: qk.tuitions.list(params), queryFn: () => api.tuitions.list(params), placeholderData: keepPreviousData });
export const useLatestTuitions = (limit = 6) => useQuery({ queryKey: qk.tuitions.latest(limit), queryFn: () => api.tuitions.latest(limit) });
export const useTuition = (id) => useQuery({ queryKey: qk.tuitions.detail(id), queryFn: () => api.tuitions.get(id), enabled: Boolean(id) });
export const useMyTuitions = (params) =>
  useQuery({ queryKey: qk.tuitions.mine(params), queryFn: () => api.tuitions.mine(params), placeholderData: keepPreviousData });
export const useAdminTuitions = (params) =>
  useQuery({ queryKey: qk.tuitions.admin(params), queryFn: () => api.tuitions.admin(params), placeholderData: keepPreviousData });

/** Admin: who applied to a tuition, with contact details (never exposed publicly). */
export const useTuitionApplicants = (id) =>
  useQuery({ queryKey: qk.tuitions.applicants(id), queryFn: () => api.tuitions.applicants(id), enabled: Boolean(id) });

export const useTutors = (params) =>
  useQuery({ queryKey: qk.tutors.list(params), queryFn: () => api.tutors.list(params), placeholderData: keepPreviousData });
export const useFeaturedTutors = (limit = 4) => useQuery({ queryKey: qk.tutors.featured(limit), queryFn: () => api.tutors.featured(limit) });
export const useTutor = (id) => useQuery({ queryKey: qk.tutors.detail(id), queryFn: () => api.tutors.get(id), enabled: Boolean(id) });
export const useReviews = (params) => useQuery({ queryKey: qk.reviews(params), queryFn: () => api.reviews.list(params) });

const applicationFns = { mine: api.applications.mine, received: api.applications.received, ongoing: api.applications.ongoing };
export const useApplications = (kind, params = {}) =>
  useQuery({
    queryKey: qk.applications[kind](params),
    queryFn: () => applicationFns[kind]({ limit: 50, ...params }),
    placeholderData: keepPreviousData,
  });

export function useAppliedCheck(tuitionId) {
  const { role } = useAuth();
  return useQuery({
    queryKey: qk.applications.check(tuitionId),
    queryFn: () => api.applications.check(tuitionId),
    enabled: Boolean(tuitionId) && role === 'Tutor',
  });
}

export const usePayments = (params) =>
  useQuery({ queryKey: qk.payments(params), queryFn: () => api.payments.list(params), placeholderData: keepPreviousData });

export function useDashboard(role, days) {
  const fn = { Student: api.dashboard.student, Tutor: api.dashboard.tutor, Admin: () => api.dashboard.admin(days) }[role];
  return useQuery({ queryKey: [...qk.dashboard(role), days], queryFn: fn, enabled: Boolean(fn), staleTime: 30_000 });
}

export const useProfile = () => useQuery({ queryKey: qk.profile, queryFn: api.profile.get });
export const useUsers = (params) => useQuery({ queryKey: qk.users(params), queryFn: () => api.users.list(params), placeholderData: keepPreviousData });
export const useContactMessages = (params) =>
  useQuery({ queryKey: qk.contact(params), queryFn: () => api.contact.list(params), placeholderData: keepPreviousData });

export function useBookmarkIds() {
  const { user } = useAuth();
  return useQuery({ queryKey: qk.bookmarks.ids, queryFn: api.bookmarks.ids, enabled: Boolean(user), select: (ids) => new Set(ids) });
}
export const useBookmarks = () => useQuery({ queryKey: qk.bookmarks.list, queryFn: api.bookmarks.list });

/** Polls every 45 s while the tab is visible (no sockets needed on Render free tier). */
export function useNotifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: qk.notifications,
    queryFn: () => api.notifications.list({ limit: 15 }),
    enabled: Boolean(user),
    refetchInterval: 45_000,
    refetchIntervalInBackground: false,
    staleTime: 20_000,
  });
}

/* ────────────────────────────── Prefetch ──────────────────────────── */

/** Warm the cache on hover/focus so the next page renders instantly. */
export function usePrefetch() {
  const qc = useQueryClient();
  return {
    tuition: (id) => qc.prefetchQuery({ queryKey: qk.tuitions.detail(id), queryFn: () => api.tuitions.get(id), staleTime: 60_000 }),
    tutor: (id) => qc.prefetchQuery({ queryKey: qk.tutors.detail(id), queryFn: () => api.tutors.get(id), staleTime: 60_000 }),
  };
}

/* ────────────────────────────── Mutations ─────────────────────────── */

/**
 * Mutation with toast feedback and cache invalidation baked in.
 *   success: string | (data, vars) => string   (the API message is used if omitted)
 */
function useApiMutation(mutationFn, { invalidate = [], success, onSuccess, silent } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async (data, vars) => {
      await Promise.all(invalidate.map((queryKey) => qc.invalidateQueries({ queryKey })));
      const msg = typeof success === 'function' ? success(data, vars) : success || data?.message;
      if (msg && !silent) notify.success(msg);
      onSuccess?.(data, vars);
    },
    onError: (error) => notify.error(error),
  });
}

const T = qk.tuitions.all;
const A = qk.applications.all;

export const useCreateTuition = (opts) => useApiMutation(api.tuitions.create, { invalidate: [T, ['dashboard']], ...opts });
export const useUpdateTuition = (opts) => useApiMutation(({ id, ...body }) => api.tuitions.update(id, body), { invalidate: [T], ...opts });
export const useDeleteTuition = (opts) => useApiMutation(api.tuitions.remove, { invalidate: [T, ['dashboard'], qk.bookmarks.all], ...opts });
export const useModerateTuition = (opts) =>
  useApiMutation(({ id, ...body }) => api.tuitions.moderate(id, body), { invalidate: [T, ['dashboard']], ...opts });

export const useApply = (opts) => useApiMutation(api.applications.apply, { invalidate: [A, T], success: 'Application sent! The student will be notified.', ...opts });
export const useUpdateApplication = (opts) => useApiMutation(({ id, ...body }) => api.applications.update(id, body), { invalidate: [A], ...opts });
export const useWithdrawApplication = (opts) => useApiMutation(api.applications.withdraw, { invalidate: [A, T], ...opts });
export const useRejectApplication = (opts) => useApiMutation(api.applications.reject, { invalidate: [A, ['dashboard']], ...opts });

export const useCheckout = () =>
  useApiMutation(api.payments.checkout, {
    silent: true,
    onSuccess: ({ url }) => {
      window.location.assign(url);
    },
  });

export const useCreateReview = (opts) => useApiMutation(api.reviews.create, { invalidate: [A, qk.tutors.all], ...opts });

export function useUpdateProfile(opts) {
  const { refreshUser } = useAuth();
  return useApiMutation(api.profile.update, {
    invalidate: [qk.profile, qk.tutors.all],
    onSuccess: () => refreshUser(),
    ...opts,
  });
}

export const useSendContact = (opts) => useApiMutation(api.contact.send, opts);
export const useContactStatus = () => useApiMutation(({ id, status }) => api.contact.status(id, status), { invalidate: [['contact']], silent: true });

const U = ['users'];
export const useChangeRole = () => useApiMutation(({ id, role }) => api.users.role(id, role), { invalidate: [U] });
export const useVerifyTutor = () => useApiMutation(({ id, verified }) => api.users.verify(id, verified), { invalidate: [U, qk.tutors.all] });
export const useSetUserStatus = () => useApiMutation(({ id, isActive }) => api.users.status(id, isActive), { invalidate: [U] });
export const useDeleteUser = () => useApiMutation(api.users.remove, { invalidate: [U, ['dashboard']] });

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.notifications.readAll,
    onMutate: () =>
      qc.setQueryData(qk.notifications, (old) =>
        old ? { ...old, items: old.items.map((n) => ({ ...n, read: true })), meta: { ...old.meta, unreadCount: 0 } } : old,
      ),
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.notifications.read,
    onMutate: (id) =>
      qc.setQueryData(qk.notifications, (old) =>
        old
          ? {
              ...old,
              items: old.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
              meta: { ...old.meta, unreadCount: Math.max(0, (old.meta?.unreadCount || 1) - (old.items.find((n) => n.id === id)?.read ? 0 : 1)) },
            }
          : old,
      ),
  });
}

/** Optimistic save/unsave: the heart fills instantly and rolls back on failure. */
export function useToggleBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tuitionId, saved }) => (saved ? api.bookmarks.remove(tuitionId) : api.bookmarks.add(tuitionId)),
    onMutate: async ({ tuitionId, saved }) => {
      await qc.cancelQueries({ queryKey: qk.bookmarks.ids });
      const previous = qc.getQueryData(qk.bookmarks.ids);
      qc.setQueryData(qk.bookmarks.ids, (old = []) => (saved ? old.filter((id) => id !== tuitionId) : [...old, tuitionId]));
      return { previous };
    },
    onError: (error, _vars, ctx) => {
      qc.setQueryData(qk.bookmarks.ids, ctx?.previous);
      notify.error(error);
    },
    onSuccess: (_d, { saved }) => notify.success(saved ? 'Removed from saved' : 'Saved for later'),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.bookmarks.all }),
  });
}

/* ── Admin live chat ─────────────────────────────────────────────── */
export const useChatSessions = (params) =>
  useQuery({
    queryKey: qk.chat.sessions(params),
    queryFn: () => api.chat.sessions(params),
    placeholderData: keepPreviousData,
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
  });

export const useChatThread = (id) =>
  useQuery({ queryKey: qk.chat.thread(id), queryFn: () => api.chat.thread(id), enabled: Boolean(id), refetchInterval: 4000, refetchIntervalInBackground: false });

export function useChatReply(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.chat.reply(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.chat.thread(id) });
      qc.invalidateQueries({ queryKey: ['chat', 'sessions'] });
    },
    onError: (error) => notify.error(error),
  });
}

export const useChatStatus = () =>
  useApiMutation(({ id, status }) => api.chat.status(id, status), {
    invalidate: [['chat']],
    success: (_d, { status }) => (status === 'closed' ? 'Chat marked as resolved' : 'Chat reopened'),
  });
