import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  GraduationCap,
  Laptop,
  Lock,
  MapPin,
  Share2,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react';
import { ApplyModal } from '../../components/tuition/ApplyModal';
import { BookmarkButton, TuitionCard } from '../../components/tuition/TuitionCard';
import { Badge, Button, Card, DetailSkeleton, EmptyState, ErrorState, Img, StatusBadge, notify } from '../../components/ui';
import { useAppliedCheck, useTuition } from '../../hooks/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ParallaxImage, Reveal, Stagger } from '../../motion';
import { useAuth } from '../../providers/AuthProvider';
import { date, money, timeAgo } from '../../utils/format';
import { BANNER_FALLBACK, tuitionCover } from '../../utils/subjectImages';

function ApplyPanel({ tuition }) {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { data: check } = useAppliedCheck(tuition.id);
  const isOwner = user && String(user.id) === String(tuition.student);
  const acceptsApplications = tuition.status === 'Approved';

  let action;
  if (!acceptsApplications) {
    action = (
      <div className="rounded-2xl bg-soft p-4 text-sm text-muted">
        {tuition.status === 'Booked' ? 'This tuition has been filled.' : 'This tuition is not accepting applications right now.'}
      </div>
    );
  } else if (!user) {
    action = (
      <Button size="lg" className="w-full" onClick={() => navigate('/login', { state: { from: location } })}>
        Sign in to apply
      </Button>
    );
  } else if (isOwner) {
    action = (
      <Button size="lg" variant="outline" className="w-full" to={`/dashboard/applied-tutors?tuitionId=${tuition.id}`}>
        View applicants ({tuition.applicationsCount || 0})
      </Button>
    );
  } else if (role !== 'Tutor') {
    action = <div className="rounded-2xl bg-soft p-4 text-sm text-muted">Only tutor accounts can apply to tuitions.</div>;
  } else if (check?.applied) {
    action = (
      <div className="flex items-center gap-3 rounded-2xl bg-success/10 p-4 text-sm text-success">
        <CheckCircle2 className="size-5 shrink-0" />
        <span>
          You applied {timeAgo(check.application.createdAt)}.{' '}
          <Link to="/dashboard/my-applications" className="font-medium underline">
            Track it
          </Link>
        </span>
      </div>
    );
  } else {
    action = (
      <Button size="lg" className="w-full" onClick={() => setOpen(true)}>
        Apply now
      </Button>
    );
  }

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: tuition.title, url });
      else {
        await navigator.clipboard.writeText(url);
        notify.success('Link copied');
      }
    } catch {
      /* share sheet dismissed */
    }
  };

  return (
    <Card className="shadow-[var(--shadow-lift)]">
      <p className="text-sm text-muted">Monthly budget</p>
      <p className="mt-1 font-display text-4xl font-semibold tracking-tight">{money(tuition.budget)}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <StatusBadge status={tuition.status} labels={{ Approved: 'Open for applications' }} />
        <Badge tone="neutral" icon={Users}>
          {tuition.applicationsCount || 0} applied
        </Badge>
      </div>

      <div className="mt-6 space-y-3">
        {action}
        <div className="flex gap-2">
          <BookmarkButton tuitionId={tuition.id} withLabel className="flex-1 justify-center" />
          <Button variant="outline" className="h-11 flex-1" leftIcon={Share2} onClick={share}>
            Share
          </Button>
        </div>
      </div>

      <ul className="mt-6 space-y-2.5 border-t border-soft pt-5 text-sm text-muted">
        <li className="flex gap-2.5">
          <ShieldCheck className="size-4 shrink-0 text-success" /> Reviewed by the Edurock team
        </li>
        <li className="flex gap-2.5">
          <Lock className="size-4 shrink-0 text-primary" /> Contact details stay private
        </li>
        <li className="flex gap-2.5">
          <Sparkles className="size-4 shrink-0 text-accent" /> Secure payment when hired
        </li>
      </ul>
      {open && <ApplyModal open={open} onClose={() => setOpen(false)} tuition={tuition} />}
    </Card>
  );
}

