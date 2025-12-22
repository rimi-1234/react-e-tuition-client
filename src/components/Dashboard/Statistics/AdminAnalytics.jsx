import { useQuery } from '@tanstack/react-query';
import { FaWallet, FaExchangeAlt, FaChartLine, FaDownload, FaUsers, FaChartPie } from 'react-icons/fa';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    LineChart, Line, Legend, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner'; // Assuming you have this

const AdminAnalytics = () => {
    const axiosSecure = useAxiosSecure();
    const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const { data: stats = {}, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const res = await axiosSecure.get('/admin-stats');
            return res.data;
        }
    });

    // --- DATA TRANSFORMATION ---
    const recentTransactions = stats.recentTransactions || [];
    const totalRevenue = stats.totalRevenue || 0;
    const totalTransactions = stats.totalTransactions || 0;
    const chartData = stats.chartData || [];

    const userDemographics = stats.userDemographics?.length > 0 
        ? stats.userDemographics 
        : [{ name: 'No Data', value: 1 }];

    const trafficData = chartData.map(item => ({
        name: new Date(item._id).toLocaleDateString('en-US', { weekday: 'short' }),
        visits: item.count 
    }));

    // --- CSV Download Handler ---
    const handleDownload = () => {
        if (recentTransactions.length === 0) {
            alert("No data available to download.");
            return;
        }
        const headers = ["Date,Time,Student Email,Tutor Email,Transaction ID,Amount,Status"];
        const rows = recentTransactions.map(item => {
            const date = new Date(item.date).toLocaleDateString();
            const time = new Date(item.date).toLocaleTimeString();
            return [
                date, time, item.studentEmail, item.tutorEmail || 'Platform',
                item.transactionId, item.amount, "Paid"
            ].join(",");
        });
        const csvContent = [headers, ...rows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `revenue_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        // Changed p-8 to p-4 for mobile, md:p-8 for desktop
        <div className="w-full p-4 md:p-8 bg-base-200 min-h-screen font-body">
            
            {/* Header: Flex direction changes on mobile */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold font-display text-base-content">
                        Reports & <span className="text-primary">Analytics</span>
                    </h2>
                    <p className="text-gray-500 mt-1 text-sm md:text-base">Platform financial performance overview</p>
                </div>
                <button 
                    onClick={handleDownload} 
                    className="w-full md:w-auto btn btn-primary btn-sm gap-2 shadow-md hover:shadow-lg transition-all"
                >
                    <FaDownload /> Download Report (CSV)
                </button>
            </div>

            {/* 1. Stat Cards: Grid changes for responsiveness (1 col -> 2 cols -> 3 cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                <div className="stat bg-white shadow-sm rounded-xl border border-gray-100 p-4 md:p-6">
                    <div className="stat-figure text-success"><FaWallet className="text-2xl md:text-3xl" /></div>
                    <div className="stat-title font-bold text-gray-500 text-xs md:text-sm">Total Platform Earnings</div>
                    <div className="stat-value text-success text-2xl md:text-4xl">৳ {totalRevenue.toLocaleString()}</div>
                    <div className="stat-desc text-xs">All time revenue</div>
                </div>

                <div className="stat bg-white shadow-sm rounded-xl border border-gray-100 p-4 md:p-6">
                    <div className="stat-figure text-secondary"><FaExchangeAlt className="text-2xl md:text-3xl" /></div>
                    <div className="stat-title font-bold text-gray-500 text-xs md:text-sm">Total Transactions</div>
                    <div className="stat-value text-secondary text-2xl md:text-4xl">{totalTransactions}</div>
                    <div className="stat-desc text-xs">Successful payments processed</div>
                </div>

                {/* On tablet (sm), this might span 2 cols if you want, or stay in grid flow */}
                <div className="stat bg-white shadow-sm rounded-xl border border-gray-100 p-4 md:p-6 sm:col-span-2 lg:col-span-1">
                    <div className="stat-figure text-primary"><FaChartLine className="text-2xl md:text-3xl" /></div>
                    <div className="stat-title font-bold text-gray-500 text-xs md:text-sm">Avg. Transaction Value</div>
                    <div className="stat-value text-primary text-2xl md:text-4xl">
                        ৳ {totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0}
                    </div>
                    <div className="stat-desc text-xs">Per successful payment</div>
                </div>
            </div>

            {/* 2. Charts Section (Row 1) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
                
                {/* Revenue Trend Chart */}
                <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-700">Revenue Trends</h3>
                    </div>
                    {/* Fixed height ensuring it doesn't collapse on mobile */}
                    <div className="h-[250px] md:h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="_id" tick={{fontSize: 10}} tickFormatter={(val) => val ? val.slice(5) : ''} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} tickFormatter={(value) => `৳${value}`}/>
                                <Tooltip formatter={(value) => [`৳${value}`, 'Revenue']} />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                <Line type="monotone" dataKey="dailyRevenue" stroke="#4F46E5" strokeWidth={3} name="Daily Revenue"/>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Transaction Volume Chart */}
                <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-6 text-gray-700">Transaction Volume</h3>
                    <div className="h-[250px] md:h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="_id" tick={{fontSize: 10}} tickFormatter={(val) => val ? val.slice(5) : ''} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} name="Transactions" barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 3. New Charts Section (Row 2) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
                
                {/* User Demographics */}
                <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6">
                        <FaUsers className="text-secondary" />
                        <h3 className="text-lg font-bold text-gray-700">User Distribution</h3>
                    </div>
                    <div className="h-[250px] md:h-[300px] w-full flex justify-center items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={userDemographics}
                                    cx="50%" cy="50%"
                                    // Use percentage for radius to scale on mobile
                                    innerRadius="50%" outerRadius="70%" 
                                    fill="#8884d8" paddingAngle={5}
                                    dataKey="value" label
                                >
                                    {userDemographics.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Site Traffic (Area Chart) */}
                <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6">
                        <FaChartPie className="text-accent" />
                        <h3 className="text-lg font-bold text-gray-700">Daily Activity</h3>
                    </div>
                    <div className="h-[250px] md:h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey="visits" stroke="#8884d8" fillOpacity={1} fill="url(#colorVisits)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 4. Transaction History Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-700">Recent Transactions</h3>
                </div>
                {/* overflow-x-auto allows table to scroll on mobile */}
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th>Date</th>
                                <th>Payer</th>
                                {/* Hide ID on mobile, show on tablet+ */}
                                <th className="hidden md:table-cell">Transaction ID</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTransactions.map((item) => (
                                <tr key={item._id} className="hover:bg-base-200 text-xs md:text-sm border-b border-gray-50">
                                    <td>
                                        <div className="font-medium">{new Date(item.date).toLocaleDateString()}</div>
                                        {/* Optional: Show time on next line for mobile */}
                                        <div className="text-xs text-gray-400 md:hidden">{new Date(item.date).toLocaleTimeString()}</div>
                                    </td>
                                    <td>
                                        <div className="truncate max-w-[120px] md:max-w-xs" title={item.studentEmail}>
                                            {item.studentEmail}
                                        </div>
                                    </td>
                                    {/* Hide ID on mobile */}
                                    <td className="hidden md:table-cell font-mono text-xs text-gray-500">
                                        {item.transactionId}
                                    </td>
                                    <td className="font-bold text-success">৳{item.amount}</td>
                                    <td><span className="badge badge-success badge-sm badge-outline">Success</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div> 
                {recentTransactions.length === 0 && (
                     <div className="p-8 text-center text-gray-500">No transactions found.</div>
                )}
            </div>
        </div>
    );
};

export default AdminAnalytics;