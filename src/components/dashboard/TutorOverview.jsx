import { BookOpen, BookOpenCheck, CheckCircle2, Circle, ListChecks, Search, Sparkles, Star, Target, UserRound, Wallet } from 'lucide-react';
import { AreaTrend, DonutChart } from '../charts';
import { Button, Card, ErrorState, StatCard, Stars, StatusBadge } from '../ui';
import { Reveal } from '../../motion';
import { useDashboard } from '../../hooks/useApi';
import { useAuth } from '../../providers/AuthProvider';
import { cn } from '../../utils/cn';
import { money, plural, timeAgo } from '../../utils/format';
import { ActivityList, ActivityRow, CtaBanner, GreetingHeader, IconTile, OverviewSkeleton, Panel, PanelLink, StatGrid } from './Shared';

const APP_LABELS = { Approved: 'Hired', Rejected: 'Not selected' };

function ProfileNudge({ hasSubjects, hasBio }) {
  const checks = [
    { done: hasSubjects, label: 'Add the subjects you teach' },
    { done: hasBio, label: 'Write a short bio about your teaching' },
  ];
  return (
    <Reveal>
      <Card className="mb-6 border-accent/30 bg-accent/5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <IconTile icon={Sparkles} tone="bg-accent/15 text-accent" />
            <div className="min-w-0">
              <h2 className="font-sans text-base font-semibold">Complete your profile</h2>
              <p className="mt-0.5 text-sm text-muted">Students shortlist tutors with clear subjects and a friendly bio first.</p>
              <ul className="mt-3 space-y-1.5">
                {checks.map((c) => (
                  <li key={c.label} className={cn('flex items-center gap-2 text-sm', c.done ? 'text-subtle line-through' : 'text-base-content')}>
                    {c.done ? <CheckCircle2 className="size-4 text-success" aria-hidden /> : <Circle className="size-4 text-subtle" aria-hidden />}
                    <span>
                      {c.label}
                      <span className="sr-only">{c.done ? ' (done)' : ' (to do)'}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Button to="/dashboard/profile" variant="dark" leftIcon={UserRound} className="self-start sm:self-auto">
            Finish profile
          </Button>
        </div>
      </Card>
    </Reveal>
  );
}

export default function TutorOverview() {
  const { user } = useAuth();
  const { data, isPending, error, refetch } = useDashboard('Tutor');

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (isPending) return <OverviewSkeleton />;

  const { totals = {}, applicationsByStatus = {}, earningsChart = [], recentApplications = [] } = data || {};
  const pending = totals.pendingApplications || 0;
  const decided = (totals.approvedBookings || 0) + (totals.rejectedApplications || 0);
  const hasSubjects = Boolean(user?.subjects?.length);
  const hasBio = Boolean(user?.bio?.trim());
  const rating = Number(totals.avgRating) || 0;

  const line = pending
    ? `${plural(pending, 'application')} waiting on a student’s decision.`
    : totals.totalApplications
      ? 'New tuitions are posted every day. Keep your applications flowing.'
      : 'Find tuitions that match your subjects and apply in under a minute.';

  const slices = [
    { name: 'Pending', value: applicationsByStatus.Pending, color: 'warning' },
    { name: 'Hired', value: applicationsByStatus.Approved, color: 'success' },
    { name: 'Not selected', value: applicationsByStatus.Rejected, color: 'error' },
  ];

  return (
    <>
      <GreetingHeader
        name={user?.displayName}
        line={line}
        actions={
          <>
            <Button to="/tuitions" leftIcon={Search}>
              Browse new tuitions
            </Button>
            <Button to="/dashboard/my-applications" variant="outline" leftIcon={ListChecks}>
              My applications
            </Button>
          </>
        }
      />

      {(!hasSubjects || !hasBio) && <ProfileNudge hasSubjects={hasSubjects} hasBio={hasBio} />}

      <StatGrid>
        <StatCard
          label="Total earned"
          value={totals.totalEarned || 0}
          format={money}
          icon={Wallet}
          tone="success"
          hint={totals.grossEarned ? `${money(totals.grossEarned)} before platform fee` : 'Payouts appear after your first hire'}
        />
        <StatCard label="Bookings" value={totals.approvedBookings || 0} icon={BookOpenCheck} hint={`${pending} pending · ${totals.totalApplications || 0} applied`} />
        <StatCard
          label="Success rate"
          value={totals.successRate || 0}
          suffix="%"
          icon={Target}
          tone="info"
          hint={decided ? `${totals.approvedBookings || 0} hired of ${decided} decided` : 'No decisions yet'}
        />
        <StatCard
          label="Rating"
          value={
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="tabular-nums">{rating ? rating.toFixed(1) : '—'}</span>
              <Stars value={rating} />
            </span>
          }
          icon={Star}
          tone="accent"
          hint={totals.reviewCount ? plural(totals.reviewCount, 'review') : 'Reviews appear after your first booking'}
        />
      </StatGrid>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Earnings" description="Net payouts over the last 6 months" className="lg:col-span-2" action={<PanelLink to="/dashboard/payment-history">Earnings</PanelLink>}>
          <AreaTrend data={earningsChart} xKey="label" series={[{ key: 'amount', name: 'Earned', color: 'success' }]} money emptyText="No earnings yet" />
        </Panel>
        <Panel title="Applications" description="Where your applications stand" delay={0.08}>
          <DonutChart data={slices} centerLabel={totals.totalApplications === 1 ? 'application' : 'applications'} />
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title="Recent applications" description="Your latest five" action={<PanelLink to="/dashboard/my-applications" />}>
          <ActivityList items={recentApplications} empty="You haven’t applied to any tuitions yet.">
            {(a) => (
              <li key={a.id}>
                <ActivityRow
                  to={typeof a.tuition === 'string' ? `/tuitions/${a.tuition}` : '/dashboard/my-applications'}
                  leading={<IconTile icon={BookOpen} />}
                  title={a.tuitionTitle || 'Tuition'}
                  meta={[a.tuitionSubject, timeAgo(a.createdAt)].filter(Boolean).join(' · ')}
                  trailing={
                    <>
                      <span className="text-sm font-semibold tabular-nums">
                        {money(a.expectedSalary)}
                        <span className="text-xs font-normal text-subtle">/mo</span>
                      </span>
                      <StatusBadge status={a.status} labels={APP_LABELS} />
                    </>
                  }
                />
              </li>
            )}
          </ActivityList>
        </Panel>
      </div>

      <div className="mt-6">
        <CtaBanner
          title="Fresh tuitions, every day"
          text="Filter by subject, class and area, then send a tailored application. Early applicants are seen first."
          to="/tuitions"
          label="Browse new tuitions"
        />
      </div>
    </>
  );
}
