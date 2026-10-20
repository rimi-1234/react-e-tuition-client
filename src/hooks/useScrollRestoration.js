import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useMotion } from '../motion';

/** Scrolls to top on route change (or to the #hash target). */
export function useScrollRestoration() {
  const { pathname, hash } = useLocation();
  const { scrollTo } = useMotion();
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => scrollTo(hash, { offset: -88 }), 120);
      return () => clearTimeout(t);
    }
    scrollTo(0, { immediate: true });
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, hash]);
}
