import { resolveEase } from './easing.js';
import { ticker } from './ticker.js';

/**
 * Lenis-style smooth scrolling for the window, written from scratch.
 *
 * Wheel input is intercepted and the real scroll position glides toward a
 * target with frame-rate-independent damping. The page still scrolls
 * natively (window.scrollTo), so position: sticky, anchors, find-in-page,
 * keyboard and scrollbar dragging all keep working.
 *
 * It deliberately does nothing on touch devices or with reduced motion:
 * native momentum scrolling is already smooth there and hijacking it hurts UX.
 */
export class SmoothScroll {
  constructor({ lerp = 0.15, wheelMultiplier = 1, onScroll } = {}) {
    this.lerp = lerp;
    this.wheelMultiplier = wheelMultiplier;
    this.listeners = new Set(onScroll ? [onScroll] : []);
    this.current = window.scrollY;
    this.target = window.scrollY;
    this.velocity = 0;
    this.animating = false;
    this.stopped = false;
    this.tween = null;

    this.onWheel = this.onWheel.bind(this);
    this.onNativeScroll = this.onNativeScroll.bind(this);
    this.raf = this.raf.bind(this);

    window.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('scroll', this.onNativeScroll, { passive: true });
    document.documentElement.classList.add('smooth-scroll');
    this.off = null;

    // Cache the scrollable distance; re-measure only when the page resizes
    // (reading scrollHeight on every wheel/scroll event forces layout).
    this.measure = () => (this._limit = document.documentElement.scrollHeight - window.innerHeight);
    this.measure();
    this.resizeObserver = new ResizeObserver(this.measure);
    this.resizeObserver.observe(document.body);
    window.addEventListener('resize', this.measure);
    this.overflowCache = new WeakMap();
  }

  /** Subscribe to the ticker only while there is motion to drive (idle pages cost nothing). */
  wake() {
    if (!this.off) this.off = ticker.add(this.raf);
  }

  sleep() {
    this.off?.();
    this.off = null;
  }

  get limit() {
    return this._limit;
  }

  /** Whether the wheel event should be left to a nested scroll container. */
  isInsideScrollable(event) {
    const path = event.composedPath?.() || [];
    for (const node of path) {
      if (!(node instanceof HTMLElement) || node === document.body || node === document.documentElement) continue;
      if (node.hasAttribute('data-lenis-prevent')) return true;
      // Cheap geometry check first; getComputedStyle only for elements that overflow.
      if (node.scrollHeight <= node.clientHeight + 1) continue;
      let scrollable = this.overflowCache.get(node);
      if (scrollable === undefined) {
        scrollable = /(auto|scroll)/.test(getComputedStyle(node).overflowY);
        this.overflowCache.set(node, scrollable);
      }
      if (!scrollable) continue;
      const canScroll =
        event.deltaY > 0 ? node.scrollTop + node.clientHeight < node.scrollHeight - 1 : node.scrollTop > 0;
      if (canScroll) return true;
    }
    return false;
  }

  onWheel(event) {
    if (this.stopped) {
      if (!this.isInsideScrollable(event)) event.preventDefault();
      return;
    }
    if (event.ctrlKey || event.defaultPrevented || this.isInsideScrollable(event)) return;
    event.preventDefault();

    // Normalise pixel / line / page delta modes.
    const factor = event.deltaMode === 1 ? 40 : event.deltaMode === 2 ? window.innerHeight : 1;
    this.tween = null;
    this.target = Math.min(this.limit, Math.max(0, this.target + event.deltaY * factor * this.wheelMultiplier));
    this.animating = true;
    this.wake();
  }

  onNativeScroll() {
    // Keyboard, scrollbar, find-in-page: adopt the browser's position.
    if (!this.animating && !this.tween) {
      this.current = this.target = window.scrollY;
    }
    this.emit();
  }

  raf(now, dt) {
    if (this.tween) {
      const t = this.tween;
      const p = Math.min(1, (now - t.start) / t.duration);
      this.current = t.from + (t.to - t.from) * t.ease(p);
      window.scrollTo(0, this.current);
      if (p >= 1) {
        this.tween = null;
        this.target = this.current;
        t.onComplete?.();
      }
      return;
    }
    if (!this.animating) return this.sleep();

    const prev = this.current;
    // 1 - (1 - lerp)^(dt/16.67): same feel at any refresh rate.
    const alpha = 1 - Math.pow(1 - this.lerp, dt / 16.667);
    this.current += (this.target - this.current) * alpha;
    if (Math.abs(this.target - this.current) < 0.5) {
      this.current = this.target;
      this.animating = false;
    }
    this.velocity = (this.current - prev) / Math.max(dt, 1);
    window.scrollTo(0, this.current);
  }

  emit() {
    const scroll = window.scrollY;
    const limit = this.limit;
    for (const fn of this.listeners) fn({ scroll, limit, progress: limit ? scroll / limit : 0, velocity: this.velocity });
  }

  on(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /**
   * scrollTo(number | element | '#selector', { offset, duration, immediate })
   */
  scrollTo(destination, { offset = 0, duration = 1.1, immediate = false, ease = 'inOut', onComplete } = {}) {
    let y = destination;
    if (typeof destination === 'string') destination = document.querySelector(destination);
    if (destination instanceof Element) y = destination.getBoundingClientRect().top + window.scrollY;
    if (typeof y !== 'number' || Number.isNaN(y)) return;
    y = Math.min(this.limit, Math.max(0, y + offset));

    if (immediate) {
      this.tween = null;
      this.animating = false;
      this.current = this.target = y;
      window.scrollTo(0, y);
      onComplete?.();
      return;
    }
    this.animating = false;
    this.tween = { from: window.scrollY, to: y, start: performance.now(), duration: duration * 1000, ease: resolveEase(ease), onComplete };
    this.wake();
  }

  /** Freeze scrolling (used while modals/drawers are open). */
  stop() {
    this.stopped = true;
    this.animating = false;
    this.tween = null;
  }

  start() {
    this.stopped = false;
    this.current = this.target = window.scrollY;
  }

  destroy() {
    this.off?.();
    this.resizeObserver.disconnect();
    window.removeEventListener('resize', this.measure);
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('scroll', this.onNativeScroll);
    document.documentElement.classList.remove('smooth-scroll');
    this.listeners.clear();
  }
}

/** Smooth scroll only helps precise-pointer devices without a reduced-motion preference. */
export const shouldSmoothScroll = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
