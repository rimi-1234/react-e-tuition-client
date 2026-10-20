import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, qk } from '../api/endpoints';

const TOKEN_KEY = 'edurock-chat-token';
const SEEN_KEY = 'edurock-chat-seen';

const store = {
  get: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k, v) => {
    try {
      if (v === null) localStorage.removeItem(k);
      else localStorage.setItem(k, v);
    } catch {
      /* storage blocked: the chat still works for this tab */
    }
  },
};

/**
 * Visitor-side live chat. The session token lives in localStorage so the
 * conversation resumes on the next visit. Polls every 4 s while the panel
 * is open and every 30 s otherwise (for the unread badge).
 */
export function useChat({ open }) {
  const qc = useQueryClient();
  const [token, setTokenState] = useState(() => store.get(TOKEN_KEY));
  const [seenAt, setSeenAt] = useState(() => store.get(SEEN_KEY) || '');

  const setToken = useCallback((value) => {
    store.set(TOKEN_KEY, value);
    setTokenState(value);
  }, []);

  const query = useQuery({
    queryKey: qk.chat.me(token),
    queryFn: async () => {
      try {
        return await api.chat.poll(token);
      } catch (error) {
        if (error.status === 401) setToken(null); // session no longer exists: start fresh
        throw error;
      }
    },
    enabled: Boolean(token),
    refetchInterval: open ? 4000 : 30000,
    refetchIntervalInBackground: false,
    retry: false,
    staleTime: 0,
  });

  const messages = useMemo(() => query.data?.messages || [], [query.data]);
  const lastAdminAt = [...messages].reverse().find((m) => m.sender === 'admin')?.createdAt || '';
  const unread = open ? 0 : messages.filter((m) => m.sender === 'admin' && m.createdAt > seenAt).length;

  // Opening the panel marks everything as seen (derived during render, persisted lazily).
  if (open && lastAdminAt && lastAdminAt > seenAt) {
    setSeenAt(lastAdminAt);
    store.set(SEEN_KEY, lastAdminAt);
  }

  const start = useMutation({
    mutationFn: api.chat.start,
    onSuccess: ({ token: newToken, session, messages: initial }) => {
      setToken(newToken);
      qc.setQueryData(qk.chat.me(newToken), { session, messages: initial });
    },
  });

  const send = useMutation({
    mutationFn: (body) => api.chat.send(token, body),
    onMutate: async (body) => {
      const key = qk.chat.me(token);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);
      const optimistic = { id: `temp-${Date.now()}`, sender: 'visitor', body, createdAt: new Date().toISOString(), pending: true };
      qc.setQueryData(key, (old) => (old ? { ...old, messages: [...old.messages, optimistic] } : old));
      return { previous };
    },
    onError: (_e, _b, ctx) => qc.setQueryData(qk.chat.me(token), ctx?.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.chat.me(token) }),
  });

  const reset = () => {
    setToken(null);
    store.set(SEEN_KEY, null);
    setSeenAt('');
  };

  return { token, session: query.data?.session, messages, unread, isLoading: query.isPending && Boolean(token), start, send, reset };
}
