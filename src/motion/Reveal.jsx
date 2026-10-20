import { useLayoutEffect, useRef } from 'react';
import { VARIANTS, animate, observeInView, set } from '../lib/motion';
import { useReducedMotion } from './MotionProvider.jsx';

/**
 * Scroll-triggered reveal (framer-motion's `whileInView`).
 *
 *   <Reveal variant="up" delay={0.1}>…</Reveal>
 *   <Reveal stagger={0.08} as="ul">{items.map(i => <li>…</li>)}</Reveal>
 *
 * With `stagger`, the direct children (or elements marked
 * [data-reveal]) animate one after another instead of the wrapper.
 * The hidden state is applied before paint (layout effect) so there is no
 * flash, and is skipped entirely with reduced motion.
 */
export function Reveal({
  as: Tag = 'div',
  variant = 'up',
  delay = 0,
  duration = 0.8,
  stagger,
  once = true,
  threshold = 0.15,
  ease = 'out',
  className,
  children,
  ...rest
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || reduced) return undefined;

    const props = typeof variant === 'string' ? VARIANTS[variant] || VARIANTS.up : variant;
    const targets = () => {
      if (stagger === undefined) return [root];
      const marked = root.querySelectorAll('[data-reveal]');
      return marked.length ? [...marked] : [...root.children];
    };
    const from = Object.fromEntries(Object.entries(props).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
    const to = Object.fromEntries(Object.entries(props).map(([k, v]) => [k, Array.isArray(v) ? v[1] : v]));

    set(targets(), from);

    let controls;
    const stop = observeInView(
      root,
      (visible) => {
        if (visible) {
          const animated = targets();
          // Promote to GPU layers only for the duration of the animation;
          // dozens of permanent layers cost memory and cause scroll jank.
          animated.forEach((el) => (el.style.willChange = 'transform, opacity'));
          controls = animate(animated, to, { duration, delay, stagger: stagger || 0, ease });
          // Once every element has settled, drop the inline styles so CSS
          // (hover transforms etc.) owns the elements again.
          controls.finished.then(() =>
            animated.forEach((el) => {
              el.style.willChange = '';
              if (once) {
                el.style.transform = '';
                el.style.opacity = '';
                el.style.filter = '';
              }
            }),
          );
        } else if (!once) {
          controls?.stop();
          set(targets(), from);
        }
      },
      { once, threshold },
    );
    return () => {
      stop();
      controls?.stop();
    };
    // Re-run only when the motion config changes, not on every child render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, variant, delay, duration, stagger, once, threshold]);

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}

/** Convenience: <Stagger> is a <Reveal> that animates its children in sequence. */
export const Stagger = ({ stagger = 0.08, ...props }) => <Reveal stagger={stagger} {...props} />;
