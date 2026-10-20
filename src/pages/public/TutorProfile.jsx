import { Link, useParams } from 'react-router';
import { ArrowLeft, BadgeCheck, BriefcaseBusiness, Building2, CalendarDays, GraduationCap, Laptop, MapPin, MessageSquareQuote, Star, Trophy } from 'lucide-react';
import { Avatar, Badge, Button, Card, DetailSkeleton, EmptyState, ErrorState, InfoRow, Stars } from '../../components/ui';
import { useTutor } from '../../hooks/useApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { CountUp, Reveal, Stagger } from '../../motion';
import { useAuth } from '../../providers/AuthProvider';
import { date, money, timeAgo } from '../../utils/format';

export default function TutorProfile() {
  const { id } = useParams();
  const { data: tutor, isPending, error, refetch } = useTutor(id);
  const { role } = useAuth();
  useDocumentTitle(tutor?.displayName || 'Tutor');

  if (isPending) {
    return (
      <div className="container-page pb-16 pt-32">
        <DetailSkeleton />
      </div>
    );
  }
  if (error) {
    return (
      <div className="container-page pb-16 pt-32">
        {error.status === 404 ? (
          <EmptyState title="Tutor not found" description="This profile may have been removed." action={<Button to="/tutors">Browse tutors</Button>} />
        ) : (
          <ErrorState error={error} onRetry={refetch} />
        )}
      </div>
    );
  }

  const maxCount = Math.max(1, ...tutor.ratingBreakdown.map((b) => b.count));

  return (
    <div className="pb-16">
      {/* Cover */}
      <div className="relative h-56 overflow-hidden bg-linear-to-br from-primary/25 via-primary/10 to-accent/20 sm:h-64">
        <div className="absolute inset-0 bg-dots opacity-70" aria-hidden />
      </div>

      <div className="container-page">
        <div className="-mt-20 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <Link to="/tutors" className="relative mb-4 inline-flex items-center gap-2 rounded-full bg-base-100/80 px-3 py-1.5 text-sm text-muted hover:text-base-content">
              <ArrowLeft className="size-4" /> All tutors
            </Link>
            <Reveal className="flex flex-col gap-5 sm:flex-row sm:items-end">
              <Avatar src={tutor.photoURL} name={tutor.displayName} size="2xl" verified={tutor.verified} ring />
              <div className="pb-1">
                <h1 className="text-3xl font-semibold sm:text-4xl">{tutor.displayName}</h1>
                <p className="mt-1 text-muted">{tutor.qualification || 'Tutor on Edurock'}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {tutor.verified && (
                    <Badge tone="primary" icon={BadgeCheck}>
                      Verified tutor
                    </Badge>
                  )}
                  {tutor.ratingCount > 0 && (
                    <Badge tone="accent" icon={Star}>
                      {tutor.ratingAvg.toFixed(1)} · {tutor.ratingCount} reviews
                    </Badge>
                  )}
                  {tutor.location && (
                    <Badge tone="neutral" icon={MapPin}>
                      {tutor.location}
                    </Badge>
                  )}
                </div>
              </div>
            </Reveal>

            <Stagger className="mt-10 grid grid-cols-3 gap-3" stagger={0.08}>
              {[
                ['Years teaching', tutor.experienceYears || 0, BriefcaseBusiness],
                ['Students hired', tutor.hiredCount || 0, Trophy],
                ['Reviews', tutor.ratingCount || 0, MessageSquareQuote],
              ].map(([label, value, Icon]) => (
                <Card key={label} className="p-4! text-center sm:p-5!">
                  <Icon className="mx-auto size-5 text-primary" />
                  <p className="mt-2 font-display text-3xl font-semibold">
                    <CountUp to={value} />
                  </p>
                  <p className="text-xs text-subtle">{label}</p>
                </Card>
              ))}
            </Stagger>

            <Reveal className="mt-10">
              <h2 className="font-sans text-lg font-semibold">About</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-base-content/80">
                {tutor.bio || `${tutor.displayName.split(' ')[0]} hasn’t written a bio yet.`}
              </p>
            </Reveal>

            {tutor.subjects?.length > 0 && (
              <Reveal className="mt-8">
                <h2 className="font-sans text-lg font-semibold">Subjects</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tutor.subjects.map((s) => (
                    <Link key={s} to={`/tuitions?subject=${encodeURIComponent(s)}`}>
                      <Badge tone="primary" className="px-3.5 py-1.5 text-sm transition-colors hover:bg-primary/20">
                        {s}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </Reveal>
            )}

            {/* Reviews */}
            <section className="mt-12">
              <h2 className="text-2xl font-semibold">Reviews</h2>
              {tutor.ratingCount > 0 ? (
                <>
                  <Card className="mt-5 grid items-center gap-6 sm:grid-cols-[auto_1fr]">
                    <div className="text-center sm:px-6">
                      <p className="font-display text-5xl font-semibold">{tutor.ratingAvg.toFixed(1)}</p>
                      <Stars value={tutor.ratingAvg} className="mt-2" />
                      <p className="mt-1 text-xs text-subtle">{tutor.ratingCount} reviews</p>
                    </div>
                    <ul className="space-y-1.5">
                      {tutor.ratingBreakdown.map((b) => (
                        <li key={b.stars} className="flex items-center gap-3 text-sm">
                          <span className="w-3 text-subtle">{b.stars}</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-soft">
                            <div className="h-full rounded-full bg-accent transition-[width] duration-1000 ease-out-soft" style={{ width: `${(b.count / maxCount) * 100}%` }} />
                          </div>
                          <span className="w-6 text-right text-xs text-subtle">{b.count}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                  <Stagger className="mt-5 space-y-4" stagger={0.06}>
                    {tutor.reviews.map((r) => (
                      <Card key={r.id}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Avatar src={r.studentPhoto} name={r.studentName} size="sm" />
                            <div>
                              <p className="text-sm font-semibold">{r.studentName}</p>
                              <p className="text-xs text-subtle">
                                {r.tuitionSubject} · {timeAgo(r.createdAt)}
                              </p>
                            </div>
                          </div>
                          <Stars value={r.rating} />
                        </div>
                        {r.comment && <p className="mt-4 leading-relaxed text-base-content/80">{r.comment}</p>}
                      </Card>
                    ))}
                  </Stagger>
                </>
              ) : (
                <EmptyState compact className="mt-5" icon={MessageSquareQuote} title="No reviews yet" description="Reviews appear after a family hires this tutor." />
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:pt-24">
            <Card>
              <p className="text-sm text-muted">Expected monthly rate</p>
              <p className="mt-1 font-display text-4xl font-semibold">{tutor.expectedSalary ? money(tutor.expectedSalary) : 'Negotiable'}</p>
              <div className="mt-4 divide-y divide-[color-mix(in_oklab,var(--color-base-content)_8%,transparent)]">
                <InfoRow icon={GraduationCap} label="Qualification" value={tutor.qualification} />
                <InfoRow icon={Building2} label="Institution" value={tutor.institution} />
                <InfoRow icon={Laptop} label="Teaching mode" value={tutor.teachingMode || 'Flexible'} />
                <InfoRow icon={CalendarDays} label="Member since" value={date(tutor.createdAt, { month: 'long', year: 'numeric' })} />
              </div>
              {role !== 'Tutor' && (
                <div className="mt-6 space-y-2">
                  <Button to="/dashboard/post-tuition" size="lg" className="w-full">
                    Post a tuition to hire
                  </Button>
                  <p className="text-center text-xs text-subtle">Tutors apply to your post. You pay only when you hire.</p>
                </div>
              )}
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
