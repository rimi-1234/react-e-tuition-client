import { useQuery } from '@tanstack/react-query';
import { FaWallet, FaExchangeAlt, FaChartLine, FaDownload } from 'react-icons/fa';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    LineChart, Line, Legend 
} from 'recharts';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const AdminAnalytics = () => {
    const axiosSecure = useAxiosSecure();

    const { data: stats = { totalRevenue: 0, totalTransactions: 0, chartData: [], recentTransactions: [] }, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const res = await axiosSecure.get('/admin-stats');
            return res.data;
        }
    });

    // --- CSV Download Handler ---
    const handleDownload = () => {
        if (!stats.recentTransactions || stats.recentTransactions.length === 0) {
            alert("No data available to download.");
            return;
        }

        // 1. Define CSV Headers
        const headers = ["Date,Time,Student Email,Tutor Email,Transaction ID,Amount,Status"];

        // 2. Map data to CSV rows
        const rows = stats.recentTransactions.map(item => {
            const date = new Date(item.date).toLocaleDateString();
            const time = new Date(item.date).toLocaleTimeString();
            // Handle potential commas in data by wrapping in quotes if necessary
            return [
                date,
                time,
                item.studentEmail,
                item.tutorEmail || 'Platform',
                item.transactionId,
                item.amount,
                "Paid"
            ].join(",");
        });

        // 3. Combine headers and rows
        const csvContent = [headers, ...rows].join("\n");

        // 4. Create a Blob and trigger download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `revenue_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) return (
        <div className="h-screen flex justify-center items-center">
            <span className="loading loading-spinner text-primary loading-lg"></span>
        </div>
    );

    return (
        <div className="w-full p-8 bg-base-200 min-h-screen font-body">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold font-display text-base-content">
                        Reports & <span className="text-primary">Analytics</span>
                    </h2>
                    <p className="text-gray-500 mt-1">Platform financial performance overview</p>
                </div>
                {/* Download Button with onClick Handler */}
                <button 
                    onClick={handleDownload} 
                    className="btn btn-primary btn-sm gap-2 mt-4 md:mt-0 shadow-md hover:shadow-lg transition-all"
                >
                    <FaDownload /> Download Report (CSV)
                </button>
            </div>

            {/* 1. Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Platform Earnings */}
                <div className="stat bg-white shadow-sm rounded-xl border border-gray-100">
                    <div className="stat-figure text-success">
                        <FaWallet className="text-3xl" />
                    </div>
                    <div className="stat-title font-bold text-gray-500">Total Platform Earnings</div>
                    <div className="stat-value text-success">৳ {stats.totalRevenue.toLocaleString()}</div>
                    <div className="stat-desc">All time revenue</div>
                </div>

                {/* Total Transactions */}
                <div className="stat bg-white shadow-sm rounded-xl border border-gray-100">
                    <div className="stat-figure text-secondary">
                        <FaExchangeAlt className="text-3xl" />
                    </div>
                    <div className="stat-title font-bold text-gray-500">Total Transactions</div>
                    <div className="stat-value text-secondary">{stats.totalTransactions}</div>
                    <div className="stat-desc">Successful payments processed</div>
                </div>

                {/* Growth Metric */}
                <div className="stat bg-white shadow-sm rounded-xl border border-gray-100">
                    <div className="stat-figure text-primary">
                        <FaChartLine className="text-3xl" />
                    </div>
                    <div className="stat-title font-bold text-gray-500">Avg. Transaction Value</div>
                    <div className="stat-value text-primary">
                        ৳ {stats.totalTransactions > 0 
                            ? Math.round(stats.totalRevenue / stats.totalTransactions) 
                            : 0}
                    </div>
                    <div className="stat-desc">Per successful payment</div>
                </div>
            </div>

            {/* 2. Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                
                {/* Revenue Trend Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-700">Revenue Trends (Daily)</h3>
                        <div className="badge badge-outline">Daily View</div>
                    </div>
                    
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis 
                                    dataKey="_id" 
                                    tick={{fontSize: 12, fill: '#6b7280'}} 
                                    tickFormatter={(val) => val.slice(5)} 
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis 
                                    tick={{fontSize: 12, fill: '#6b7280'}} 
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `৳${value}`}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`৳${value}`, 'Revenue']}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Line 
                                    type="monotone" 
                                    dataKey="dailyRevenue" 
                                    stroke="#4F46E5"
                                    strokeWidth={3}
                                    dot={{ fill: '#4F46E5', strokeWidth: 2 }}
                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                    name="Daily Revenue"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Transaction Volume Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-6 text-gray-700">Transaction Volume</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis 
                                    dataKey="_id" 
                                    tick={{fontSize: 12, fill: '#6b7280'}} 
                                    tickFormatter={(val) => val.slice(5)} 
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis 
                                    allowDecimals={false} 
                                    tick={{fontSize: 12, fill: '#6b7280'}} 
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip 
                                    cursor={{fill: '#f3f4f6'}}
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                />
                                <Bar 
                                    dataKey="count" 
                                    fill="#10B981"
                                    radius={[4, 4, 0, 0]} 
                                    name="Transactions" 
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 3. Transaction History Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-700">Global Transaction History</h3>
                    <span className="badge badge-ghost">Latest 100</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th>Date</th>
                                <th>Payer (Student)</th>
                                <th>Receiver (Tutor)</th>
                                <th>Transaction ID</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-400">No transactions recorded yet.</td>
                                </tr>
                            ) : (
                                stats.recentTransactions.map((item) => (
                                    <tr key={item._id} className="hover:bg-base-200 text-sm border-b border-gray-50">
                                        <td>
                                            <div className="font-medium text-gray-700">
                                                {new Date(item.date).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {new Date(item.date).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td>{item.studentEmail}</td>
                                        <td>
                                            <div className="badge badge-ghost badge-sm">
                                                {item.tutorEmail || 'Platform'}
                                            </div>
                                        </td>
                                        <td className="font-mono text-xs text-gray-500">{item.transactionId}</td>
                                        <td className="font-bold text-success">৳{item.amount}</td>
                                        <td>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Success
                                            </span>
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

export default AdminAnalytics; 