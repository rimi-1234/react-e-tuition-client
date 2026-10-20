import { Fragment, useLayoutEffect, useRef } from 'react';
import { animate, observeInView, set } from '../lib/motion';
import { useReducedMotion } from './MotionProvider.jsx';

/**
 * Masked word-by-word headline reveal (SplitText-style).
 * Each word slides up from behind an overflow-hidden mask.
 * Screen readers get the plain sentence via aria-label.
 *
 *   <TextReveal as="h1" text="Learn from the best" highlight={['best']} />
 */
export function TextReveal({
  text,
  as: Tag = 'h2',
  className,
  delay = 0,
  stagger = 0.06,
  duration = 0.9,
  highlight = [],
  highlightClassName = 'text-gradient',
  trigger = 'inview',
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const lines = String(text).split('\n');

  useLayoutEffect(() => {
    if (reduced || !ref.current) return undefined;
    const words = ref.current.querySelectorAll('[data-word]');
    set(words, { yPercent: 110, opacity: 0 });
    let controls;
    const play = () => {
      controls = animate(words, { yPercent: 0, opacity: 1 }, { duration, delay, stagger, ease: 'out' });
    };
    if (trigger === 'mount') {
      play();
      return () => controls?.stop();
    }
    const stop = observeInView(ref.current, (v) => v && play(), { threshold: 0.2 });
    return () => {
      stop();
      controls?.stop();
    };
  }, [reduced, text, delay, stagger, duration, trigger]);

  const clean = (w) => w.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();
  const highlights = new Set(highlight.map(clean));

  return (
    <Tag ref={ref} className={className} aria-label={text.replace(/\n/g, ' ')}>
      {lines.map((line, li) => (
        <Fragment key={li}>
          {line.split(' ').map((word, wi) => (
            <span key={wi} aria-hidden="true" className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
              <span data-word className={`inline-block ${highlights.has(clean(word)) ? highlightClassName : ''}`}>
                {word}
              </span>
              {wi < line.split(' ').length - 1 && ' '}
            </span>
          ))}
          {li < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </Tag>
  );
}
