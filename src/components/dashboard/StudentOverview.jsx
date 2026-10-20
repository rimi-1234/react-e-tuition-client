import {
  Bookmark,
  ClipboardList,
  CreditCard,
  FilePlus2,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';
import { AreaTrend, DonutChart } from '../charts';
import { Avatar, Button, ErrorState, StatCard, StatusBadge } from '../ui';
import { useDashboard } from '../../hooks/useApi';
import { useAuth } from '../../providers/AuthProvider';
import { money, plural, timeAgo } from '../../utils/format';
import { ActivityList, ActivityRow, GreetingHeader, OverviewSkeleton, Panel, PanelLink, QuickActions, StatGrid, StepsCard } from './Shared';

const APP_LABELS = { Approved: 'Hired', Rejected: 'Declined' };

export default function StudentOverview() {
  const { user } = useAuth();
  const { data, isPending, error, refetch } = useDashboard('Student');

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (isPending) return <OverviewSkeleton />;

  const { totals = {}, tuitionsByStatus = {}, spendingChart = [], recentApplications = [] } = data || {};
  const pending = totals.pendingApplications || 0;
  const isNew = !totals.tuitionsPosted;

  const line = isNew
    ? 'Welcome to Edurock. Post what you need and verified tutors will come to you.'
    : pending
      ? `You have ${plural(pending, 'tutor application')} waiting for your review.`
      : 'Here’s how your tuition search is going.';

  const actions = [
    { to: '/dashboard/post-tuition', label: 'Post a tuition', description: 'Describe the subject, class and budget', icon: FilePlus2 },
    { to: '/tutors', label: 'Browse tutors', description: 'Compare verified tutors by subject and rating', icon: Search, tone: 'bg-accent/15 text-accent' },
    {
      to: '/dashboard/saved-tuitions',
      label: 'Saved tuitions',
      description: totals.savedTuitions ? `${plural(totals.savedTuitions, 'saved post')}` : 'Bookmarks you want to revisit',
      icon: Bookmark,
      tone: 'bg-secondary/12 text-secondary',
    },
    { to: '/dashboard/payment-history', label: 'Payment history', description: 'Receipts for every tuition fee', icon: CreditCard, tone: 'bg-info/10 text-info' },
  ];

  const header = (
    <GreetingHeader
      name={user?.displayName}
      line={line}
      actions={
        <>
          <Button to="/dashboard/post-tuition" leftIcon={FilePlus2}>
            Post a tuition
          </Button>
          <Button to="/tutors" variant="outline" leftIcon={Search}>
            Browse tutors
          </Button>
        </>
      }
    />
  );

  if (isNew) {
    return (
      <>
        {header}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <StepsCard
              title="Find the right tutor in three steps"
              description="Most posts get their first application within a day."
              steps={[
                { icon: FilePlus2, title: 'Post a tuition', text: 'Share the subject, class, area, schedule and your monthly budget.' },
                { icon: ShieldCheck, title: 'We review it', text: 'Our team checks every post, usually within a few hours, then it goes live.' },
                { icon: UserCheck, title: 'Hire and pay safely', text: 'Compare applicants, hire the best fit and pay the first month securely.' },
              ]}
              action={
                <Button to="/dashboard/post-tuition" leftIcon={FilePlus2}>
                  Post your first tuition
                </Button>
              }
            />
          </div>
          <Panel title="Quick actions" delay={0.1}>
            <QuickActions actions={actions} />
          </Panel>
        </div>
      </>
    );
  }

  const statusSlices = [
    { name: 'In review', value: tuitionsByStatus.Pending, color: 'warning' },
    { name: 'Live', value: tuitionsByStatus.Approved, color: 'success' },
    { name: 'Booked', value: tuitionsByStatus.Booked, color: 'primary' },
    { name: 'Needs changes', value: tuitionsByStatus.Rejected, color: 'error' },
  ];

  return (
    <>
      {header}
      <StatGrid>
        <StatCard
          label="Tuitions posted"
          value={totals.tuitionsPosted || 0}
          icon={ClipboardList}
          hint={`${tuitionsByStatus.Approved || 0} live · ${tuitionsByStatus.Pending || 0} in review`}
        />
        <StatCard
          label="Applications received"
          value={totals.applicationsReceived || 0}
          icon={Users}
          tone="accent"
          hint={pending ? `${pending} awaiting your review` : 'All caught up'}
        />
        <StatCard label="Tutors hired" value={totals.tutorsHired || 0} icon={UserCheck} tone="success" hint="Approved and paid" />
        <StatCard label="Total spent" value={totals.totalSpent || 0} format={money} icon={Wallet} tone="info" hint="Paid securely via Stripe" />
      </StatGrid>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Spending" description="Tuition fees paid over the last 6 months" className="lg:col-span-2" action={<PanelLink to="/dashboard/payment-history">Payments</PanelLink>}>
          <AreaTrend data={spendingChart} xKey="label" dataKey="amount" name="Paid" money emptyText="No payments yet" />
        </Panel>
        <Panel title="Your posts" description="By current status" delay={0.08}>
          <DonutChart data={statusSlices} centerLabel={totals.tuitionsPosted === 1 ? 'tuition' : 'tuitions'} />
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Recent applicants" description="Tutors who applied to your posts" className="lg:col-span-2" action={<PanelLink to="/dashboard/applied-tutors" />}>
          <ActivityList items={recentApplications} empty="No applications yet. Live posts usually get their first one within a day.">
            {(a) => (
              <li key={a.id}>
                <ActivityRow
                  to={typeof a.tuition === 'string' ? `/dashboard/applied-tutors?tuitionId=${a.tuition}` : '/dashboard/applied-tutors'}
                  leading={<Avatar src={a.tutorPhoto} name={a.tutorName} size="sm" />}
                  title={a.tutorName || 'A tutor'}
                  meta={`${a.tuitionTitle || 'Your tuition'} · ${timeAgo(a.createdAt)}`}
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
        <Panel title="Quick actions" delay={0.08}>
          <QuickActions actions={actions} />
        </Panel>
      </div>
    </>
  );
}
