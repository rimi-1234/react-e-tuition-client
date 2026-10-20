import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  Award,
  BadgeCheck,
  BookOpen,
  Briefcase,
  CreditCard,
  Filter,
  GraduationCap,
  Info,
  Mail,
  MessageSquareQuote,
  Phone,
  Star,
  UserX,
  Users,
  X,
} from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingRegion,
  Modal,
  PageHeader,
  Skeleton,
  SkeletonText,
  StarInput,
  StatusBadge,
  Stars,
  Tabs,
  Textarea,
  confirmAction,
} from '../../../components/ui';
import { useApplications, useCheckout, useCreateReview, useRejectApplication, useTuition } from '../../../hooks/useApi';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Stagger } from '../../../motion';
import { cn } from '../../../utils/cn';
import { money, plural, timeAgo } from '../../../utils/format';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Hired' },
  { value: 'Rejected', label: 'Declined' },
];
const STATUS_LABELS = { Approved: 'Hired', Rejected: 'Declined' };
const EMPTY_COPY = {
  all: ['No applications yet', 'Once your tuition is live, tutors will start applying. Most posts get their first applicant within a day.'],
  Pending: ['Nothing waiting on you', 'New applications will show up here for you to review.'],
  Approved: ['You haven’t hired anyone yet', 'Hire a tutor from the Pending tab. Payment is handled securely by Stripe.'],
  Rejected: ['No declined applications', 'Applications you decline will be listed here.'],
};

export default function Applicants() {
  useDocumentTitle('Applicants & hires');
  const [params, setParams] = useSearchParams();
  const tuitionId = params.get('tuitionId') || '';
  const [status, setStatus] = useState('all');
  const [cancelled, setCancelled] = useState(() => params.get('payment') === 'cancelled');
  const [reviewing, setReviewing] = useState(null);

  const { data, isPending, isPlaceholderData, error, refetch } = useApplications('received', { status, tuitionId });
  const { data: filterTuition } = useTuition(tuitionId);
  const items = data?.items || [];

  // Stripe sends people back with ?payment=cancelled; show the notice once, then tidy the URL.
  useEffect(() => {
    if (params.get('payment') !== 'cancelled') return;
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('payment');
        return next;
      },
      { replace: true },
    );
  }, [params, setParams]);

  const clearTuitionFilter = () =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('tuitionId');
        return next;
      },
      { replace: true },
    );

  const [emptyTitle, emptyText] = EMPTY_COPY[status];

  return (
    <>
      <PageHeader
        title="Applicants & hires"
        description="Review tutors who applied to your posts, hire the one you like and pay securely. Their contact details unlock once you hire."
        actions={
          <Button variant="outline" to="/dashboard/my-posts" leftIcon={BookOpen}>
            My tuitions
          </Button>
        }
      />

      {cancelled && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-info/20 bg-info/8 px-4 py-3.5 text-info" role="status">
          <Info className="mt-0.5 size-5 shrink-0" aria-hidden />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold">Payment cancelled</p>
            <p className="mt-0.5 text-base-content/75">No money was taken. You can hire the tutor whenever you’re ready.</p>
          </div>
          <IconButton icon={X} label="Dismiss notice" size="icon-sm" className="-mr-1 -mt-1" onClick={() => setCancelled(false)} />
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Tabs tabs={TABS} value={status} onChange={setStatus} />
        {tuitionId && (
          <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/25 bg-primary/8 py-1 pl-3 pr-1 text-sm text-primary">
            <Filter className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">
              For: <span className="font-medium">{filterTuition?.title || 'one tuition'}</span>
            </span>
            <button
              type="button"
              onClick={clearTuitionFilter}
              aria-label="Show applicants for all tuitions"
              className="flex size-6 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-primary/15"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </span>
        )}
      </div>

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isPending ? (
        <ApplicantsSkeleton />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Users}
          title={emptyTitle}
          description={emptyText}
          action={
            tuitionId ? (
              <Button variant="outline" onClick={clearTuitionFilter}>
                Show all tuitions
              </Button>
            ) : (
              <Button to="/dashboard/my-posts">Go to my tuitions</Button>
            )
          }
        />
      ) : (
        <Stagger
          key={`${status}-${tuitionId}`}
          as="ul"
          className={cn('space-y-4 transition-opacity', isPlaceholderData && 'opacity-60')}
          aria-busy={isPlaceholderData || undefined}
        >
          {items.map((app) => (
            <li key={app.id}>
              <ApplicationCard app={app} onReview={() => setReviewing(app)} />
            </li>
          ))}
        </Stagger>
      )}

      <ReviewModal app={reviewing} onClose={() => setReviewing(null)} />
    </>
  );
}

/* ── One application ──────────────────────────────────────────────── */

