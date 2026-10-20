import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Mail, MessageCircle, MessagesSquare, Phone, X } from 'lucide-react';
import { FaFacebookMessenger, FaWhatsapp } from 'react-icons/fa6';
import { useChat } from '../../hooks/useChat';
import { Presence, useMotion } from '../../motion';
import { cn } from '../../utils/cn';
import { CONTACT, contactLinks } from '../../utils/contact';
import { ChatPanel } from '../chat/ChatPanel';
import { Tooltip } from '../ui/Tooltip';

const RING = 2 * Math.PI * 22; // circumference for r = 22

/**
 * Back-to-top button wrapped in a ring that fills with page scroll progress.
 * The ring is written straight to the DOM on scroll (no React re-renders);
 * React state only flips when the button should appear or hide.
 */
function BackToTop() {
  const ring = useRef(null);
  const [visible, setVisible] = useState(false);
  const { scrollTo } = useMotion();

  useEffect(() => {
    let queued = false;
    const update = () => {
      queued = false;
      const limit = document.documentElement.scrollHeight - window.innerHeight;
      const progress = limit > 0 ? Math.min(1, window.scrollY / limit) : 0;
      if (ring.current) ring.current.style.strokeDashoffset = String(RING * (1 - progress));
      const show = window.scrollY > 480;
      setVisible((v) => (v === show ? v : show));
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    // Collapsing wrapper: when hidden it takes no space, so the contact button slides into this spot.
    <div
      className={cn(
        'flex justify-end transition-[height,margin-top] duration-500 ease-out-soft',
        visible ? 'mt-3 h-12' : 'mt-0 h-0',
      )}
    >
    <Tooltip label="Back to top">
      <button
        onClick={() => scrollTo(0, { duration: 1.2 })}
        aria-label="Back to top"
        tabIndex={visible ? 0 : -1}
        className={cn(
          'group relative flex size-12 items-center justify-center rounded-full bg-base-100 text-base-content shadow-[var(--shadow-lift)] transition-[opacity,translate,scale] duration-500 ease-out-soft',
          visible ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-3 scale-75 opacity-0',
        )}
      >
        <svg viewBox="0 0 48 48" className="absolute inset-0 size-full -rotate-90" aria-hidden>
          <circle cx="24" cy="24" r="22" fill="none" strokeWidth="2.5" className="stroke-base-content/10" />
          <circle
            ref={ring}
            cx="24"
            cy="24"
            r="22"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={RING}
            strokeDashoffset={RING}
            className="stroke-primary"
          />
        </svg>
        <ArrowUp className="size-[18px] transition-transform duration-300 group-hover:-translate-y-0.5" />
      </button>
    </Tooltip>
    </div>
  );
}

const CHANNELS = [
  { key: 'chat', label: 'Live chat', icon: MessagesSquare, tone: 'bg-primary text-primary-content' },
  { key: 'whatsapp', label: 'WhatsApp', icon: FaWhatsapp, tone: 'bg-[#25D366] text-white', href: contactLinks.whatsapp() },
  { key: 'messenger', label: 'Messenger', icon: FaFacebookMessenger, tone: 'bg-[#0084FF] text-white', href: contactLinks.messenger() },
  { key: 'call', label: `Call ${CONTACT.phoneLabel}`, icon: Phone, tone: 'bg-success text-success-content', href: contactLinks.call() },
  { key: 'email', label: 'Email us', icon: Mail, tone: 'bg-neutral text-neutral-content', href: contactLinks.email() },
];

/** Floating contact hub (speed dial) + back-to-top, bottom-right on every public page. */
export function FloatingActions() {
  const [dialOpen, setDialOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const chat = useChat({ open: chatOpen });
  const root = useRef(null);

  // Close the dial on outside click / Escape.
  useEffect(() => {
    if (!dialOpen) return undefined;
    const onDown = (e) => !root.current?.contains(e.target) && setDialOpen(false);
    const onKey = (e) => e.key === 'Escape' && setDialOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [dialOpen]);

  const openChat = () => {
    setDialOpen(false);
    setChatOpen(true);
  };

  return (
    <>
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} chat={chat} />

      <div ref={root} className={cn('fixed bottom-5 right-4 z-[60] flex flex-col items-end sm:right-6', chatOpen && 'max-sm:hidden')}>
        <Presence
          show={dialOpen}
          as="ul"
          className="mb-3 flex flex-col items-end gap-2.5"
          enter={{ opacity: [0, 1], y: [12, 0] }}
          exit={{ opacity: 0, y: 8 }}
          duration={0.25}
        >
          {CHANNELS.map(({ key, label, icon: Icon, tone, href }, i) => {
            const iconClass = cn(
              'flex size-11 items-center justify-center rounded-full shadow-[var(--shadow-lift)] transition-transform duration-300 ease-out-soft hover:scale-110 focus-visible:scale-110 active:scale-95',
              tone,
            );
            return (
              <li key={key} style={{ animationDelay: `${(CHANNELS.length - i) * 40}ms` }} className="animate-[dial-in_0.35s_var(--ease-out-soft)_both]">
                <Tooltip label={label}>
                  {href ? (
                    <a
                      href={href}
                      target={key === 'call' || key === 'email' ? undefined : '_blank'}
                      rel="noreferrer noopener"
                      aria-label={label}
                      className={iconClass}
                      onClick={() => setDialOpen(false)}
                    >
                      <Icon className="size-5" aria-hidden />
                    </a>
                  ) : (
                    <button type="button" onClick={openChat} aria-label={label} className={iconClass}>
                      <Icon className="size-5" aria-hidden />
                    </button>
                  )}
                </Tooltip>
              </li>
            );
          })}
        </Presence>

        <Tooltip label={dialOpen || chatOpen ? 'Close' : 'Contact us'}>
          <button
            onClick={() => (chatOpen ? setChatOpen(false) : setDialOpen((v) => !v))}
            aria-label={dialOpen || chatOpen ? 'Close contact options' : 'Contact us'}
            aria-expanded={dialOpen}
            className="relative flex size-14 items-center justify-center rounded-full bg-primary text-primary-content shadow-[var(--shadow-glow)] transition-transform duration-300 hover:scale-105 active:scale-95"
          >
            <MessageCircle
              className={cn('absolute size-6 transition-all duration-300', dialOpen || chatOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100')}
            />
            <X className={cn('absolute size-6 transition-all duration-300', dialOpen || chatOpen ? 'rotate-0 scale-100' : '-rotate-90 scale-0 opacity-0')} />
            {chat.unread > 0 && !chatOpen && (
              <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-error px-1 text-[11px] font-semibold leading-5 text-error-content ring-2 ring-base-200">
                {chat.unread}
              </span>
            )}
          </button>
        </Tooltip>

        <BackToTop />
      </div>
    </>
  );
}
