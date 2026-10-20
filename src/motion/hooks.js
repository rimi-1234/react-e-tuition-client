import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, createSpring, observeInView, observeProgress, ticker } from '../lib/motion';
import { useMotion, useReducedMotion } from './MotionProvider.jsx';

/** true once (or while) the element is in the viewport. */
export function useInView(ref, { once = true, threshold = 0.15, rootMargin } = {}) {
  const [inView, setInView] = useState(false);
  useEffect(() => observeInView(ref.current, setInView, { once, threshold, rootMargin }), [ref, once, threshold, rootMargin]);
  return inView;
}

/**
 * Scroll-linked progress (0..1) delivered to a callback — no React
 * re-renders per frame. Write styles directly inside `onProgress`.
 */
export function useScrollProgress(ref, onProgress, options) {
  const cb = useRef(onProgress);
  useLayoutEffect(() => {
    cb.current = onProgress;
  });
  const reduced = useReducedMotion();
  const { start, end, enabled = true } = options || {};
  useEffect(() => {
    if (reduced || !enabled) return undefined;
    return observeProgress(ref.current, (p) => cb.current(p), { start, end });
  }, [ref, reduced, start, end, enabled]);
}

/** Imperative animate() bound to a ref, respecting reduced motion. */
export function useAnimate() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const run = (target, props, opts = {}) => animate(target ?? ref.current, props, { ...opts, reduced: reduced || opts.reduced });
  return [ref, run];
}

/**
 * Coarse window-scroll state for chrome like the navbar: whether the page is
 * scrolled, the last direction, and whether we're past `offset` pixels.
 * Only these booleans live in state, so React re-renders when one flips,
 * not on every scroll frame.
 */
export function useWindowScroll({ offset = 320 } = {}) {
  const { scroller } = useMotion();
  const [state, setState] = useState({ scrolled: false, direction: 'up', past: false });
  useEffect(() => {
    let lastY = window.scrollY;
    let queued = false;
    const update = () => {
      queued = false;
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      setState((prev) => {
        const direction = Math.abs(delta) < 4 ? prev.direction : delta > 0 ? 'down' : 'up';
        const next = { scrolled: y > 12, direction, past: y > offset };
        return next.scrolled === prev.scrolled && next.direction === prev.direction && next.past === prev.past ? prev : next;
      });
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [scroller, offset]);
  return state;
}

/**
 * A spring-driven numeric value that writes through `onChange` (for
 * pointer-follow effects like magnetic buttons and tilt cards).
 */
export function useSpringValue(onChange, config) {
  const springRef = useRef(null);
  const offRef = useRef(null);
  const cb = useRef(onChange);
  useLayoutEffect(() => {
    cb.current = onChange;
  });

  useEffect(() => () => offRef.current?.(), []);

  return (target) => {
    if (!springRef.current) springRef.current = createSpring({ from: 0, to: 0, ...config });
    springRef.current.target = target;
    if (offRef.current) return;
    offRef.current = ticker.add((_, dt) => {
      const { value, done } = springRef.current.step(dt);
      cb.current(value);
      if (done) {
        offRef.current();
        offRef.current = null;
      }
    });
  };
}

/** Live result of a media query (e.g. desktop + fine pointer checks). */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}
