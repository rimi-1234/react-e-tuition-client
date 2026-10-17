import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  FaMoneyCheckAlt, FaCheckCircle, FaClock,
  FaStar, FaFileAlt, FaArrowRight
} from 'react-icons/fa';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import LoadingSpinner from '../../Shared/LoadingSpinner';

/**
 * Tutor dashboard home.
 * Pulls real data from /dashboard/tutor-stats and shows:
 *   - KPI cards: applications sent, bookings approved, earnings, rating
 *   - Area chart: monthly earnings trend
 *   - Recent payments table
 */
const RevenueHistory = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['tutor-stats', user?.email],
    enabled: !!user,
    queryFn: async () => {
      const res = await axiosSecure.get('/dashboard/tutor-stats');
      return res.data;
    }
  });

  if (isLoading) return <LoadingSpinner />;

  const kpis = [
    {
      label: 'Total Applications',
      value: stats?.totalApplications ?? 0,
      icon: FaFileAlt,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Bookings Approved',
      value: stats?.approvedBookings ?? 0,
      icon: FaCheckCircle,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Pending Applications',
      value: stats?.pendingApplications ?? 0,
      icon: FaClock,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      label: 'Total Earned',
      value: `৳${(stats?.totalEarned ?? 0).toLocaleString()}`,
      icon: FaMoneyCheckAlt,
      color: 'text-secondary',
      bg: 'bg-secondary/10',
    },
    {
      label: 'Average Rating',
      value: stats?.avgRating ? `${stats.avgRating} ★` : '—',
      icon: FaStar,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Student Reviews',
      value: stats?.reviewCount ?? 0,
      icon: FaStar,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
  ];

  const chartData = stats?.earningsChart ?? [];
  const recentPayments = stats?.recentPayments ?? [];

  return (
    <div className="min-h-screen bg-base-200 p-4 text-base-content font-body md:p-8">

      {/* Welcome banner */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white shadow-xl md:p-8">
        <div className="flex items-center gap-4">
          <img
            src={user?.photoURL || '/images/portrait-2.jpg'}
            alt="avatar"
            className="h-14 w-14 rounded-full border-4 border-white/30 object-cover"
          />
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              {user?.displayName?.split(' ')[0] || 'Tutor'}'s Dashboard
            </h2>
            <p className="mt-1 text-sm text-white/80">
              Here is your earnings and application overview.
            </p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="flex flex-col items-center rounded-2xl border border-base-300 bg-base-100 p-4 text-center shadow-sm"
          >
            <div className={`mb-3 rounded-full ${kpi.bg} p-3`}>
              <kpi.icon className={`text-xl ${kpi.color}`} />
            </div>
            <span className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</span>
            <span className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-base-content/60">
              {kpi.label}
            </span>
          </div>
        ))}
      </div>

      {/* Chart + Actions */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-1 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-4 font-bold">Monthly Earnings</h3>
          {chartData.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="earningGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `৳${v}`} />
                  <Tooltip formatter={v => [`৳${v}`, 'Earnings']} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#10B981"
                    strokeWidth={2}
                    fill="url(#earningGrad)"
                    name="Earnings"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-52 items-center justify-center text-base-content/30">
              Earnings data will appear here after your first completed booking.
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <h3 className="mb-4 font-bold">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Browse Tuitions', to: '/tuitions', accent: true },
              { label: 'My Applications', to: 'my-applications' },
              { label: 'Ongoing Tuitions', to: 'ongoing-tuitions' },
              { label: 'Update Profile', to: 'profile' },
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

      {/* Recent Payments table */}
      <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
        <div className="flex items-center justify-between border-b border-base-300 px-5 py-4">
          <h3 className="font-bold">Recent Payments</h3>
          <span className="badge badge-primary badge-outline">{recentPayments.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-base-200 text-[11px] uppercase text-base-content/60">
              <tr>
                <th>Date</th>
                <th>From (Student)</th>
                <th className="hidden md:table-cell">Transaction ID</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-base-content/40">
                    No payment history yet.
                  </td>
                </tr>
              ) : (
                recentPayments.map((p) => (
                  <tr key={p._id} className="border-base-300 transition hover:bg-base-200/50">
                    <td className="text-sm">
                      <div className="font-medium">{new Date(p.date).toLocaleDateString()}</div>
                      <div className="text-xs text-base-content/40">{new Date(p.date).toLocaleTimeString()}</div>
                    </td>
                    <td className="max-w-[140px] truncate text-sm">{p.studentEmail}</td>
                    <td className="hidden font-mono text-xs text-base-content/40 md:table-cell">{p.transactionId}</td>
                    <td className="font-bold text-success">৳{p.amount}</td>
                    <td>
                      <span className="badge badge-success badge-sm badge-outline">Paid</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RevenueHistory;
