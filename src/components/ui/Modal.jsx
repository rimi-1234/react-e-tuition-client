import { useEffect } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { X } from 'lucide-react';
import { useMotion } from '../../motion';
import { cn } from '../../utils/cn';

const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

/**
 * Accessible modal (Headless UI handles focus trap, Esc and aria).
 * Enter/exit use CSS transitions on data-closed; the smooth scroller is
 * paused while open so the page underneath stays put.
 * On phones it docks to the bottom like a sheet.
 */
export function Modal({ open, onClose, title, description, size = 'md', children, footer, className }) {
  const { lockScroll, unlockScroll } = useMotion();

  useEffect(() => {
    if (!open) return undefined;
    lockScroll?.();
    return () => unlockScroll?.();
  }, [open, lockScroll, unlockScroll]);

  return (
    <Dialog open={open} onClose={onClose} className="relative z-[80]">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-[#0b1020]/55 transition-opacity duration-300 ease-out data-closed:opacity-0"
      />
      <div className="fixed inset-0 overflow-y-auto" data-lenis-prevent>
        <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-6">
          <DialogPanel
            transition
            className={cn(
              'w-full rounded-t-[1.75rem] border border-soft bg-base-100 shadow-[var(--shadow-lift)] sm:rounded-[1.5rem]',
              'transition duration-300 ease-out-soft data-closed:translate-y-6 data-closed:opacity-0 sm:data-closed:translate-y-2 sm:data-closed:scale-[0.97]',
              widths[size],
              className,
            )}
          >
            <div className="flex items-start justify-between gap-4 px-6 pt-6">
              <div>
                {title && <DialogTitle className="font-display text-xl font-semibold">{title}</DialogTitle>}
                {description && <p className="mt-1 text-sm text-muted">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="-mr-2 -mt-1 rounded-lg p-2 text-subtle transition-colors hover:bg-soft hover:text-base-content"
                aria-label="Close dialog"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="px-6 pb-6 pt-5">{children}</div>
            {footer && <div className="flex flex-col-reverse gap-2 border-t border-soft px-6 py-4 sm:flex-row sm:justify-end">{footer}</div>}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
