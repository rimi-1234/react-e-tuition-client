/**
 * Edurock motion engine — a dependency-free replacement for
 * framer-motion + GSAP + Lenis. React bindings live in src/motion/.
 */
export { ticker, nextFrame } from './ticker.js';
export { cubicBezier, easings, resolveEase } from './easing.js';
export { createSpring, SPRINGS } from './spring.js';
export { animate, set, createTween, getState } from './animate.js';
export { timeline } from './timeline.js';
export { SmoothScroll, shouldSmoothScroll } from './smoothScroll.js';
export { observeInView, observeProgress } from './scroll.js';

/** Reveal presets shared by <Reveal>, <Stagger> and page transitions. */
export const VARIANTS = {
  up: { opacity: [0, 1], y: [28, 0] },
  down: { opacity: [0, 1], y: [-28, 0] },
  left: { opacity: [0, 1], x: [36, 0] },
  right: { opacity: [0, 1], x: [-36, 0] },
  fade: { opacity: [0, 1] },
  scale: { opacity: [0, 1], scale: [0.94, 1] },
  blur: { opacity: [0, 1], blur: [10, 0], y: [12, 0] },
  pop: { opacity: [0, 1], scale: [0.85, 1], y: [10, 0] },
};
