import { resolveEase } from './easing.js';
import { SPRINGS, createSpring } from './spring.js';
import { ticker } from './ticker.js';

/**
 * animate(target, props, options) — the core tween API (framer-motion's
 * `animate` / GSAP's `to`) built on the shared ticker.
 *
 *   animate(el, { opacity: [0, 1], y: [24, 0] }, { duration: 0.6, ease: 'out' })
 *   animate(els, { scale: 1.05 }, { spring: 'snappy', stagger: 0.05 })
 *   animate({ value: 0 }, { value: 100 }, { onUpdate: ({ value }) => … })
 *
 * Element props: x, y (px), xPercent, yPercent, scale, scaleX, scaleY,
 * rotate (deg), opacity, blur (px). Transform parts are tracked per element,
 * so animating `y` never clobbers an in-flight `scale`.
 * Values can be `to` or `[from, to]`.
 */

const TRANSFORM_KEYS = ['x', 'y', 'xPercent', 'yPercent', 'scale', 'scaleX', 'scaleY', 'rotate'];
const DEFAULTS = { x: 0, y: 0, xPercent: 0, yPercent: 0, scale: 1, scaleX: 1, scaleY: 1, rotate: 0, opacity: 1, blur: 0 };

const stateMap = new WeakMap();
const running = new WeakMap(); // element → Map(prop → stop fn)

export function getState(el) {
  let s = stateMap.get(el);
  if (!s) {
    s = { ...DEFAULTS };
    const computed = el instanceof Element ? getComputedStyle(el).opacity : null;
    if (computed !== null && computed !== '') s.opacity = Number(computed);
    stateMap.set(el, s);
  }
  return s;
}

function render(el, s) {
  const { style } = el;
  style.transform =
    `translate3d(${s.xPercent ? `calc(${s.xPercent}% + ${s.x}px)` : `${s.x}px`}, ${s.yPercent ? `calc(${s.yPercent}% + ${s.y}px)` : `${s.y}px`}, 0)` +
    (s.scale !== 1 ? ` scale(${s.scale})` : '') +
    (s.scaleX !== 1 ? ` scaleX(${s.scaleX})` : '') +
    (s.scaleY !== 1 ? ` scaleY(${s.scaleY})` : '') +
    (s.rotate ? ` rotate(${s.rotate}deg)` : '');
  style.opacity = String(s.opacity);
  style.filter = s.blur > 0.01 ? `blur(${s.blur}px)` : '';
}

/** Immediately set animatable props without tweening (GSAP `set`). */
export function set(target, props) {
  for (const el of toArray(target)) {
    if (!(el instanceof Element)) {
      Object.assign(el, props);
      continue;
    }
    const s = getState(el);
    for (const [k, v] of Object.entries(props)) s[k] = Array.isArray(v) ? v[v.length - 1] : v;
    render(el, s);
  }
}

const toArray = (t) => {
  if (t == null) return [];
  if (t instanceof Element || typeof t === 'string' || !(Symbol.iterator in Object(t))) return [t];
  return Array.from(t).filter(Boolean);
};

/**
 * Builds a seekable renderer for one element: `render(progress)` writes the
 * interpolated values. Shared by `animate` (time-driven) and `timeline`.
 */
export function createTween(el, props, { ease = 'out', onUpdate } = {}) {
  const isEl = el instanceof Element;
  const state = isEl ? getState(el) : el;
  const easeFn = resolveEase(ease);
  const tracks = Object.entries(props).map(([key, value]) => {
    const [from, to] = Array.isArray(value) ? value : [state[key] ?? DEFAULTS[key] ?? 0, value];
    return { key, from: Number(from), to: Number(to) };
  });

  return {
    tracks,
    prime() {
      // Apply "from" values right away (avoids a flash before the first frame).
      for (const t of tracks) state[t.key] = t.from;
      if (isEl) render(el, state);
    },
    render(progress) {
      const p = easeFn(Math.min(1, Math.max(0, progress)));
      for (const t of tracks) state[t.key] = t.from + (t.to - t.from) * p;
      if (isEl) render(el, state);
      onUpdate?.(state, p);
    },
  };
}

function claim(el, keys, stop) {
  if (!(el instanceof Element)) return;
  let m = running.get(el);
  if (!m) running.set(el, (m = new Map()));
  for (const k of keys) {
    m.get(k)?.(); // a new animation on the same prop interrupts the old one
    m.set(k, stop);
  }
}

function release(el, keys, stop) {
  const m = running.get(el);
  if (!m) return;
  for (const k of keys) if (m.get(k) === stop) m.delete(k);
}

/**
 * @returns {{ finished: Promise<void>, stop: () => void }}
 */
export function animate(target, props, options = {}) {
  const { duration = 0.6, delay = 0, stagger = 0, spring, onComplete, reduced = false } = options;
  const elements = toArray(target);
  const controls = [];

  elements.forEach((el, index) => {
    const startDelay = (delay + index * stagger) * 1000;
    let stopped = false;
    let off;
    let resolveDone;
    const done = new Promise((r) => (resolveDone = r));
    const keys = Object.keys(props);

    const stop = () => {
      stopped = true;
      off?.();
      release(el, keys, stop);
      resolveDone();
    };
    claim(el, keys, stop);

    if (reduced) {
      set(el, props);
      options.onUpdate?.(el instanceof Element ? getState(el) : el, 1);
      resolveDone();
      controls.push({ done, stop });
      return;
    }

    if (spring) {
      const config = typeof spring === 'string' ? undefined : spring;
      const tween = createTween(el, props, options);
      const state = el instanceof Element ? getState(el) : el;
      const springs = tween.tracks.map((t) =>
        createSpring({ from: t.from, to: t.to, ...(config || springPreset(spring)), velocity: options.velocity?.[t.key] || 0 }),
      );
      let waited = 0;
      off = ticker.add((_, dt) => {
        if (stopped) return;
        if (waited < startDelay) {
          waited += dt;
          return;
        }
        let allDone = true;
        tween.tracks.forEach((t, i) => {
          const r = springs[i].step(dt);
          state[t.key] = r.value;
          allDone &&= r.done;
        });
        if (el instanceof Element) render(el, state);
        options.onUpdate?.(state);
        if (allDone) {
          stop();
          onComplete?.();
        }
      });
    } else {
      const tween = createTween(el, props, options);
      if (Object.values(props).some(Array.isArray)) tween.prime();
      const total = duration * 1000;
      let elapsed = -startDelay;
      off = ticker.add((_, dt) => {
        if (stopped) return;
        elapsed += dt;
        if (elapsed < 0) return;
        const p = total ? elapsed / total : 1;
        tween.render(p);
        if (p >= 1) {
          stop();
          onComplete?.();
        }
      });
    }
    controls.push({ done, stop });
  });

  return {
    finished: Promise.all(controls.map((c) => c.done)).then(() => undefined),
    stop: () => controls.forEach((c) => c.stop()),
  };
}

const springPreset = (name) => SPRINGS[name] || SPRINGS.gentle;
