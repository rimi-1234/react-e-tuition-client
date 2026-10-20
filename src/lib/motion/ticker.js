/**
 * One requestAnimationFrame loop shared by every animation, smooth scroll
 * and scroll-linked effect (the same idea as GSAP's ticker). Batching all
 * work into a single frame callback avoids N competing rAF loops.
 *
 * Subscribers receive (time, deltaMs). Delta is clamped so a backgrounded
 * tab does not make animations jump when it becomes visible again.
 */
const subscribers = new Set();
let frame = 0;
let last = 0;

function loop(now) {
  const delta = Math.min(now - last, 64);
  last = now;
  for (const fn of subscribers) fn(now, delta);
  frame = subscribers.size ? requestAnimationFrame(loop) : 0;
}

export const ticker = {
  add(fn) {
    subscribers.add(fn);
    if (!frame) {
      last = performance.now();
      frame = requestAnimationFrame(loop);
    }
    return () => subscribers.delete(fn);
  },
  remove(fn) {
    subscribers.delete(fn);
  },
  get size() {
    return subscribers.size;
  },
};

/** Run `fn` once on the next frame (read/write batching helper). */
export const nextFrame = (fn) => {
  const off = ticker.add((t, d) => {
    off();
    fn(t, d);
  });
  return off;
};
