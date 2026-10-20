import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

const FAQ_ITEMS = [
  ['Is it free to post a tuition?', 'Yes. Posting, receiving applications and comparing tutors is completely free. You only pay the first month’s fee when you decide to hire.'],
  ['How are tutors verified?', 'Tutors submit their qualifications and institution. Our team reviews them before awarding the verified badge, and reviews can only be left by families who hired that tutor.'],
  ['How does payment work?', 'When you hire, you pay securely by card through Stripe. The payment confirms the booking, the tutor is notified instantly and their contact details are shared with you.'],
  ['Can I edit my tuition after posting?', 'Yes, until it’s booked. Edits to a live post send it back for a quick review so the information tutors see stays accurate.'],
  ['What does the platform fee cover?', 'Tutors pay a 10% fee on bookings. It covers moderation, secure payments, support and keeping Edurock free for families.'],
  ['Is my phone number shared publicly?', 'No. Contact details are only shared between a student and the tutor they hired.'],
];

function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className="border-b border-soft">
      <h3 className="font-sans">
        <button onClick={onToggle} aria-expanded={open} className="flex w-full items-center justify-between gap-6 py-5 text-left text-base font-semibold">
          {q}
          <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full transition-colors', open ? 'bg-primary text-primary-content' : 'bg-soft')}>
            {open ? <Minus className="size-4" /> : <Plus className="size-4" />}
          </span>
        </button>
      </h3>
      {/* grid-rows trick animates height without measuring */}
      <div className={cn('grid transition-[grid-template-rows,opacity] duration-500 ease-out-soft', open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
        <p className="overflow-hidden pr-12 text-muted">
          <span className="block pb-5 leading-relaxed">{a}</span>
        </p>
      </div>
    </div>
  );
}

/** Accessible accordion; one item open at a time. */
export function Faq({ items = FAQ_ITEMS, defaultOpen = 0, className }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={className}>
      {items.map(([q, a], i) => (
        <FaqItem key={q} q={q} a={a} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
      ))}
    </div>
  );
}
