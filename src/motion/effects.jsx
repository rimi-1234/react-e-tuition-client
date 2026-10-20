import { useEffect, useLayoutEffect, useRef } from 'react';
import { animate, set } from '../lib/motion';
import { useInView, useMediaQuery, useScrollProgress, useSpringValue } from './hooks.js';
import { useReducedMotion } from './MotionProvider.jsx';

/** Pointer-following "magnetic" pull for CTAs. Disabled on touch & reduced motion. */
export function Magnetic({ strength = 0.25, className = '', children }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const pos = useRef({ x: 0, y: 0 });
  const apply = () => set(ref.current, { x: pos.current.x, y: pos.current.y });
  const springX = useSpringValue((v) => ((pos.current.x = v), apply()), { stiffness: 200, damping: 18 });
  const springY = useSpringValue((v) => ((pos.current.y = v), apply()), { stiffness: 200, damping: 18 });

  const onMove = (e) => {
    if (reduced || e.pointerType !== 'mouse') return;
    const r = ref.current.getBoundingClientRect();
    springX((e.clientX - (r.left + r.width / 2)) * strength);
    springY((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const onLeave = () => {
    springX(0);
    springY(0);
  };

  return (
    <span ref={ref} className={`inline-flex ${className}`} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </span>
  );
}

/**
 * 3D tilt + spotlight on hover. Writes CSS variables (--mx/--my) that the
 * `.spotlight` utility uses for a soft radial highlight.
 */
export function Tilt({ max = 6, className = '', children, ...rest }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const rot = useRef({ x: 0, y: 0 });
  const write = () => {
    if (ref.current) ref.current.style.transform = `perspective(900px) rotateX(${rot.current.x}deg) rotateY(${rot.current.y}deg)`;
  };
  const sx = useSpringValue((v) => ((rot.current.x = v), write()), { stiffness: 150, damping: 16 });
  const sy = useSpringValue((v) => ((rot.current.y = v), write()), { stiffness: 150, damping: 16 });

  const onMove = (e) => {
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
    if (reduced || e.pointerType !== 'mouse') return;
    sx((0.5 - py) * max * 2);
    sy((px - 0.5) * max * 2);
  };
  const onLeave = () => {
    sx(0);
    sy(0);
  };

  return (
    <div ref={ref} className={`spotlight ${className}`} onPointerMove={onMove} onPointerLeave={onLeave} {...rest}>
      {children}
    </div>
  );
}

/** Scroll parallax: moves children by `speed` × viewport travel. */
export function Parallax({ speed = 0.15, className = '', children, as: Tag = 'div' }) {
  const ref = useRef(null);
  const inner = useRef(null);
  useScrollProgress(ref, (p) => {
    if (inner.current) inner.current.style.transform = `translate3d(0, ${(p - 0.5) * speed * -400}px, 0)`;
  });
  return (
    <Tag ref={ref} className={className}>
      <div ref={inner} className="will-change-transform">
        {children}
      </div>
    </Tag>
  );
}

/**
 * Full-bleed background photo that drifts slower than the page (depth effect).
 * The image is scaled up by `speed` so the travel never reveals an edge, and
 * only its transform changes, so the whole effect stays on the compositor.
 *
 *   <ParallaxImage photo={PHOTOS.classroom} className="absolute inset-0" />
 */
export function ParallaxImage({ photo, speed = 0.24, className = '', imgClassName = '', priority = false, sizes = '100vw' }) {
  const ref = useRef(null);
  const img = useRef(null);
  // Parallax only where it is cheap and pleasant: large screens with a mouse.
  // Touch devices keep native momentum scrolling over a static photo.
  const enabled = useMediaQuery('(min-width: 1024px) and (pointer: fine)');
  const scale = enabled ? 1 + speed : 1;
  useScrollProgress(
    ref,
    (p) => {
      if (img.current) img.current.style.transform = `translate3d(0, ${((p - 0.5) * speed * 100).toFixed(2)}%, 0) scale(${scale})`;
    },
    { enabled },
  );

  return (
    // contain: paint keeps the moving photo's repaints inside this box.
    <div ref={ref} className={`overflow-hidden ${className}`} style={{ contain: 'paint' }}>
      <img
        ref={img}
        src={photo.src}
        srcSet={photo.srcSet}
        sizes={sizes}
        alt={photo.alt || ''}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        onError={(e) => {
          if (!photo.fallback || e.currentTarget.dataset.fallback) return;
          e.currentTarget.dataset.fallback = '1';
          e.currentTarget.removeAttribute('srcset');
          e.currentTarget.src = photo.fallback;
        }}
        style={{ transform: `translate3d(0, 0, 0) scale(${scale})` }}
        className={`absolute inset-0 size-full object-cover ${enabled ? 'will-change-transform' : ''} ${imgClassName}`}
      />
    </div>
  );
}

const defaultFormat = (n) => Math.round(n).toLocaleString('en-US');

/**
 * Number that counts up when scrolled into view. Frames write straight to the
 * text node, so React doesn't re-render 60 times a second.
 */
export function CountUp({ to = 0, from = 0, duration = 1.6, format = defaultFormat, className, suffix = '', prefix = '' }) {
  const ref = useRef(null);
  const textRef = useRef(null);
  const inView = useInView(ref, { threshold: 0.4 });
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = textRef.current;
    if (!node) return undefined;
    if (!inView || reduced) {
      node.textContent = format(reduced ? to : from);
      return undefined;
    }
    const counter = { n: from };
    const c = animate(counter, { n: to }, {
      duration,
      ease: 'expoOut',
      onUpdate: (s) => (node.textContent = format(s.n)),
    });
    return () => c.stop();
    // `format` is usually an inline arrow; changes to it don't need a restart.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, to, from, duration, reduced]);

  return (
    <span ref={ref} className={`tabular-nums ${className || ''}`}>
      {prefix}
      <span ref={textRef}>{format(reduced ? to : from)}</span>
      {suffix}
    </span>
  );
}

/**
 * Infinite horizontal marquee (CSS-driven). Pauses on hover, with reduced
 * motion, and whenever it is scrolled out of view.
 */
export function Marquee({ children, speed = 40, reverse = false, className = '' }) {
  const ref = useRef(null);
  const visible = useInView(ref, { once: false, threshold: 0 });
  return (
    <div
      ref={ref}
      className={`marquee group ${visible ? '' : 'marquee-paused'} ${className}`}
      style={{ '--marquee-duration': `${speed}s` }}
    >
      {[0, 1].map((copy) => (
        <div key={copy} aria-hidden={copy === 1} className={`marquee-track ${reverse ? 'marquee-reverse' : ''}`}>
          {children}
        </div>
      ))}
    </div>
  );
}

/** Thin reading-progress bar pinned to the top of the viewport. */
export function ScrollProgressBar() {
  const ref = useRef(null);
  useEffect(() => {
    let queued = false;
    const update = () => {
      queued = false;
      const limit = document.documentElement.scrollHeight - window.innerHeight;
      if (ref.current) ref.current.style.transform = `scaleX(${limit > 0 ? window.scrollY / limit : 0})`;
    };
    const onScroll = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return <div ref={ref} className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left scale-x-0 bg-linear-to-r from-primary via-primary to-accent" />;
}

/** Plays a one-off entrance on mount (used for route transitions). */
export function Enter({ children, className, from = { opacity: 0, y: 6 }, duration = 0.35, ...rest }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  // Layout effect: the start state is applied before paint (no flash of the final state).
  useLayoutEffect(() => {
    if (reduced || !ref.current) return undefined;
    const props = Object.fromEntries(Object.entries(from).map(([k, v]) => [k, [v, k === 'opacity' || k.startsWith('scale') ? 1 : 0]]));
    const el = ref.current;
    const c = animate(el, props, {
      duration,
      ease: 'out',
      // A lingering transform would turn this wrapper into the containing
      // block for position:fixed descendants, so clear it once settled.
      onComplete: () => {
        el.style.transform = '';
        el.style.opacity = '';
        el.style.filter = '';
      },
    });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);
  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  );
}
