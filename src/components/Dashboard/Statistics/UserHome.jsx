import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  FaChalkboardTeacher, FaBookmark, FaMoneyBillWave,
  FaCheckCircle, FaClock, FaFileAlt, FaArrowRight
} from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';

/**
 * Student dashboard home.
 * Shows real stats pulled from /dashboard/student-stats:
 *   - Tuitions posted, applications received, hires approved,
 *     total money spent, saved tuitions
 * The spending chart shows the last 5 payment amounts.
 */
const UserHome = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['student-stats', user?.email],
    enabled: !!user,
    queryFn: async () => {
      const res = await axiosSecure.get('/dashboard/student-stats');
      return res.data;
    }
  });

  if (isLoading) return <LoadingSpinner />;

  const kpis = [
    {
      label: 'Tuitions Posted',
      value: stats?.tuitionsPosted ?? 0,
      icon: FaFileAlt,
      color: 'text-primary',
      bg: 'bg-primary/10',
      link: 'my-posts',
    },
    {
      label: 'Applications Received',
      value: stats?.applicationsReceived ?? 0,
      icon: FaChalkboardTeacher,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      link: 'applied-tutors',
    },
    {
      label: 'Tutors Hired',
      value: stats?.approvedHires ?? 0,
      icon: FaCheckCircle,
      color: 'text-success',
      bg: 'bg-success/10',
      link: 'applied-tutors',
    },
    {
      label: 'Pending Reviews',
      value: stats?.pendingApplications ?? 0,
      icon: FaClock,
      color: 'text-warning',
      bg: 'bg-warning/10',
      link: 'applied-tutors',
    },
    {
      label: 'Total Spent',
      value: `৳${(stats?.totalSpent ?? 0).toLocaleString()}`,
      icon: FaMoneyBillWave,
      color: 'text-error',
      bg: 'bg-error/10',
      link: 'payment-history',
    },
    {
      label: 'Saved Tuitions',
      value: stats?.savedTuitions ?? 0,
      icon: FaBookmark,
      color: 'text-secondary',
      bg: 'bg-secondary/10',
      link: 'saved-tuitions',
    },
  ];

  // Build chart data from the most recent payments
  const chartData = (stats?.recentPayments ?? [])
    .slice()
    .reverse()
    .map((p, i) => ({
      name: `#${i + 1}`,
      amount: p.amount,
      date: new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    }));

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8 text-base-content font-body">

      {/* Welcome banner */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-primary to-violet-700 p-6 text-white shadow-xl md:p-8">
        <div className="flex items-center gap-4">
          <img
            src={user?.photoURL || '/images/portrait-1.jpg'}
            alt="avatar"
            className="h-14 w-14 rounded-full border-4 border-white/30 object-cover"
          />
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              Welcome back, {user?.displayName?.split(' ')[0] || 'Student'}!
            </h2>
            <p className="mt-1 text-sm text-white/80">
              Here is everything happening with your account today.
            </p>
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            to={kpi.link}
            className="group flex flex-col items-center rounded-2xl border border-base-300 bg-base-100 p-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className={`mb-3 rounded-full ${kpi.bg} p-3`}>
              <kpi.icon className={`text-xl ${kpi.color}`} />
            </div>
            <span className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</span>
            <span className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-base-content/60">
              {kpi.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Charts + Quick Actions row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Spending chart */}
        <div className="col-span-1 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-4 font-bold text-base-content">
            Recent Payments
            {chartData.length === 0 && (
              <span className="ml-2 text-sm font-normal text-base-content/50">(No payments yet)</span>
            )}
          </h3>
          {chartData.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={30}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `৳${v}`} />
                  <Tooltip formatter={(v) => [`৳${v}`, 'Amount']} />
                  <Bar dataKey="amount" fill="#6B46F3" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-52 items-center justify-center text-base-content/30">
              Payments will appear here once you hire a tutor.
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <h3 className="mb-4 font-bold">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Post a Tuition', to: 'post-tuition', accent: true },
              { label: 'Browse Tuitions', to: '/tuitions' },
              { label: 'Find a Tutor', to: '/tutors' },
              { label: 'Payment History', to: 'payment-history' },
              { label: 'Saved Tuitions', to: 'saved-tuitions' },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  action.accent
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-base-200 text-base-content hover:bg-base-300'
                }`}
              >
                {action.label}
                <FaArrowRight size={12} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHome;
