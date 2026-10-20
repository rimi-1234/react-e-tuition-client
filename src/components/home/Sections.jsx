import { useRef, useState } from 'react';
import { Link } from 'react-router';
import {
  ArrowRight,
  Atom,
  BadgeCheck,
  Beaker,
  BookOpen,
  Calculator,
  ClipboardPen,
  Code2,
  CreditCard,
  Globe2,
  HandCoins,
  Languages,
  Leaf,
  MessageSquareQuote,
  PenLine,
  Search,
  ShieldCheck,
  Sigma,
  Sparkles,

  Timer,
  UserCheck,
} from 'lucide-react';
import { useFeaturedTutors, useLatestTuitions, usePublicStats, useReviews, useSubjects } from '../../hooks/useApi';
import { CountUp, Marquee, Reveal, Stagger, useScrollProgress } from '../../motion';
import { cn } from '../../utils/cn';
import { money } from '../../utils/format';
import { TuitionCard } from '../tuition/TuitionCard';
import { TutorCard } from '../tutor/TutorCard';
import { Avatar, Button, Card, EmptyState, ErrorState, SectionHeading, Stars, Tabs, TuitionCardSkeleton, TutorCardSkeleton } from '../ui';

/* ── Subjects marquee ──────────────────────────────────────────────── */
const MARQUEE = [
  ['Mathematics', Sigma],
  ['Physics', Atom],
  ['Chemistry', Beaker],
  ['Biology', Leaf],
  ['English', Languages],
  ['ICT', Code2],
  ['Accounting', Calculator],
  ['Bangla', PenLine],
  ['IELTS', Globe2],
  ['Higher Math', Sigma],
];

export function SubjectMarquee() {
  return (
    <section id="explore" aria-label="Subjects we cover" className="border-y border-soft bg-base-100/60 py-6">
      <Marquee speed={45}>
        {MARQUEE.map(([label, Icon]) => (
          <Link
            key={label}
            to={`/tuitions?subject=${encodeURIComponent(label)}`}
            className="inline-flex items-center gap-3 whitespace-nowrap font-display text-2xl text-base-content/45 transition-colors hover:text-primary"
          >
            <Icon className="size-5" aria-hidden /> {label}
          </Link>
        ))}
      </Marquee>
    </section>
  );
}

