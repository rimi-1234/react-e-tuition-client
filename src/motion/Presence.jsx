import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, set } from '../lib/motion';
import { useReducedMotion } from './MotionProvider.jsx';

/**
 * Mount/unmount animations (framer-motion's AnimatePresence for a single child).
 * Keeps children mounted until the exit animation finishes.
 *
 *   <Presence show={open} enter={{ opacity: [0, 1], y: [8, 0] }} exit={{ opacity: 0, y: 8 }}>
 *     <Menu />
 *   </Presence>
 */
export function Presence({
  show,
  as: Tag = 'div',
  enter = { opacity: [0, 1], y: [8, 0], scale: [0.98, 1] },
  exit = { opacity: 0, y: 6, scale: 0.98 },
  duration = 0.28,
  exitDuration = 0.18,
  onExited,
  className,
  children,
  ...rest
}) {
  const [mounted, setMounted] = useState(show);
  const ref = useRef(null);
  const reduced = useReducedMotion();

  // Derive "should be mounted" during render so the enter frame is never missed.
  if (show && !mounted) setMounted(true);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !show) return undefined;
    if (reduced) {
      set(el, Object.fromEntries(Object.entries(enter).map(([k, v]) => [k, Array.isArray(v) ? v[1] : v])));
      return undefined;
    }
    const c = animate(el, enter, { duration, ease: 'out' });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, mounted, reduced]);

  useEffect(() => {
    if (show || !mounted) return undefined;
    const el = ref.current;
    if (!el || reduced) {
      setMounted(false);
      onExited?.();
      return undefined;
    }
    const c = animate(el, exit, { duration: exitDuration, ease: 'in' });
    c.finished.then(() => {
      setMounted(false);
      onExited?.();
    });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  if (!mounted) return null;
  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
