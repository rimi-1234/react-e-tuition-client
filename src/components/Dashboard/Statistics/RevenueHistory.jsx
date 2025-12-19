import { useQuery } from '@tanstack/react-query'
import { FaMoneyCheckAlt, FaHistory, FaCalendarAlt } from 'react-icons/fa'
import useAuth from '../../../hooks/useAuth'
import useAxiosSecure from '../../../hooks/useAxiosSecure'

const RevenueHistory = () => {
  const { user } = useAuth()
  const axiosSecure = useAxiosSecure()

  // 1. Fetch Payments Data
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['tutor-payments', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get('/payments')
      return res.data
    }
  })

  // 2. Calculate Total Earnings
  const totalEarnings = payments.reduce((sum, item) => sum + item.amount, 0)

  if (isLoading) return (
    <div className="h-screen flex justify-center items-center">
      <span className="loading loading-spinner text-primary loading-lg"></span>
    </div>
  )

  return (
    <div className="w-full p-8 bg-base-200 min-h-screen font-body">
      <div className="max-w-6xl mx-auto">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8 rounded-lg shadow-lg mb-8">
            <h2 className="text-3xl font-bold mb-2">
                Welcome back, {user?.displayName || 'User'}!
            </h2>
            <p className="opacity-90">Here is what's happening with your revenue today.</p>
        </div>

        {/* Section Header */}
        <div className="mb-6">
           <h2 className="text-2xl font-bold font-display text-base-content">
             Revenue <span className="text-primary">History</span>
           </h2>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Earnings */}
            <div className="stats shadow bg-base-100 text-base-content border border-base-300">
                <div className="stat">
                    <div className="stat-figure text-primary">
                        <FaMoneyCheckAlt size={32} />
                    </div>
                    <div className="stat-title">Total Earnings</div>
                    <div className="stat-value text-primary">৳ {totalEarnings.toLocaleString()}</div>
                    <div className="stat-desc">Lifetime revenue</div>
                </div>
            </div>

            {/* Total Transactions */}
            <div className="stats shadow bg-base-100 text-base-content border border-base-300">
                <div className="stat">
                    <div className="stat-figure text-secondary">
                        <FaHistory size={32} />
                    </div>
                    <div className="stat-title">Total Payments</div>
                    <div className="stat-value text-secondary">{payments.length}</div>
                    <div className="stat-desc">Successful transactions</div>
                </div>
            </div>
            
            {/* Latest Payment Date */}
            <div className="stats shadow bg-base-100 text-base-content border border-base-300">
                <div className="stat">
                    <div className="stat-figure text-accent">
                        <FaCalendarAlt size={32} />
                    </div>
                    <div className="stat-title">Last Payment</div>
                    <div className="stat-value text-xl text-accent">
                        {payments.length > 0 
                          ? new Date(payments[0].date).toLocaleDateString() 
                          : 'N/A'}
                    </div>
                    <div className="stat-desc">Most recent activity</div>
                </div>
            </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-base-100 rounded-xl shadow-xl overflow-hidden border border-gray-100">
            <div className="p-6 border-b flex justify-between items-center bg-base-100">
                <h3 className="text-lg font-bold">Transaction Log</h3>
                <span className="badge badge-primary badge-outline">{payments.length} Records</span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                    {/* Table Head */}
                    <thead className="bg-base-200 text-base-content/70 uppercase text-xs font-bold">
                        <tr>
                            <th>#</th>
                            <th>Date & Time</th>
                            <th>Student Email</th>
                            <th>Transaction ID</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    {/* Table Body */}
                    <tbody>
                        {payments.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-10 text-gray-400">
                                    No transaction history found.
                                </td>
                            </tr>
                        ) : (
                            payments.map((item, index) => (
                                <tr key={item._id} className="hover:bg-base-200 transition-colors">
                                    <th>{index + 1}</th>
                                    <td>
                                        <div className="font-medium text-base-content">
                                            {new Date(item.date).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {new Date(item.date).toLocaleTimeString()}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="text-sm">{item.studentEmail}</span>
                                    </td>
                                    <td className="font-mono text-xs text-gray-500">{item.transactionId}</td>
                                    <td className="font-bold text-primary">৳ {item.amount}</td>
                                    <td>
                                        <div className="badge badge-success gap-2 text-white text-xs">
                                            PAID
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  )
}

export default RevenueHistory