import { useEffect } from 'react';

/** Sets the tab title ("Page · Edurock") and restores it on unmount. */
export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · Edurock` : 'Edurock';
    return () => {
      document.title = previous;
    };
  }, [title]);
}