function ApplicationCard({ app, onReview }) {
  const tutor = app.tutor || {};
  const tuition = app.tuition || {};
  const name = tutor.displayName || app.tutorName || 'Tutor';
  const experience = tutor.experienceYears ?? app.experience;
  const qualification = [tutor.qualification || app.qualifications, tutor.institution].filter(Boolean).join(' · ');

  return (
    <Card interactive>
      <div className="flex flex-col gap-5 md:flex-row md:items-start">
        {/* Tutor */}
        <div className="flex min-w-0 flex-1 gap-4">
          <Link to={`/tutors/${tutor.id}`} className="shrink-0 rounded-full" tabIndex={-1} aria-hidden>
            <Avatar src={tutor.photoURL || app.tutorPhoto} name={name} size="lg" verified={tutor.verified} />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h3 className="font-sans text-base font-semibold tracking-tight sm:text-lg">
                <Link to={`/tutors/${tutor.id}`} className="hover:text-primary">
                  {name}
                </Link>
              </h3>
              {tutor.verified && (
                <Badge tone="primary" icon={BadgeCheck}>
                  Verified
                </Badge>
              )}
              <StatusBadge status={app.status} labels={STATUS_LABELS} />
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Stars value={tutor.ratingAvg || 0} />
                <span className="tabular-nums">
                  {tutor.ratingCount ? `${Number(tutor.ratingAvg || 0).toFixed(1)} (${tutor.ratingCount})` : 'No reviews yet'}
                </span>
              </span>
              {experience !== undefined && (
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="size-3.5 text-subtle" aria-hidden />
                  {experience ? `${plural(experience, 'year')} experience` : 'New tutor'}
                </span>
              )}
              {tutor.hiredCount > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Award className="size-3.5 text-subtle" aria-hidden />
                  Hired {plural(tutor.hiredCount, 'time')}
                </span>
              )}
            </div>

            {qualification && (
              <p className="mt-2 flex items-start gap-1.5 text-sm text-base-content/80">
                <GraduationCap className="mt-0.5 size-4 shrink-0 text-subtle" aria-hidden />
                <span className="min-w-0">{qualification}</span>
              </p>
            )}

            {tutor.subjects?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tutor.subjects.slice(0, 6).map((s) => (
                  <Badge key={s}>{s}</Badge>
                ))}
                {tutor.subjects.length > 6 && <Badge tone="outline">+{tutor.subjects.length - 6}</Badge>}
              </div>
            )}
          </div>
        </div>

        {/* Salary + tuition */}
        <div className="flex shrink-0 flex-row items-end justify-between gap-4 border-t border-soft pt-4 md:w-56 md:flex-col md:items-end md:border-0 md:pt-0 md:text-right">
          <div>
            <p className="text-xs text-subtle">Expected salary</p>
            <p className="font-display text-2xl font-semibold tracking-tight">{money(app.expectedSalary)}</p>
            <p className="text-xs text-subtle">per month · budget {money(tuition.budget)}</p>
          </div>
          <p className="text-xs text-subtle" title={new Date(app.createdAt).toLocaleString()}>
            Applied {timeAgo(app.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-soft px-4 py-3">
        <p className="text-xs text-subtle">Applied for</p>
        <Link to={`/tuitions/${tuition.id}`} className="mt-0.5 line-clamp-1 text-sm font-medium hover:text-primary">
          {tuition.title || app.tuitionTitle}
        </Link>
        <p className="mt-0.5 text-xs text-muted">
          {[tuition.subject || app.tuitionSubject, tuition.classLevel, tuition.location].filter(Boolean).join(' · ')}
        </p>
      </div>

      {app.message && <CoverMessage text={app.message} />}

      {app.status === 'Approved' && <ContactDetails tutor={tutor} />}

      <ApplicationActions app={app} onReview={onReview} />
    </Card>
  );
}

