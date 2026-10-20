import { createTween } from './animate.js';
import { ticker } from './ticker.js';

/**
 * GSAP-style timeline: sequence tweens on one clock, then play, pause,
 * reverse or scrub them.
 *
 *   timeline()
 *     .to(title, { opacity: [0, 1], y: [40, 0] }, { duration: 0.8 })
 *     .to(cards, { opacity: [0, 1], y: [20, 0] }, { stagger: 0.08 }, '-=0.4')
 *     .play();
 *
 * Position parameter: number (absolute seconds), '<' (with previous),
 * '>' (after previous, the default), '+=0.2' / '-=0.2' (relative to end),
 * or a label name added with .label().
 */
export function timeline({ defaults = {}, onComplete, paused = true } = {}) {
  const items = [];
  const labels = {};
  let cursor = 0;
  let prevStart = 0;
  let duration = 0;
  let time = 0;
  let direction = 1;
  let off = null;
  let resolve;
  let finished = new Promise((r) => (resolve = r));

  const resolvePosition = (position) => {
    if (position === undefined || position === '>') return cursor;
    if (typeof position === 'number') return position;
    if (position === '<') return prevStart;
    if (labels[position] !== undefined) return labels[position];
    const m = /^([+-])=([\d.]+)$/.exec(position);
    if (m) return Math.max(0, cursor + (m[1] === '+' ? 1 : -1) * Number(m[2]));
    return cursor;
  };

  const renderAt = (t) => {
    for (const item of items) {
      const local = item.duration ? (t - item.start) / item.duration : t >= item.start ? 1 : 0;
      // Only touch tweens whose window we are in or just crossed (keeps idle tweens cheap).
      if (local >= 0 && local <= 1) item.tween.render(local);
      else if (local > 1 && item.last !== 1) item.tween.render(1);
      else if (local < 0 && item.last !== 0) item.tween.render(0);
      item.last = local >= 1 ? 1 : local <= 0 ? 0 : local;
    }
  };

  const api = {
    to(target, props, opts = {}, position) {
      const o = { ...defaults, ...opts };
      const d = o.duration ?? 0.6;
      const stagger = o.stagger ?? 0;
      const start = resolvePosition(position) + (o.delay ?? 0);
      const els = target instanceof Element || !(Symbol.iterator in Object(target)) ? [target] : [...target];
      els.forEach((el, i) => {
        const tween = createTween(el, props, o);
        items.push({ tween, start: start + i * stagger, duration: d, last: -1 });
      });
      const end = start + d + stagger * Math.max(0, els.length - 1);
      prevStart = start;
      cursor = Math.max(cursor, end);
      duration = Math.max(duration, end);
      return api;
    },
    /** Apply the from-state of every tween now (call before first paint). */
    prime() {
      [...items].reverse().forEach((i) => i.tween.render(0));
      return api;
    },
    label(name, position) {
      labels[name] = resolvePosition(position);
      return api;
    },
    call(fn, position) {
      const start = resolvePosition(position);
      let fired = false;
      items.push({
        start,
        duration: 0,
        last: -1,
        tween: { render: (p) => (p >= 1 && !fired ? ((fired = true), fn()) : p < 1 && (fired = false)) },
      });
      return api;
    },
    play() {
      direction = 1;
      return run();
    },
    reverse() {
      direction = -1;
      return run();
    },
    pause() {
      off?.();
      off = null;
      return api;
    },
    seek(seconds) {
      time = Math.min(duration, Math.max(0, seconds));
      renderAt(time);
      return api;
    },
    /** 0..1 — handy for scroll-scrubbed timelines. */
    progress(p) {
      if (p === undefined) return duration ? time / duration : 0;
      return api.seek(p * duration);
    },
    kill() {
      api.pause();
      items.length = 0;
    },
    get duration() {
      return duration;
    },
    get finished() {
      return finished;
    },
  };

  function run() {
    off?.();
    off = ticker.add((_, dt) => {
      time += (dt / 1000) * direction;
      const atEnd = direction > 0 ? time >= duration : time <= 0;
      time = Math.min(duration, Math.max(0, time));
      renderAt(time);
      if (atEnd) {
        api.pause();
        if (direction > 0) onComplete?.();
        resolve();
        finished = new Promise((r) => (resolve = r));
      }
    });
    return api;
  }

  if (!paused) queueMicrotask(() => api.play());
  return api;
}
