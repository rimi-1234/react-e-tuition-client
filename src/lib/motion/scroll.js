import { nextFrame } from './ticker.js';

/**
 * Viewport observers (the ScrollTrigger-ish layer).
 *
 * observeInView: one shared IntersectionObserver per option set, so 200
 * reveal elements cost one observer, not 200.
 */
const observers = new Map();

export function observeInView(el, callback, { threshold = 0.15, rootMargin = '0px 0px -8% 0px', once = true } = {}) {
  if (!el) return () => {};
  if (typeof IntersectionObserver === 'undefined') {
    callback(true);
    return () => {};
  }
  const key = `${threshold}|${rootMargin}`;
  let entry = observers.get(key);
  if (!entry) {
    const handlers = new Map();
    const io = new IntersectionObserver(
      (records) => {
        for (const r of records) handlers.get(r.target)?.(r.isIntersecting, r);
      },
      { threshold, rootMargin },
    );
    entry = { io, handlers };
    observers.set(key, entry);
  }

  const stop = () => {
    entry.handlers.delete(el);
    entry.io.unobserve(el);
  };
  entry.handlers.set(el, (visible, record) => {
    callback(visible, record);
    if (visible && once) stop();
  });
  entry.io.observe(el);
  return stop;
}

/**
 * observeProgress: reports 0→1 as `el` travels through the viewport.
 * start/end use "<element edge> <viewport edge>" like ScrollTrigger:
 *   start 'top bottom'  → progress 0 when the element's top meets the viewport bottom
 *   end   'bottom top'  → progress 1 when the element's bottom meets the viewport top
 * Work only happens while the element is near the viewport.
 */
export function observeProgress(el, callback, { start = 'top bottom', end = 'bottom top' } = {}) {
  if (!el) return () => {};
  const edge = (spec, rect, vh) => {
    const [elEdge, vpEdge] = spec.split(' ');
    const elPos = elEdge === 'top' ? rect.top : elEdge === 'center' ? rect.top + rect.height / 2 : rect.bottom;
    const vpPos = vpEdge === 'top' ? 0 : vpEdge === 'center' ? vh / 2 : vh;
    return elPos - vpPos;
  };

  let last = -1;
  const measure = () => {
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const a = edge(start, rect, vh);
    const b = edge(end, rect, vh);
    const p = a === b ? (a < 0 ? 1 : 0) : Math.min(1, Math.max(0, a / (a - b)));
    if (Math.abs(p - last) > 0.0005) {
      last = p;
      callback(p);
    }
  };

  // Event-driven: measure at most once per frame, and only after the page
  // actually scrolled or resized. An idle page does zero work.
  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    nextFrame(() => {
      queued = false;
      measure();
    });
  };

  let listening = false;
  const listen = (on) => {
    if (on === listening) return;
    listening = on;
    const method = on ? 'addEventListener' : 'removeEventListener';
    window[method]('scroll', schedule, { passive: true });
    window[method]('resize', schedule);
  };

  const stopVisibility = observeInView(
    el,
    (visible) => {
      listen(visible);
      schedule();
    },
    { threshold: 0, rootMargin: '20% 0px 20% 0px', once: false },
  );
  schedule();

  return () => {
    stopVisibility();
    listen(false);
  };
}
