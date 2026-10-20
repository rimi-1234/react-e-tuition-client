import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../../hooks/useUrlState';
import { cn } from '../../utils/cn';

/**
 * Search box that types instantly but reports a debounced value.
 * Stays in sync when `value` changes from outside (URL, reset).
 */
export function SearchField({ value, onSearch, label = 'Search', placeholder = 'Search…', className }) {
  const [text, setText] = useState(value);
  const debounced = useDebounce(text);
  const [synced, setSynced] = useState(value);
  if (value !== synced) {
    setSynced(value);
    if (value !== debounced) setText(value);
  }

  useEffect(() => {
    if (debounced !== value) onSearch(debounced.trim() === '' ? '' : debounced);
    // Only react to the debounced text; `value`/`onSearch` changing must not re-fire a search.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <label
      className={cn(
        'flex h-11 w-full items-center gap-2.5 rounded-xl border border-soft bg-base-100 px-3.5 transition-[border-color,box-shadow] focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/12 sm:max-w-xs',
        className,
      )}
    >
      <Search className="size-[18px] shrink-0 text-subtle" aria-hidden />
      <span className="sr-only">{label}</span>
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="h-full w-full min-w-0 bg-transparent text-[15px] outline-none placeholder:text-subtle [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button type="button" onClick={() => setText('')} className="rounded-lg p-1 text-subtle transition-colors hover:bg-soft hover:text-base-content" aria-label="Clear search">
          <X className="size-4" aria-hidden />
        </button>
      )}
    </label>
  );
}
