import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { SmoothScroll, shouldSmoothScroll } from '../lib/motion';

const MotionContext = createContext({ reduced: false, scroller: null });

const query = '(prefers-reduced-motion: reduce)';
const prefersReduced = () => typeof window !== 'undefined' && window.matchMedia(query).matches;

/**
 * Provides the reduced-motion preference and the smooth-scroll instance.
 * Every animated component reads `reduced` and skips straight to the final
 * state when it is true, so motion never blocks content.
 */
export function MotionProvider({ children }) {
  const [reduced, setReduced] = useState(prefersReduced);
  const [scroller, setScroller] = useState(null);
  const scrollerRef = useRef(null);

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setReduced(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!shouldSmoothScroll() || reduced) return undefined;
    const instance = new SmoothScroll({ lerp: 0.15 });
    scrollerRef.current = instance;
    setScroller(instance);
    return () => {
      instance.destroy();
      scrollerRef.current = null;
      setScroller(null);
    };
  }, [reduced]);

  // In-page anchor links glide instead of jumping.
  useEffect(() => {
    const onClick = (event) => {
      const link = event.target.closest?.('a[href^="#"]');
      if (!link || link.getAttribute('href').length < 2) return;
      const el = document.querySelector(link.getAttribute('href'));
      if (!el) return;
      event.preventDefault();
      scrollTo(el, { offset: -88 });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  });

  const scrollTo = (target, options = {}) => {
    if (scrollerRef.current) return scrollerRef.current.scrollTo(target, options);
    const y =
      typeof target === 'number'
        ? target
        : (typeof target === 'string' ? document.querySelector(target) : target)?.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: (y || 0) + (options.offset || 0), behavior: options.immediate || reduced ? 'auto' : 'smooth' });
  };

  const value = useMemo(
    () => ({
      reduced,
      scroller,
      scrollTo,
      lockScroll: () => scrollerRef.current?.stop(),
      unlockScroll: () => scrollerRef.current?.start(),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reduced, scroller],
  );

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export const useMotion = () => useContext(MotionContext);
export const useReducedMotion = () => useContext(MotionContext).reduced;
