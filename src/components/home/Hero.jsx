import { useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, BadgeCheck, CircleDollarSign, MapPin, Search, Sparkles, Star } from 'lucide-react';
import { usePublicStats } from '../../hooks/useApi';
import { timeline } from '../../lib/motion';
import { Magnetic, ParallaxImage, TextReveal, useReducedMotion } from '../../motion';
import { POPULAR_SUBJECTS } from '../../utils/constants';
import { compact } from '../../utils/format';
import { PHOTOS } from '../../utils/images';
import { Avatar, Button } from '../ui';

const FACES = [
  ['Farhana', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=96&h=96&q=70'],
  ['Tanvir', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=96&h=96&q=70'],
  ['Nusrat', 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=96&h=96&q=70'],
  ['Mahmud', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=96&h=96&q=70'],
];

function HeroSearch() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [location, setLocation] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (subject.trim()) params.set('search', subject.trim());
    if (location.trim()) params.set('location', location.trim());
    navigate(`/tuitions${params.size ? `?${params}` : ''}`);
  };

  return (
    <form
      onSubmit={submit}
      role="search"
      className="flex flex-col gap-2 rounded-[1.4rem] border border-soft bg-base-100 p-2 shadow-[var(--shadow-lift)] sm:flex-row sm:items-center"
    >
      <label className="flex flex-1 items-center gap-3 rounded-2xl px-4 py-3 transition-colors focus-within:bg-soft">
        <Search className="size-5 shrink-0 text-primary" aria-hidden />
        <span className="sr-only">Subject or class</span>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject, class or keyword"
          className="w-full bg-transparent text-[15px] outline-none placeholder:text-subtle"
        />
      </label>
      <span className="hidden h-8 w-px bg-base-content/10 sm:block" aria-hidden />
      <label className="flex flex-1 items-center gap-3 rounded-2xl px-4 py-3 transition-colors focus-within:bg-soft">
        <MapPin className="size-5 shrink-0 text-accent" aria-hidden />
        <span className="sr-only">Location</span>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Area, e.g. Dhanmondi"
          className="w-full bg-transparent text-[15px] outline-none placeholder:text-subtle"
        />
      </label>
      <Button type="submit" size="lg" className="sm:h-12" rightIcon={ArrowRight}>
        Search
      </Button>
    </form>
  );
}

/** Solid cards floating over the photo (backdrop-filter on moving layers is costly). */
function FloatingCard({ className, children, delay = 0 }) {
  return (
    <div
      data-hero-float
      className={`absolute rounded-2xl border border-soft bg-base-100 p-3.5 shadow-[var(--shadow-lift)] animate-float ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

export function Hero() {
  const { data: stats } = usePublicStats();
  const scope = useRef(null);
  const reduced = useReducedMotion();

  // Choreographed entrance: photo settles, copy rises, then the cards pop in.
  useLayoutEffect(() => {
    if (reduced || !scope.current) return undefined;
    const q = (s) => scope.current.querySelectorAll(s);
    const tl = timeline({ defaults: { ease: 'out' } })
      .to(q('[data-hero-image]'), { opacity: [0, 1] }, { duration: 0.9 }, 0)
      .to(q('[data-hero-eyebrow]'), { opacity: [0, 1], y: [12, 0] }, { duration: 0.6 }, 0.2)
      .to(q('[data-hero-copy]'), { opacity: [0, 1], y: [18, 0] }, { duration: 0.8, stagger: 0.1 }, 0.65)
      .to(q('[data-hero-float]'), { opacity: [0, 1], y: [24, 0], scale: [0.9, 1] }, { duration: 0.9, stagger: 0.14, ease: 'backOut' }, 1)
      .prime()
      .play();
    return () => tl.kill();
  }, [reduced]);

  return (
    <section ref={scope} className="relative isolate flex min-h-[100svh] items-center overflow-hidden pb-20 pt-28 lg:pb-24">
      {/* Full-screen photo with parallax drift */}
      <div data-hero-image className="absolute inset-0 -z-20">
        <ParallaxImage photo={PHOTOS.hero} priority speed={0.16} className="absolute inset-0" />
      </div>

      {/* Readability: one composited layer (left fade on desktop, even wash on phones, soft top/bottom edges) */}
      <div className="hero-scrim pointer-events-none absolute inset-0 -z-10" aria-hidden />

      <div className="container-page grid w-full items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="max-w-2xl">
          <p data-hero-eyebrow className="mb-6 inline-flex items-center gap-2 rounded-full border border-soft bg-base-100 px-3 py-1.5 text-xs font-medium text-muted shadow-sm">
            <span className="flex size-5 items-center justify-center rounded-full bg-success/15">
              <span className="size-1.5 rounded-full bg-success pulse-ring" />
            </span>
            {stats ? `${compact(stats.openTuitions)} open tuitions right now` : 'New tuitions posted every day'}
            <Sparkles className="size-3.5 text-accent" aria-hidden />
          </p>

          <TextReveal
            as="h1"
            trigger="mount"
            delay={0.3}
            text={'Find the tutor who\nmakes it click.'}
            highlight={['click.']}
            className="text-[2.75rem] font-semibold leading-[1.02] sm:text-6xl lg:text-[4.75rem]"
          />

          <p data-hero-copy className="mt-6 max-w-xl text-lg leading-relaxed text-base-content/75">
            Post what you need for free, compare verified tutors near you, and hire with secure payments. From Class 1 to university admission.
          </p>

          <div data-hero-copy className="mt-8 max-w-2xl">
            <HeroSearch />
          </div>

          <div data-hero-copy className="mt-5 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-subtle">Popular:</span>
            {POPULAR_SUBJECTS.slice(0, 5).map((s) => (
              <Button key={s} to={`/tuitions?subject=${encodeURIComponent(s)}`} variant="outline" size="xs" className="rounded-full">
                {s}
              </Button>
            ))}
          </div>

          <div data-hero-copy className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {FACES.map(([name, src]) => (
                  <Avatar key={name} src={src} name={name} size="sm" ring />
                ))}
              </div>
              <div className="text-sm leading-tight">
                <p className="font-semibold">{stats ? `${compact(stats.tutors)}+ tutors` : 'Verified tutors'}</p>
                <p className="text-subtle">ready to teach</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Star className="size-5 fill-accent text-accent" />
              <span className="font-semibold">{stats?.averageRating || '4.9'}</span>
              <span className="text-subtle">average rating</span>
            </div>
            <Magnetic className="hidden xl:inline-flex">
              <Button to="/signup" variant="dark" rightIcon={ArrowRight}>
                Become a tutor
              </Button>
            </Magnetic>
          </div>
        </div>

        {/* Floating proof points over the photo (desktop) */}
        <div className="relative hidden h-[480px] lg:block" aria-hidden>
          <FloatingCard className="left-6 top-4 w-64" delay={0}>
            <div className="flex items-center gap-3">
              <Avatar src={FACES[0][1]} name="Farhana Islam" size="md" verified />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Farhana applied</p>
                <p className="text-xs text-subtle">HSC Physics · 2m ago</p>
              </div>
            </div>
          </FloatingCard>
          <FloatingCard className="right-0 top-1/2" delay={1.2}>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-success/15 text-success">
                <CircleDollarSign className="size-5" />
              </span>
              <div>
                <p className="text-xs text-subtle">Secure payment</p>
                <p className="font-display text-lg font-semibold">৳6,000</p>
              </div>
            </div>
          </FloatingCard>
          <FloatingCard className="bottom-6 left-16" delay={2.2}>
            <div className="flex items-center gap-2">
              <BadgeCheck className="size-5 text-primary" />
              <p className="text-sm font-semibold">{stats ? `${stats.successfulMatches}+ matches made` : 'ID-verified tutors'}</p>
              <span className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="size-3.5 fill-accent text-accent" />
                ))}
              </span>
            </div>
          </FloatingCard>
        </div>
      </div>

      {/* Scroll cue */}
      <a
        href="#explore"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs font-medium text-subtle transition-colors hover:text-base-content sm:flex"
        aria-label="Scroll to explore"
      >
        <span className="flex h-9 w-6 justify-center rounded-full border-2 border-current pt-1.5">
          <span className="h-2 w-1 rounded-full bg-current animate-float" />
        </span>
        Scroll
      </a>
    </section>
  );
}
