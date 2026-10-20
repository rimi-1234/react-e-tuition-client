import { Link } from 'react-router';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpenCheck,
  Briefcase,
  CalendarClock,
  Check,
  GraduationCap,
  Landmark,
  Laptop,
  MapPin,
  Microscope,
  Quote,
  School,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useLocations, usePublicStats } from '../../hooks/useApi';
import { CountUp, Magnetic, Parallax, ParallaxImage, Reveal, Stagger } from '../../motion';
import { cn } from '../../utils/cn';
import { compact } from '../../utils/format';
import { PHOTOS } from '../../utils/images';
import { Badge, Button, Card, SectionHeading } from '../ui';
import { Faq } from '../ui/Faq';

/* ── Curriculum we cover ───────────────────────────────────────────── */
const LEVELS = [
  { icon: School, title: 'Primary', range: 'Class 1–5', level: 'Class 1-5', subjects: ['Bangla', 'English', 'Maths', 'Science'], tone: 'bg-accent/15 text-accent' },
  { icon: BookOpenCheck, title: 'Secondary', range: 'Class 6–10 · SSC', level: 'SSC', subjects: ['Maths', 'Higher Math', 'Physics', 'Chemistry'], tone: 'bg-primary/10 text-primary' },
  { icon: GraduationCap, title: 'Higher Secondary', range: 'HSC · Class 11–12', level: 'HSC', subjects: ['Physics', 'Chemistry', 'Biology', 'Accounting'], tone: 'bg-secondary/12 text-secondary' },
  { icon: Landmark, title: 'English Medium', range: 'O Level · A Level', level: 'O Level', subjects: ['Maths', 'Physics', 'Chemistry', 'English'], tone: 'bg-info/10 text-info' },
  { icon: Microscope, title: 'Admission Prep', range: 'Medical · Engineering · Varsity', level: 'Admission', subjects: ['Biology', 'Physics', 'Math', 'GK'], tone: 'bg-error/10 text-error' },
  { icon: Laptop, title: 'University & Skills', range: 'IELTS · Programming · Stats', level: 'University', subjects: ['IELTS', 'Python', 'Statistics', 'Economics'], tone: 'bg-success/12 text-success' },
];

export function CurriculumLevels() {
  return (
    <section className="cv-auto container-page py-24">
      <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="Every stage of learning"
            title="From the first alphabet to the admission hall"
            description="Bangla and English medium, national curriculum and Cambridge/Edexcel. Pick a stage to see open tuitions."
          />
        </Reveal>
        <Reveal variant="fade" className="hidden lg:block">
          <img src={PHOTOS.desk.src} srcSet={PHOTOS.desk.srcSet} sizes="320px" alt={PHOTOS.desk.alt} loading="lazy" className="h-40 w-80 rounded-3xl object-cover" />
        </Reveal>
      </div>

      <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
        {LEVELS.map((l) => (
          <Link
            key={l.title}
            to={`/tuitions?classLevel=${encodeURIComponent(l.level)}`}
            className="group relative overflow-hidden rounded-[var(--radius-box)] border border-soft bg-base-100 p-6 transition-[transform,box-shadow,border-color] duration-500 ease-out-soft hover:-translate-y-1 hover:border-primary/25 hover:shadow-[var(--shadow-lift)]"
          >
            <div className="flex items-start justify-between">
              <span className={cn('flex size-12 items-center justify-center rounded-2xl', l.tone)}>
                <l.icon className="size-6" aria-hidden />
              </span>
              <ArrowUpRight className="size-5 text-subtle transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
            <h3 className="mt-6 font-sans text-xl font-semibold">{l.title}</h3>
            <p className="mt-1 text-sm text-subtle">{l.range}</p>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {l.subjects.map((s) => (
                <Badge key={s} tone="neutral">
                  {s}
                </Badge>
              ))}
            </div>
          </Link>
        ))}
      </Stagger>
    </section>
  );
}