function CoverMessage({ text }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 220;
  return (
    <div className="mt-4">
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-subtle">
        <MessageSquareQuote className="size-3.5" aria-hidden /> Cover message
      </p>
      <p className={cn('whitespace-pre-line text-sm leading-relaxed text-base-content/85', long && !open && 'line-clamp-3')}>{text}</p>
      {long && (
        <button type="button" onClick={() => setOpen((o) => !o)} className="mt-1 text-sm font-medium text-primary hover:underline" aria-expanded={open}>
          {open ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

function ContactDetails({ tutor }) {
  if (!tutor.email && !tutor.phone) return null;
  return (
    <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-success/20 bg-success/6 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-success">Contact</p>
      {tutor.email && (
        <a href={`mailto:${tutor.email}`} className="inline-flex min-w-0 items-center gap-2 text-sm font-medium hover:text-primary">
          <Mail className="size-4 shrink-0 text-subtle" aria-hidden />
          <span className="truncate">{tutor.email}</span>
        </a>
      )}
      {tutor.phone && (
        <a href={`tel:${tutor.phone.replace(/\s+/g, '')}`} className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary">
          <Phone className="size-4 shrink-0 text-subtle" aria-hidden />
          {tutor.phone}
        </a>
      )}
    </div>
  );
}

/* ── Actions (hire / decline / review) ────────────────────────────── */

function ApplicationActions({ app, onReview }) {
  const checkout = useCheckout();
  const reject = useRejectApplication();
  // Stays true until Stripe's page takes over, so the button doesn't flicker back.
  const [redirecting, setRedirecting] = useState(false);
  const tuitionOpen = !app.tuition?.status || app.tuition.status !== 'Booked';

  const hire = () => {
    setRedirecting(true);
    checkout.mutate(app.id, { onError: () => setRedirecting(false) });
  };

  const decline = async () => {
    const ok = await confirmAction({
      title: 'Decline this application?',
      text: `${app.tutor?.displayName || app.tutorName || 'The tutor'} will be notified. This can’t be undone.`,
      confirmText: 'Decline',
      danger: true,
    });
    if (ok) reject.mutate(app.id);
  };

  if (app.status === 'Pending') {
    return (
      <div className="mt-5 flex flex-col-reverse gap-2 border-t border-soft pt-4 sm:flex-row sm:items-center sm:justify-end">
        <Button variant="ghost" leftIcon={UserX} onClick={decline} loading={reject.isPending} disabled={redirecting}>
          Decline
        </Button>
        <Button leftIcon={CreditCard} onClick={hire} loading={redirecting} disabled={!tuitionOpen || reject.isPending}>
          Hire & pay {money(app.expectedSalary)}
        </Button>
      </div>
    );
  }

  if (app.status === 'Approved') {
    return (
      <div className="mt-5 flex flex-col gap-2 border-t border-soft pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">You hired this tutor. Say hello and agree a start date.</p>
        {app.reviewed ? (
          <Badge tone="success" icon={Star} className="self-start sm:self-auto">
            Reviewed
          </Badge>
        ) : (
          <Button variant="secondary" leftIcon={Star} onClick={onReview}>
            Leave a review
          </Button>
        )}
      </div>
    );
  }

  return null;
}

/* ── Review modal ─────────────────────────────────────────────────── */

function ReviewModal({ app, onClose }) {
  // Keep the last app around while the modal animates closed.
  const [shown, setShown] = useState(app);
  if (app && app !== shown) setShown(app);
  const current = app || shown;

  return (
    <Modal
      open={Boolean(app)}
      onClose={onClose}
      title="Leave a review"
      description={current ? `How was your experience with ${current.tutor?.displayName || current.tutorName}?` : undefined}
    >
      {current && <ReviewForm key={current.id} app={current} onDone={onClose} />}
    </Modal>
  );
}

function ReviewForm({ app, onDone }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const review = useCreateReview({ success: 'Thanks! Your review is live on the tutor’s profile.' });

  const submit = (e) => {
    e.preventDefault();
    if (!rating) return setError('Choose a star rating');
    review.mutate({ applicationId: app.id, rating, comment: comment.trim() }, { onSuccess: onDone });
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div>
        <p className="mb-2 text-sm font-medium text-base-content/90">
          Rating<span className="ml-0.5 text-error">*</span>
        </p>
        <StarInput
          value={rating}
          onChange={(v) => {
            setRating(v);
            setError('');
          }}
        />
        {error && (
          <p className="mt-1.5 text-xs text-error" role="alert">
            {error}
          </p>
        )}
      </div>
      <Textarea
        label="Comment"
        rows={4}
        maxLength={1000}
        placeholder="What did they do well? Would you recommend them to other students?"
        hint={`${comment.length}/1000 · optional`}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" leftIcon={Star} loading={review.isPending}>
          Post review
        </Button>
      </div>
    </form>
  );
}

/* ── Loading ──────────────────────────────────────────────────────── */

function ApplicantsSkeleton() {
  return (
    <LoadingRegion label="Loading applications" className="space-y-4">
      {Array.from({ length: 3 }, (_, i) => (
        <Card key={i}>
          <div className="flex flex-col gap-5 md:flex-row">
            <div className="flex flex-1 gap-4">
              <Skeleton className="size-14" rounded="rounded-full" />
              <div className="flex-1 space-y-2.5">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-56" />
                <Skeleton className="h-3 w-2/3" />
                <div className="flex gap-1.5 pt-1">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
              </div>
            </div>
            <div className="space-y-2 md:w-56 md:items-end">
              <Skeleton className="h-3 w-24 md:ml-auto" />
              <Skeleton className="h-8 w-28 md:ml-auto" />
            </div>
          </div>
          <Skeleton className="mt-5 h-16 w-full rounded-2xl" />
          <SkeletonText lines={2} className="mt-4" />
          <div className="mt-5 flex justify-end gap-2 border-t border-soft pt-4">
            <Skeleton className="h-11 w-28 rounded-xl" />
            <Skeleton className="h-11 w-44 rounded-xl" />
          </div>
        </Card>
      ))}
    </LoadingRegion>
  );
}