/* ── Live numbers ──────────────────────────────────────────────────── */
export function StatsBand() {
  const { data } = usePublicStats();
  const items = [
    { label: 'Verified tutors', value: data?.tutors, suffix: '+' },
    { label: 'Open tuitions', value: data?.openTuitions },
    { label: 'Successful matches', value: data?.successfulMatches, suffix: '+' },
    { label: 'Average rating', value: data?.averageRating, format: (n) => n.toFixed(1), suffix: '/5' },
  ];
  return (
    <section className="cv-auto container-page py-20">
      <Stagger className="grid grid-cols-2 gap-y-10 lg:grid-cols-4" stagger={0.1}>
        {items.map((s) => (
          <div key={s.label} className="border-l border-soft pl-5 sm:pl-8">
            <p className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {s.value === undefined ? <span className="text-subtle">—</span> : <CountUp to={s.value} format={s.format} suffix={s.suffix} />}
            </p>
            <p className="mt-2 text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </Stagger>
    </section>
  );
}

/* ── How it works ──────────────────────────────────────────────────── */
const STEPS = {
  students: [
    { icon: ClipboardPen, title: 'Post your tuition', text: 'Describe the subject, class, schedule and budget. It’s free and takes about two minutes.' },
    { icon: UserCheck, title: 'Compare applicants', text: 'Verified tutors apply with their qualifications, experience, ratings and expected salary.' },
    { icon: CreditCard, title: 'Hire with confidence', text: 'Pay securely through Stripe to confirm. The tutor gets your contact details and starts.' },
  ],
  tutors: [
    { icon: Search, title: 'Browse real requests', text: 'Filter tuitions by subject, class, area and budget. Save the ones you like.' },
    { icon: PenLine, title: 'Apply in one minute', text: 'Send your qualifications and expected salary. Students are notified instantly.' },
    { icon: HandCoins, title: 'Get hired, get paid', text: 'When a student hires you, the payment is confirmed and your earnings are tracked.' },
  ],
};

export function HowItWorks() {
  const [tab, setTab] = useState('students');
  const lineRef = useRef(null);
  const sectionRef = useRef(null);
  useScrollProgress(
    sectionRef,
    (p) => {
      if (lineRef.current) lineRef.current.style.transform = `scaleX(${Math.min(1, p * 1.6)})`;
    },
    { start: 'top 80%', end: 'bottom center' },
  );

  return (
    <section id="how-it-works" ref={sectionRef} className="cv-auto container-page py-24">
      <Reveal>
        <SectionHeading eyebrow="How it works" title="Three steps from search to first class" description="Simple for families, fair for tutors.">
          <div className="mt-8 flex justify-center">
            <Tabs
              value={tab}
              onChange={setTab}
              tabs={[
                { value: 'students', label: 'For students & parents' },
                { value: 'tutors', label: 'For tutors' },
              ]}
            />
          </div>
        </SectionHeading>
      </Reveal>

      <div className="relative mt-16">
        <div className="absolute left-[16.6%] right-[16.6%] top-8 hidden h-px bg-base-content/10 md:block" aria-hidden>
          <div ref={lineRef} className="h-full origin-left scale-x-0 bg-linear-to-r from-primary to-accent" />
        </div>
        <Stagger key={tab} className="grid gap-10 md:grid-cols-3" stagger={0.12}>
          {STEPS[tab].map((step, i) => (
            <div key={step.title} className="relative text-center">
              <div className="relative mx-auto flex size-16 items-center justify-center rounded-2xl border border-soft bg-base-100 shadow-[var(--shadow-soft)]">
                <step.icon className="size-7 text-primary" aria-hidden />
                <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-neutral text-xs font-semibold text-neutral-content">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-6 font-sans text-lg font-semibold">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">{step.text}</p>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ── Latest tuitions ───────────────────────────────────────────────── */
export function LatestTuitions() {
  const { data, isPending, error, refetch } = useLatestTuitions(6);
  return (
    <section className="cv-auto relative py-24">
      <div className="absolute inset-0 -z-10 bg-base-100/50" aria-hidden />
      <div className="container-page">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <SectionHeading align="left" eyebrow="Fresh requests" title="Latest tuitions near you" description="New requests from students and parents, reviewed by our team before going live." />
          </Reveal>
          <Button to="/tuitions" variant="outline" rightIcon={ArrowRight}>
            View all tuitions
          </Button>
        </div>

        {error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : isPending ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <TuitionCardSkeleton key={i} />
            ))}
          </div>
        ) : data.length === 0 ? (
          <EmptyState title="No open tuitions yet" description="Be the first to post one. It’s free." action={<Button to="/dashboard/post-tuition">Post a tuition</Button>} />
        ) : (
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
            {data.map((t) => (
              <TuitionCard key={t.id} tuition={t} />
            ))}
          </Stagger>
        )}
      </div>
    </section>
  );
}

/* ── Subject explorer ──────────────────────────────────────────────── */
const SUBJECT_ICONS = { Mathematics: Sigma, Physics: Atom, Chemistry: Beaker, Biology: Leaf, English: Languages, ICT: Code2, Programming: Code2, Accounting: Calculator, Bangla: PenLine, IELTS: Globe2 };

export function SubjectExplorer() {
  const { data, isPending } = useSubjects();
  const subjects = (data || []).slice(0, 8);
  if (!isPending && subjects.length === 0) return null;

  return (
    <section className="cv-auto container-page py-24">
      <Reveal>
        <SectionHeading eyebrow="Explore" title="Popular subjects" description="Jump straight to the subjects families are asking for most." />
      </Reveal>
      <Stagger className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4" stagger={0.05} variant="scale">
        {isPending
          ? Array.from({ length: 8 }, (_, i) => <div key={i} className="skeleton-shimmer h-32 rounded-[var(--radius-box)]" />)
          : subjects.map((s, i) => {
              const Icon = SUBJECT_ICONS[s.subject] || BookOpen;
              return (
                <Link
                  key={s.subject}
                  to={`/tuitions?subject=${encodeURIComponent(s.subject)}`}
                  className={cn(
                    'group relative overflow-hidden rounded-[var(--radius-box)] border border-soft bg-base-100 p-5 transition-all duration-500 ease-out-soft hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]',
                    i === 0 && 'md:col-span-2 md:row-span-2 md:p-8',
                  )}
                >
                  <span className="absolute -right-6 -top-6 size-24 rounded-full bg-primary/5 transition-transform duration-700 ease-out-soft group-hover:scale-[2.5]" aria-hidden />
                  <span className="relative flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-500 group-hover:bg-primary group-hover:text-primary-content">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <p className={cn('relative mt-4 font-semibold', i === 0 && 'font-display text-3xl')}>{s.subject}</p>
                  <p className="relative mt-1 text-xs text-subtle">
                    {s.tuitions} tuitions · {s.tutors} tutors
                  </p>
                  {i === 0 && s.avgBudget > 0 && <p className="relative mt-6 text-sm text-muted">Average budget {money(s.avgBudget)} / month</p>}
                  <ArrowRight className="absolute bottom-5 right-5 size-4 -translate-x-2 text-primary opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
              );
            })}
      </Stagger>
    </section>
  );
}

/* ── Featured tutors ───────────────────────────────────────────────── */
export function FeaturedTutors() {
  const { data, isPending, error, refetch } = useFeaturedTutors(4);
  return (
    <section className="cv-auto container-page py-24">
      <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <Reveal>
          <SectionHeading align="left" eyebrow="Top rated" title="Meet some of our tutors" description="Hand-picked from verified profiles with the best reviews from families." />
        </Reveal>
        <Button to="/tutors" variant="outline" rightIcon={ArrowRight}>
          All tutors
        </Button>
      </div>
      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
          {isPending ? Array.from({ length: 4 }, (_, i) => <TutorCardSkeleton key={i} />) : data.map((t) => <TutorCard key={t.id} tutor={t} />)}
        </Stagger>
      )}
    </section>
  );
}

/* ── Why Edurock (bento) ───────────────────────────────────────────── */
export function WhyEdurock() {
  return (
    <section className="cv-auto container-page py-24">
      <Reveal>
        <SectionHeading eyebrow="Why Edurock" title="Built on trust, designed for families" />
      </Reveal>
      <Stagger className="mt-14 grid gap-4 md:grid-cols-6" stagger={0.08}>
        <Card className="relative overflow-hidden md:col-span-4 md:row-span-2 md:p-10">
          <div className="relative z-10 max-w-sm">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="size-6" />
            </span>
            <h3 className="mt-6 text-3xl font-semibold">Every tutor is reviewed</h3>
            <p className="mt-3 leading-relaxed text-muted">
              Our team checks qualifications before a tutor earns the verified badge, and every tuition is moderated before it goes live. Ratings come only from families who actually hired.
            </p>
          </div>
          <img
            src="/images/students-collab.jpg"
            alt=""
            loading="lazy"
            decoding="async"
            className="mt-8 h-56 w-full rounded-2xl object-cover md:absolute md:bottom-0 md:right-0 md:mt-0 md:h-[78%] md:w-[46%] md:rounded-none md:rounded-tl-3xl"
          />
        </Card>
        <Card className="md:col-span-2">
          <Timer className="size-6 text-accent" />
          <h3 className="mt-4 font-sans text-lg font-semibold">Applicants within a day</h3>
          <p className="mt-2 text-sm text-muted">Most tuitions receive their first application in under 24 hours.</p>
        </Card>
        <Card className="md:col-span-2">
          <CreditCard className="size-6 text-secondary" />
          <h3 className="mt-4 font-sans text-lg font-semibold">Secure Stripe payments</h3>
          <p className="mt-2 text-sm text-muted">Card payments are processed by Stripe. We never see your card details.</p>
        </Card>
        <Card className="md:col-span-3">
          <BadgeCheck className="size-6 text-primary" />
          <h3 className="mt-4 font-sans text-lg font-semibold">Free for families</h3>
          <p className="mt-2 text-sm text-muted">Posting and comparing tutors costs nothing. You only pay when you hire.</p>
        </Card>
        <Card className="bg-neutral! text-neutral-content md:col-span-3">
          <Sparkles className="size-6 text-accent" />
          <h3 className="mt-4 font-sans text-lg font-semibold">Fair for tutors</h3>
          <p className="mt-2 text-sm opacity-75">A transparent 10% platform fee and a dashboard that tracks every application and payout.</p>
        </Card>
      </Stagger>
    </section>
  );
}

/* ── Testimonials ──────────────────────────────────────────────────── */
export function Testimonials() {
  const { data } = useReviews({ limit: 8 });
  const reviews = data?.items || [];
  if (reviews.length < 2) return null;

  return (
    <section className="cv-auto overflow-hidden py-24">
      <div className="container-page">
        <Reveal>
          <SectionHeading eyebrow="Families say" title="Words from people who hired" />
        </Reveal>
      </div>
      <div className="mt-14 space-y-4">
        {[reviews, [...reviews].reverse()].map((row, r) => (
          <Marquee key={r} speed={60} reverse={r === 1}>
            {row.map((rv) => (
              <figure key={`${r}-${rv.id}`} className="w-[340px] shrink-0 rounded-[var(--radius-box)] border border-soft bg-base-100 p-6 sm:w-[400px]">
                <MessageSquareQuote className="size-6 text-primary/40" aria-hidden />
                <blockquote className="mt-3 line-clamp-4 whitespace-normal text-[15px] leading-relaxed">“{rv.comment}”</blockquote>
                <figcaption className="mt-5 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-3">
                    <Avatar src={rv.studentPhoto} name={rv.studentName} size="sm" />
                    <span>
                      <span className="block text-sm font-semibold">{rv.studentName}</span>
                      <span className="block text-xs text-subtle">
                        hired {rv.tutor?.displayName || 'a tutor'} · {rv.tuitionSubject}
                      </span>
                    </span>
                  </span>
                  <Stars value={rv.rating} />
                </figcaption>
              </figure>
            ))}
          </Marquee>
        ))}
      </div>
    </section>
  );
}