function Banner({ tuition }) {
  const cover = tuitionCover(tuition, { widths: [800, 1400, 2000] });
  return (
    <section className="relative isolate flex min-h-[380px] items-end overflow-hidden pb-10 pt-32 text-white sm:min-h-[460px]">
      <ParallaxImage photo={{ ...cover, fallback: BANNER_FALLBACK, alt: '' }} priority speed={0.22} className="absolute inset-0 -z-20" />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-[#0b1020] via-[#0b1020]/65 to-[#0b1020]/25" aria-hidden />
      <div className="container-page">
        <Link to="/tuitions" className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white/85 transition-colors hover:bg-white/20">
          <ArrowLeft className="size-4" /> All tuitions
        </Link>
        <Reveal className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#12152b]">{tuition.subject}</span>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">{tuition.classLevel}</span>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">{tuition.teachingMode}</span>
          <span className="text-xs text-white/70">Posted {timeAgo(tuition.createdAt)}</span>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">{tuition.title}</h1>
        </Reveal>
        <Reveal delay={0.1} className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4" /> {tuition.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" /> {tuition.schedule || 'Flexible schedule'}
          </span>
          <span className="font-display text-xl font-semibold text-white">{money(tuition.budget)}<span className="text-sm font-normal text-white/70"> /month</span></span>
        </Reveal>
      </div>
    </section>
  );
}

export default function TuitionDetails() {
  const { id } = useParams();
  const { data: tuition, isPending, error, refetch } = useTuition(id);
  useDocumentTitle(tuition?.title || 'Tuition');

  if (isPending || error) {
    return (
      <div className="container-page pb-16 pt-32">
        {isPending ? (
          <DetailSkeleton />
        ) : error.status === 404 ? (
          <EmptyState title="This tuition isn’t available" description="It may have been filled or removed by the student." action={<Button to="/tuitions">Browse other tuitions</Button>} />
        ) : (
          <ErrorState error={error} onRetry={refetch} />
        )}
      </div>
    );
  }

  const requirements = [
    [GraduationCap, 'Class / level', tuition.classLevel],
    [Laptop, 'Teaching mode', tuition.teachingMode === 'Both' ? 'Home visit or online' : tuition.teachingMode],
    [CalendarDays, 'Schedule', tuition.schedule || 'Flexible'],
    [Users, 'Preferred tutor', tuition.preferredTutor === 'Any' ? 'No preference' : `${tuition.preferredTutor} tutor`],
    [Sparkles, 'Tutor experience', tuition.experienceNeeded === 'Any' ? 'Any level welcome' : tuition.experienceNeeded],
    [UserRound, 'Student', tuition.studentGender || 'Not specified'],
  ];

  return (
    <>
      <Banner tuition={tuition} />

      <div className="container-page grid gap-10 pb-16 pt-10 lg:grid-cols-[1fr_380px]">
        <article className="min-w-0 space-y-10">
          <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-4" stagger={0.06}>
            {[
              [Users, 'Applicants', tuition.applicationsCount || 0],
              [Eye, 'Views', tuition.views ?? '—'],
              [Clock, 'Posted', date(tuition.createdAt, { day: 'numeric', month: 'short' })],
              [MapPin, 'Area', tuition.location.split(',')[0]],
            ].map(([Icon, label, value]) => (
              <div key={label} className="rounded-2xl border border-soft bg-base-100 p-4">
                <Icon className="size-5 text-primary" aria-hidden />
                <p className="mt-3 text-xs text-subtle">{label}</p>
                <p className="mt-0.5 truncate text-sm font-semibold">{value}</p>
              </div>
            ))}
          </Stagger>

          <Reveal>
            <h2 className="font-sans text-xl font-semibold">About this tuition</h2>
            <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-base-content/80">{tuition.description}</p>
          </Reveal>

          <Reveal>
            <h2 className="font-sans text-xl font-semibold">What the student is looking for</h2>
            <Card className="mt-4 grid gap-x-8 gap-y-1 sm:grid-cols-2">
              {requirements.map(([Icon, label, value]) => (
                <div key={label} className="flex items-center gap-3 border-b border-soft py-3 last:border-0 sm:[&:nth-last-child(2)]:border-0">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-subtle">{label}</p>
                    <p className="truncate text-sm font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </Card>
          </Reveal>

          {tuition.media?.length > 0 && (
            <Reveal>
              <h2 className="font-sans text-xl font-semibold">Photos</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {tuition.media.map((src) => (
                  <a key={src} href={src} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-2xl">
                    <Img src={src} alt="Tuition attachment" className="aspect-[4/3] rounded-2xl" imgClassName="transition-transform duration-700 hover:scale-105" />
                  </a>
                ))}
              </div>
            </Reveal>
          )}

          <Reveal>
            <div className="flex gap-4 rounded-[var(--radius-box)] border border-primary/15 bg-primary/5 p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Lock className="size-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-sans font-semibold">Your privacy is protected</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  Names, phone numbers and addresses are never shown on public pages. Only the Edurock team can see who posted and who applied, and contact details are shared
                  between a family and a tutor only after a confirmed booking.
                </p>
              </div>
            </div>
          </Reveal>
        </article>

        <aside>
          <ApplyPanel tuition={tuition} />
        </aside>
      </div>

      {tuition.similar?.length > 0 && (
        <section className="container-page pb-8">
          <h2 className="text-2xl font-semibold sm:text-3xl">Similar tuitions</h2>
          <Stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
            {tuition.similar.map((t) => (
              <TuitionCard key={t.id} tuition={t} />
            ))}
          </Stagger>
        </section>
      )}
    </>
  );
}