/* ── Parallax quote band ───────────────────────────────────────────── */
export function ParallaxQuote() {
  const { data: stats } = usePublicStats();
  return (
    <section className="relative isolate overflow-hidden py-32 text-white sm:py-44" aria-label="Our mission">
      <ParallaxImage photo={PHOTOS.classroom} speed={0.3} className="absolute inset-0 -z-20" />
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-[#0b1020]/90 via-[#0b1020]/70 to-[#0b1020]/40" aria-hidden />

      <div className="container-page grid items-end gap-12 lg:grid-cols-[1.4fr_1fr]">
        <Reveal>
          <Quote className="size-10 text-accent" aria-hidden />
          <blockquote className="mt-6 font-display text-3xl leading-[1.15] sm:text-5xl">
            A good tutor doesn’t just teach a subject. They teach a child <span className="italic text-accent">to believe they can learn it.</span>
          </blockquote>
          <p className="mt-6 text-sm uppercase tracking-[0.2em] text-white/60">The idea Edurock is built on</p>
        </Reveal>

        <Stagger className="grid grid-cols-2 gap-6" stagger={0.1}>
          {[
            [stats?.tutors, 'tutors ready to teach'],
            [stats?.successfulMatches, 'families matched'],
            [stats?.subjects, 'subjects covered'],
            [stats?.averageRating, 'average rating', (n) => n.toFixed(1)],
          ].map(([value, label, format]) => (
            <div key={label} className="border-l border-white/20 pl-5">
              <p className="font-display text-4xl font-semibold">{value === undefined ? '—' : <CountUp to={value} format={format} />}</p>
              <p className="mt-1 text-sm text-white/65">{label}</p>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ── Become a tutor (layered depth parallax) ───────────────────────── */
const TUTOR_PERKS = [
  { icon: Wallet, title: 'Earn on your terms', text: 'Set your own monthly rate. You keep 90% of every booking.' },
  { icon: CalendarClock, title: 'Teach when it suits you', text: 'Home visits or online, weekday evenings or weekends.' },
  { icon: TrendingUp, title: 'Grow your reputation', text: 'Reviews from real families push you up the directory.' },
];

export function BecomeTutor() {
  return (
    <section className="cv-auto container-page py-24">
      <div className="grid items-center gap-16 lg:grid-cols-2">
        {/* Three layers moving at different speeds create depth */}
        <div className="relative mx-auto aspect-[4/5] w-full max-w-md lg:max-w-none">
          <Parallax speed={0.08} className="absolute inset-0">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
              <ParallaxImage photo={PHOTOS.library} speed={0.2} sizes="(min-width:1024px) 40vw, 90vw" className="absolute inset-0" />
            </div>
          </Parallax>
          <Parallax speed={0.28} className="absolute -left-4 bottom-10 w-48 sm:-left-10 sm:w-56">
            <Card className="p-4!">
              <p className="text-xs text-subtle">This month</p>
              <p className="mt-1 font-display text-3xl font-semibold">৳42,500</p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-success">
                <TrendingUp className="size-3.5" /> +18% vs last month
              </p>
            </Card>
          </Parallax>
          <Parallax speed={0.45} className="absolute -right-3 top-10 sm:-right-8">
            <div className="flex items-center gap-2 rounded-2xl bg-neutral px-4 py-3 text-neutral-content shadow-[var(--shadow-lift)]">
              <BadgeCheck className="size-5 text-accent" />
              <span className="text-sm font-semibold">Verified tutor</span>
            </div>
          </Parallax>
        </div>

        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="For tutors"
            title="Turn what you know into steady income"
            description="Thousands of families in Bangladesh are looking for someone exactly like you. Build a profile once and apply to real, moderated tuition requests."
          />
          <Stagger as="ul" className="mt-8 space-y-5" stagger={0.08}>
            {TUTOR_PERKS.map((p) => (
              <li key={p.title} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <p.icon className="size-5" />
                </span>
                <span>
                  <span className="block font-semibold">{p.title}</span>
                  <span className="mt-0.5 block text-sm text-muted">{p.text}</span>
                </span>
              </li>
            ))}
          </Stagger>
          <div className="mt-10 flex flex-wrap gap-3">
            <Magnetic>
              <Button to="/signup" size="lg" leftIcon={Briefcase}>
                Start teaching
              </Button>
            </Magnetic>
            <Button to="/tuitions" size="lg" variant="outline" rightIcon={ArrowRight}>
              See open tuitions
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Transparent pricing ───────────────────────────────────────────── */
const PLANS = [
  {
    name: 'Families & students',
    price: 'Free',
    note: 'You only pay the tutor’s fee when you hire',
    features: ['Post unlimited tuition requests', 'Compare verified applicants and reviews', 'Secure card payment through Stripe', 'Contact details shared only after hiring'],
    cta: ['Post a tuition', '/dashboard/post-tuition'],
  },
  {
    name: 'Tutors',
    price: '10%',
    note: 'Only on bookings: no sign-up or monthly fee',
    features: ['Free profile in the tutor directory', 'Apply to moderated, real requests', 'Earnings dashboard and payment history', 'Verified badge after document review'],
    cta: ['Create tutor profile', '/signup'],
    featured: true,
  },
];

export function Pricing() {
  return (
    <section className="cv-auto container-page py-24">
      <Reveal>
        <SectionHeading eyebrow="Pricing" title="Honest pricing, no surprises" description="Edurock is free for families. Tutors pay a small fee only when they get hired." />
      </Reveal>
      <Stagger className="mx-auto mt-14 grid max-w-4xl gap-5 md:grid-cols-2" stagger={0.1}>
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={cn(
              'relative flex flex-col rounded-[1.75rem] border p-8',
              p.featured ? 'border-transparent bg-neutral text-neutral-content shadow-[var(--shadow-lift)]' : 'border-soft bg-base-100',
            )}
          >
            {p.featured && (
              <span className="absolute right-6 top-6 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-content">
                <Sparkles className="size-3" /> Most flexible
              </span>
            )}
            <p className={cn('text-sm font-medium', p.featured ? 'text-neutral-content/70' : 'text-muted')}>{p.name}</p>
            <p className="mt-3 font-display text-6xl font-semibold tracking-tight">{p.price}</p>
            <p className={cn('mt-2 text-sm', p.featured ? 'text-neutral-content/70' : 'text-subtle')}>{p.note}</p>
            <ul className="mt-8 flex-1 space-y-3">
              {p.features.map((f) => (
                <li key={f} className="flex gap-3 text-sm">
                  <Check className={cn('mt-0.5 size-4 shrink-0', p.featured ? 'text-accent' : 'text-success')} />
                  {f}
                </li>
              ))}
            </ul>
            <Button to={p.cta[1]} size="lg" variant={p.featured ? 'accent' : 'outline'} className="mt-8 w-full">
              {p.cta[0]}
            </Button>
          </div>
        ))}
      </Stagger>
    </section>
  );
}

/* ── Popular areas ─────────────────────────────────────────────────── */
const CITIES = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Gazipur'];

export function PopularAreas() {
  const { data: locations = [] } = useLocations();
  const byCity = CITIES.map((city) => ({
    city,
    count: locations.filter((l) => l.location.toLowerCase().includes(city.toLowerCase())).reduce((s, l) => s + l.count, 0),
    areas: locations.filter((l) => l.location.toLowerCase().includes(city.toLowerCase())).slice(0, 3),
  }));

  return (
    <section className="cv-auto relative py-24">
      <div className="absolute inset-0 -z-10 bg-base-100/60" aria-hidden />
      <div className="container-page">
        <Reveal>
          <SectionHeading eyebrow="Across Bangladesh" title="Tutors near you, wherever you are" description="Home tuition in every major city, and online classes from anywhere." />
        </Reveal>
        <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
          {byCity.map(({ city, count, areas }) => (
            <Link
              key={city}
              to={`/tuitions?location=${encodeURIComponent(city)}`}
              className="group flex items-start gap-4 rounded-[var(--radius-box)] border border-soft bg-base-100 p-5 transition-[transform,border-color] duration-500 ease-out-soft hover:-translate-y-0.5 hover:border-primary/30"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-500 group-hover:bg-primary group-hover:text-primary-content">
                <MapPin className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-display text-xl font-semibold">{city}</span>
                  <span className="text-xs text-subtle">{count ? `${compact(count)} open` : 'Online available'}</span>
                </span>
                <span className="mt-1 block truncate text-sm text-muted">{areas.length ? areas.map((a) => a.location.split(',')[0]).join(' · ') : 'Home & online tuition'}</span>
              </span>
            </Link>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ── FAQ ───────────────────────────────────────────────────────────── */
export function HomeFaq() {
  return (
    <section className="cv-auto container-page grid gap-12 py-24 lg:grid-cols-[0.8fr_1.2fr]">
      <Reveal>
        <SectionHeading align="left" eyebrow="FAQ" title="Good questions, honest answers" description="Everything families and tutors usually ask before getting started.">
          <Button to="/about#faq" variant="outline" className="mt-6" rightIcon={ArrowRight}>
            More about Edurock
          </Button>
        </SectionHeading>
      </Reveal>
      <Reveal>
        <Faq />
      </Reveal>
    </section>
  );
}

/* ── Final full-bleed parallax call to action ──────────────────────── */
export function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden" aria-label="Get started">
      <ParallaxImage photo={PHOTOS.books} speed={0.35} className="absolute inset-0 -z-20" />
      <div className="absolute inset-0 -z-10 bg-linear-to-l from-base-200 from-35% via-base-200/85 to-base-200/10" aria-hidden />
      <div className="container-page flex min-h-[70vh] items-center justify-end py-24">
        <Reveal className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Ready when you are</p>
          <h2 className="mt-4 text-4xl font-semibold leading-[1.05] sm:text-6xl">
            The next chapter starts with <span className="text-gradient">one great teacher.</span>
          </h2>
          <p className="mt-5 text-lg text-muted">Post your tuition in two minutes and meet verified tutors today.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Magnetic>
              <Button to="/dashboard/post-tuition" size="lg" rightIcon={ArrowRight}>
                Post a tuition, free
              </Button>
            </Magnetic>
            <Button to="/tutors" size="lg" variant="outline">
              Browse tutors
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
