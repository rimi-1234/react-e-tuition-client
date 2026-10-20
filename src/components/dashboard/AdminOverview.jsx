import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Banknote, CreditCard, Inbox, Landmark, ShieldAlert, ShieldCheck, Users } from 'lucide-react';
import { AreaTrend, BarTrend, DonutChart } from '../charts';
import { Avatar, Badge, Button, ErrorState, StatCard, Tabs } from '../ui';
import { useDashboard } from '../../hooks/useApi';
import { useAuth } from '../../providers/AuthProvider';
import { cn } from '../../utils/cn';
import { date, money, plural, timeAgo } from '../../utils/format';
import { ActivityList, ActivityRow, GreetingHeader, HBarList, IconTile, OverviewSkeleton, Panel, PanelLink, StatGrid } from './Shared';

const RANGES = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
];
const ROLE_TONE = { Student: 'primary', Tutor: 'accent', Admin: 'neutral' };
const shortDate = (d) => date(d, { day: 'numeric', month: 'short' });

export default function AdminOverview() {
  const { user } = useAuth();
  const [days, setDays] = useState(30);
  const { data, isPending, isFetching, error, refetch } = useDashboard('Admin', days);

  // Keep the last result on screen while a new range loads, instead of flashing skeletons.
  const [shown, setShown] = useState(data);
  if (data && data !== shown) setShown(data);
  const view = data || shown;

  if (error && !view) return <ErrorState error={error} onRetry={refetch} />;
  if (isPending && !view) return <OverviewSkeleton />;

  const { totals = {}, usersByRole = {}, series = [], topSubjects = [], recentTransactions = [], recentUsers = [] } = view || {};
  const pending = totals.pendingTuitions || 0;
  const switching = isFetching && !data;

  return (
    <>
      <GreetingHeader
        eyebrow="Admin"
        name={user?.displayName}
        line={pending ? `${plural(pending, 'tuition')} waiting for moderation.` : 'All caught up. The moderation queue is empty.'}
        actions={
          <>
            <Button to="/dashboard/admin/tuitions" leftIcon={ShieldCheck}>
              Review queue{pending ? ` (${pending})` : ''}
            </Button>
            <Button to="/dashboard/admin/messages" variant="outline" leftIcon={Inbox}>
              Messages
            </Button>
          </>
        }
      />

      <StatGrid>
        <StatCard label="Gross revenue" value={totals.grossRevenue || 0} format={money} icon={Banknote} hint={`${plural(totals.transactions || 0, 'transaction')} all time`} />
        <StatCard label="Platform earnings" value={totals.platformEarnings || 0} format={money} icon={Landmark} tone="success" hint="Commission on tuition fees" />
        <StatCard label="Users" value={totals.users || 0} icon={Users} tone="info" hint={`${totals.students || 0} students · ${totals.tutors || 0} tutors`} />
        <Link
          to="/dashboard/admin/tuitions"
          className="group block rounded-[var(--radius-box)] transition-transform duration-300 ease-out-soft hover:-translate-y-1"
          aria-label={`Pending tuitions: ${pending}. Open the moderation queue`}
        >
          <StatCard
            label="Pending tuitions"
            value={pending}
            icon={ShieldAlert}
            tone={pending ? 'warning' : 'primary'}
            className={cn('h-full', pending && 'border-warning/40 ring-4 ring-warning/10')}
            hint={
              <span className={cn('inline-flex items-center gap-1', pending && 'font-medium text-warning')}>
                {pending ? 'Needs your review' : 'Queue is clear'}
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            }
          />
        </Link>
      </StatGrid>

      <div className="mb-4 mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Activity</h2>
          <p className="text-sm text-muted">Revenue and sign-ups for the last {days} days</p>
        </div>
        <Tabs tabs={RANGES} value={days} onChange={setDays} />
      </div>

      <div className={cn('grid gap-6 transition-opacity duration-300 lg:grid-cols-3', switching && 'opacity-60')} aria-busy={switching || undefined}>
        <Panel title="Revenue" description="Gross volume and platform fees per day" className="lg:col-span-2">
          <AreaTrend
            data={series}
            xKey="date"
            xFormat={shortDate}
            money
            series={[
              { key: 'revenue', name: 'Gross volume', color: 'primary' },
              { key: 'fees', name: 'Platform fees', color: 'accent' },
            ]}
            emptyText="No payments in this period"
          />
        </Panel>
        <Panel title="Users by role" description="Everyone on the platform" delay={0.08}>
          <DonutChart
            data={[
              { name: 'Students', value: usersByRole.Student, color: 'primary' },
              { name: 'Tutors', value: usersByRole.Tutor, color: 'accent' },
              { name: 'Admins', value: usersByRole.Admin, color: 'secondary' },
            ]}
            centerLabel="users"
          />
        </Panel>

        <Panel title="Sign-ups" description="New accounts per day" className="lg:col-span-2">
          <BarTrend data={series} xKey="date" xFormat={shortDate} dataKey="signups" name="Sign-ups" color="secondary" emptyText="No sign-ups in this period" />
        </Panel>
        <Panel title="Top subjects" description="By number of tuition posts" delay={0.08}>
          <HBarList items={topSubjects.map((s) => ({ label: s.subject, value: s.count }))} empty="No tuitions posted yet" />
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Recent transactions" description="Latest tuition payments" className="lg:col-span-2" action={<PanelLink to="/dashboard/admin/payments" />}>
          <ActivityList items={recentTransactions} empty="No transactions yet.">
            {(p) => (
              <li key={p.id}>
                <ActivityRow
                  leading={<IconTile icon={CreditCard} tone="bg-success/12 text-success" />}
                  title={`${p.studentName || p.studentEmail || 'Student'} → ${p.tutorName || p.tutorEmail || 'Tutor'}`}
                  meta={[p.tuitionTitle || p.tuitionSubject, timeAgo(p.paidAt || p.createdAt)].filter(Boolean).join(' · ')}
                  trailing={
                    <>
                      <span className="text-sm font-semibold tabular-nums">{money(p.amount)}</span>
                      <span className="text-xs tabular-nums text-success">+{money(p.platformFee)} fee</span>
                    </>
                  }
                />
              </li>
            )}
          </ActivityList>
        </Panel>
        <Panel title="Newest users" action={<PanelLink to="/dashboard/admin/users" />} delay={0.08}>
          <ActivityList items={recentUsers} empty="No users yet.">
            {(u) => (
              <li key={u.id}>
                <ActivityRow
                  leading={<Avatar src={u.photoURL} name={u.displayName || u.email} size="sm" />}
                  title={u.displayName || u.email}
                  meta={u.email}
                  trailing={
                    <>
                      <Badge tone={ROLE_TONE[u.role]}>{u.role}</Badge>
                      <span className="text-[11px] text-subtle">{timeAgo(u.createdAt)}</span>
                    </>
                  }
                />
              </li>
            )}
          </ActivityList>
        </Panel>
      </div>
    </>
  );
}
