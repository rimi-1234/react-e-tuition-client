import { cn } from '../../utils/cn';

// Hidden state, shown state and arrow placement per side.
const SIDES = {
  left: {
    box: 'right-full top-1/2 mr-3 -translate-y-1/2 translate-x-2 origin-right',
    show: 'group-hover/tip:translate-x-0 group-has-[:focus-visible]/tip:translate-x-0',
    arrow: '-right-1 top-1/2 -translate-y-1/2',
  },
  right: {
    box: 'left-full top-1/2 ml-3 -translate-y-1/2 -translate-x-2 origin-left',
    show: 'group-hover/tip:translate-x-0 group-has-[:focus-visible]/tip:translate-x-0',
    arrow: '-left-1 top-1/2 -translate-y-1/2',
  },
  top: {
    box: 'bottom-full left-1/2 mb-3 -translate-x-1/2 translate-y-1.5 origin-bottom',
    show: 'group-hover/tip:translate-y-0 group-has-[:focus-visible]/tip:translate-y-0',
    arrow: '-bottom-1 left-1/2 -translate-x-1/2',
  },
  bottom: {
    box: 'top-full left-1/2 mt-3 -translate-x-1/2 -translate-y-1.5 origin-top',
    show: 'group-hover/tip:translate-y-0 group-has-[:focus-visible]/tip:translate-y-0',
    arrow: '-top-1 left-1/2 -translate-x-1/2',
  },
};

/**
 * Lightweight animated tooltip (pure CSS, no positioning library).
 * Appears on hover (pointer devices only) or keyboard focus, slides in from
 * the trigger with a short delay so quick pointer passes don't flicker.
 * The trigger should carry its own aria-label; the bubble is decorative.
 */
export function Tooltip({ label, side = 'left', children, className }) {
  const s = SIDES[side] || SIDES.left;
  return (
    <span className={cn('group/tip relative inline-flex', className)}>
      {children}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute z-10 whitespace-nowrap rounded-xl bg-neutral px-3 py-1.5 text-xs font-medium text-neutral-content shadow-[var(--shadow-lift)]',
          // Hide fast (100ms, no delay); show after a short delay with a softer 250ms entrance,
          // so moving between buttons never leaves two bubbles on screen.
          'scale-90 opacity-0 transition-[opacity,translate,scale] duration-100 ease-out',
          'group-hover/tip:scale-100 group-hover/tip:opacity-100 group-hover/tip:delay-100 group-hover/tip:duration-250 group-hover/tip:ease-out-soft',
          // Keyboard focus only: a clicked (mouse-focused) button must not keep its tooltip open.
          'group-has-[:focus-visible]/tip:scale-100 group-has-[:focus-visible]/tip:opacity-100',
          s.box,
          s.show,
        )}
      >
        {label}
        <span className={cn('absolute size-2 rotate-45 rounded-[1px] bg-neutral', s.arrow)} />
      </span>
    </span>
  );
}
