import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';

/** Debounced copy of a value (search inputs). */
export function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/**
 * Filters stored in the URL query string, so results are shareable,
 * bookmarkable and survive refresh/back navigation.
 *
 *   const [filters, setFilters, reset] = useUrlFilters({ page: 1, sort: 'newest', search: '' });
 *   setFilters({ subject: 'Physics' })  // also resets page to 1
 */
export function useUrlFilters(defaults) {
  const [params, setParams] = useSearchParams();
  // Defaults are captured once; callers pass a module-level constant.
  const [base] = useState(defaults);

  const filters = useMemo(() => {
    const out = { ...base };
    for (const key of Object.keys(out)) {
      const raw = params.get(key);
      if (raw === null) continue;
      out[key] = typeof out[key] === 'number' ? Number(raw) || out[key] : raw;
    }
    return out;
  }, [params, base]);

  const setFilters = useCallback(
    (patch) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const resetPage = !('page' in patch);
          for (const [k, v] of Object.entries(patch)) {
            if (v === '' || v === undefined || v === null || v === base[k]) next.delete(k);
            else next.set(k, String(v));
          }
          if (resetPage) next.delete('page');
          return next;
        },
        { replace: true, preventScrollReset: true },
      );
    },
    [setParams, base],
  );

  const reset = useCallback(() => setParams({}, { replace: true }), [setParams]);
  const activeCount = Object.keys(base).filter((k) => !['page', 'sort'].includes(k) && params.get(k)).length;

  return [filters, setFilters, reset, activeCount];
}
