import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Check, Clock3, Loader2, Lock, MessageSquarePlus, Phone, SendHorizontal, UserRound, X } from 'lucide-react';
import { useLocation } from 'react-router';
import { Presence } from '../../motion';
import { useAuth } from '../../providers/AuthProvider';
import { cn } from '../../utils/cn';
import { CONTACT, contactLinks } from '../../utils/contact';
import { LogoMark } from '../ui/misc';
import { Button, Input, Textarea, confirmAction, notify } from '../ui';

const time = (d) => new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const day = (d) => new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

function StartForm({ chat }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ defaultValues: { name: user?.displayName || '', phone: user?.phone || '', message: '' } });

  const onSubmit = (values) =>
    chat.start.mutate(
      { ...values, message: values.message.trim() || undefined, page: pathname },
      {
        onError: (err) => {
          const fields = err.fieldErrors || {};
          if (Object.keys(fields).length) Object.entries(fields).forEach(([f, m]) => setError(f, { message: m }));
          else notify.error(err);
        },
      },
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4 overflow-y-auto p-5" noValidate data-lenis-prevent>
      <div className="rounded-2xl bg-soft p-4 text-sm leading-relaxed text-muted">
        👋 Hi! Tell us who you are and we’ll reply right here, usually within a few minutes during office hours.
      </div>
      <Input label="Your name" icon={UserRound} autoComplete="name" error={errors.name?.message} {...register('name', { required: 'Please enter your name', minLength: { value: 2, message: 'Too short' } })} />
      <Input
        label="Phone number"
        icon={Phone}
        type="tel"
        autoComplete="tel"
        placeholder="01XXXXXXXXX"
        hint="So we can call you back if needed."
        error={errors.phone?.message}
        {...register('phone', { required: 'Please enter your phone number', pattern: { value: /^\+?[\d\s-]{7,20}$/, message: 'Enter a valid phone number' } })}
      />
      <Textarea label="How can we help?" rows={3} placeholder="Optional: ask anything" {...register('message', { maxLength: { value: 2000, message: 'Too long' } })} />
      <Button type="submit" size="lg" loading={chat.start.isPending} rightIcon={SendHorizontal} className="mt-auto">
        Start chat
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-subtle">
        <Lock className="size-3" /> Your details are only visible to the Edurock team.
      </p>
    </form>
  );
}

function Conversation({ chat }) {
  const [draft, setDraft] = useState('');
  const list = useRef(null);
  const input = useRef(null);
  const { messages, session } = chat;

  // Stick to the newest message.
  useLayoutEffect(() => {
    const el = list.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  useEffect(() => input.current?.focus(), []);

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    setDraft('');
    chat.send.mutate(body, { onError: (err) => notify.error(err) });
  };

  return (
    <>
      <div ref={list} className="flex-1 space-y-2 overflow-y-auto px-4 py-4" data-lenis-prevent aria-live="polite">
        {chat.isLoading && (
          <div className="flex justify-center py-10 text-subtle">
            <Loader2 className="size-5 animate-spin" aria-label="Loading conversation" />
          </div>
        )}
        {messages.map((m, i) => {
          const d = day(m.createdAt);
          const showDay = i === 0 || day(messages[i - 1].createdAt) !== d;
          const mine = m.sender === 'visitor';
          return (
            <div key={m.id}>
              {showDay && <p className="my-3 text-center text-[11px] font-medium uppercase tracking-wider text-subtle">{d}</p>}
              <div className={cn('flex animate-[dial-in_0.3s_var(--ease-out-soft)_both]', mine ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[82%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
                    mine ? 'rounded-br-md bg-primary text-primary-content' : 'rounded-bl-md bg-soft text-base-content',
                  )}
                >
                  {!mine && m.senderName && <p className="mb-0.5 text-[11px] font-semibold text-primary">{m.senderName}</p>}
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={cn('mt-1 flex items-center justify-end gap-1 text-[10px]', mine ? 'text-primary-content/70' : 'text-subtle')}>
                    {time(m.createdAt)}
                    {mine && (m.pending ? <Clock3 className="size-3" aria-label="Sending" /> : <Check className="size-3" aria-label="Sent" />)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {session?.status === 'closed' && (
        <p className="border-t border-soft bg-soft px-4 py-2 text-center text-xs text-muted">This chat was marked resolved. Send a message to reopen it.</p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-end gap-2 border-t border-soft p-3"
      >
        <label className="sr-only" htmlFor="chat-input">
          Message
        </label>
        <textarea
          id="chat-input"
          ref={input}
          rows={1}
          value={draft}
          maxLength={2000}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Write a message…"
          className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-soft bg-base-100 px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/12"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          aria-label="Send message"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-content transition-transform active:scale-95 disabled:opacity-40"
        >
          <SendHorizontal className="size-[18px]" />
        </button>
      </form>
    </>
  );
}

/** Website live chat window (bottom-right card on desktop, full-screen sheet on phones). */
export function ChatPanel({ open, onClose, chat }) {
  const newChat = async () => {
    const ok = await confirmAction({ title: 'Start a new chat?', text: 'Your current conversation will be closed on this device.', confirmText: 'Start new' });
    if (ok) chat.reset();
  };

  return (
    <Presence
      show={open}
      role="dialog"
      aria-label="Live chat with Edurock"
      className="fixed inset-0 z-[70] flex flex-col overflow-hidden bg-base-100 sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[min(620px,calc(100dvh-8rem))] sm:w-[380px] sm:rounded-[1.5rem] sm:border sm:border-soft sm:shadow-[var(--shadow-lift)]"
      enter={{ opacity: [0, 1], y: [24, 0], scale: [0.96, 1] }}
      exit={{ opacity: 0, y: 16, scale: 0.97 }}
      duration={0.3}
    >
      {/* Header */}
      <div className="flex items-center gap-3 bg-neutral px-4 py-3.5 text-neutral-content">
        <div className="relative">
          <LogoMark className="size-10" />
          <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-success ring-2 ring-neutral" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Edurock support</p>
          <p className="text-xs opacity-70">Typically replies in a few minutes</p>
        </div>
        {chat.token && (
          <button onClick={newChat} className="rounded-lg p-2 opacity-80 transition hover:bg-neutral-content/10 hover:opacity-100" aria-label="Start a new chat" title="New chat">
            <MessageSquarePlus className="size-[18px]" />
          </button>
        )}
        <button onClick={onClose} className="rounded-lg p-2 opacity-80 transition hover:bg-neutral-content/10 hover:opacity-100" aria-label="Close chat">
          <X className="size-5" />
        </button>
      </div>

      {chat.token ? <Conversation chat={chat} /> : <StartForm chat={chat} />}

      <div className="flex items-center justify-center gap-3 border-t border-soft py-2 text-[11px] text-subtle">
        Prefer another way?
        <a href={contactLinks.whatsapp()} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
          WhatsApp
        </a>
        <a href={contactLinks.call()} className="font-medium text-primary hover:underline">
          Call {CONTACT.phoneLabel}
        </a>
      </div>
    </Presence>
  );
}
