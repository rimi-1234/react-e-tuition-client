import { useState, useEffect } from 'react';

/**
 * useDebounce – delays updating `value` until `delay` ms have passed
 * without a new call.  Use it to avoid firing an API request on every
 * keystroke when the user is still typing.
 *
 * Example:
 *   const [search, setSearch] = useState('');
 *   const debouncedSearch = useDebounce(search, 400);
 *
 *   // debouncedSearch only changes 400 ms after the user stops typing.
 */
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
