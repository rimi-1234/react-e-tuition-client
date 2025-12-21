import { useQuery } from '@tanstack/react-query';
import { FaWallet, FaExchangeAlt, FaChartLine, FaDownload, FaUsers, FaChartPie } from 'react-icons/fa';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    LineChart, Line, Legend, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

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
    
    // 1. Chart Data (Revenue & Volume)
    const chartData = stats.chartData || [];

    // 2. User Demographics (Pie Chart)
    // Fallback to empty array if API fails, preventing map error
    const userDemographics = stats.userDemographics?.length > 0 
        ? stats.userDemographics 
        : [{ name: 'No Data', value: 1 }]; // Placeholder to prevent empty pie crash

    // 3. Traffic Data (Area Chart)
    // We map the backend 'chartData' (which has daily counts) to 'trafficData' format
    const trafficData = chartData.map(item => ({
        name: new Date(item._id).toLocaleDateString('en-US', { weekday: 'short' }), // "Mon", "Tue"
        visits: item.count // Use transaction count as "Visits"
    }));

    // --- CSV Download Handler (Unchanged) ---
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
                <button 
                    onClick={handleDownload} 
                    className="btn btn-primary btn-sm gap-2 mt-4 md:mt-0 shadow-md hover:shadow-lg transition-all"
                >
                    <FaDownload /> Download Report (CSV)
                </button>
            </div>

            {/* 1. Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="stat bg-white shadow-sm rounded-xl border border-gray-100">
                    <div className="stat-figure text-success"><FaWallet className="text-3xl" /></div>
                    <div className="stat-title font-bold text-gray-500">Total Platform Earnings</div>
                    <div className="stat-value text-success">৳ {totalRevenue.toLocaleString()}</div>
                    <div className="stat-desc">All time revenue</div>
                </div>

                <div className="stat bg-white shadow-sm rounded-xl border border-gray-100">
                    <div className="stat-figure text-secondary"><FaExchangeAlt className="text-3xl" /></div>
                    <div className="stat-title font-bold text-gray-500">Total Transactions</div>
                    <div className="stat-value text-secondary">{totalTransactions}</div>
                    <div className="stat-desc">Successful payments processed</div>
                </div>

                <div className="stat bg-white shadow-sm rounded-xl border border-gray-100">
                    <div className="stat-figure text-primary"><FaChartLine className="text-3xl" /></div>
                    <div className="stat-title font-bold text-gray-500">Avg. Transaction Value</div>
                    <div className="stat-value text-primary">
                        ৳ {totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0}
                    </div>
                    <div className="stat-desc">Per successful payment</div>
                </div>
            </div>

            {/* 2. Charts Section (Row 1) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                
                {/* Revenue Trend Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-700">Revenue Trends</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="_id" tick={{fontSize: 12}} tickFormatter={(val) => val ? val.slice(5) : ''} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(value) => `৳${value}`}/>
                                <Tooltip formatter={(value) => [`৳${value}`, 'Revenue']} />
                                <Legend />
                                <Line type="monotone" dataKey="dailyRevenue" stroke="#4F46E5" strokeWidth={3} name="Daily Revenue"/>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Transaction Volume Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-6 text-gray-700">Transaction Volume</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="_id" tick={{fontSize: 12}} tickFormatter={(val) => val ? val.slice(5) : ''} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} name="Transactions" barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 3. New Charts Section (Row 2) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                
                {/* User Demographics */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6">
                        <FaUsers className="text-secondary" />
                        <h3 className="text-lg font-bold text-gray-700">User Distribution</h3>
                    </div>
                    <div className="h-[300px] w-full flex justify-center items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={userDemographics}
                                    cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={100}
                                    fill="#8884d8" paddingAngle={5}
                                    dataKey="value" label
                                >
                                    {userDemographics.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Site Traffic (Area Chart) - Uses Transaction Data */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6">
                        <FaChartPie className="text-accent" />
                        <h3 className="text-lg font-bold text-gray-700">Daily Activity (Transactions)</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trafficData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey="visits" stroke="#8884d8" fillOpacity={1} fill="url(#colorVisits)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 4. Transaction History Table - Kept as is, using safe data */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-700">Global Transaction History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th>Date</th>
                                <th>Payer</th>
                                <th>Transaction ID</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTransactions.map((item) => (
                                <tr key={item._id} className="hover:bg-base-200 text-sm border-b border-gray-50">
                                    <td>{new Date(item.date).toLocaleDateString()}</td>
                                    <td>{item.studentEmail}</td>
                                    <td className="font-mono text-xs">{item.transactionId}</td>
                                    <td className="font-bold text-success">৳{item.amount}</td>
                                    <td><span className="badge badge-success badge-sm">Success</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;