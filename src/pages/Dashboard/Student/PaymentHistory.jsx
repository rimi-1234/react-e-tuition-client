import React from 'react';

import { useQuery } from '@tanstack/react-query';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const PaymentHistory = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();

    const { data: payments = [], isLoading } = useQuery({
        queryKey: ['payments', user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/payments`);
            return res.data;
        }
    });

    if (isLoading) {
        return <div className="text-center mt-20">Loading payment history...</div>;
    }

    return (
        <div className="w-full p-4 md:p-10 bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Payment History</h2>
                    <p className="text-gray-500 mt-1">
                        Track all your transactions securely.
                    </p>
                </div>
                <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-semibold">
                    Total Transactions: {payments.length}
                </div>
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto bg-white shadow-lg rounded-xl border border-gray-200">
                <table className="table w-full">
                    {/* Head */}
                    <thead className="bg-gray-100 text-gray-600 uppercase text-sm font-semibold">
                        <tr>
                            <th className="py-4 pl-6">#</th>
                            <th>Transaction ID</th>
                            <th>Amount</th>
                            <th>Details</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    
                    {/* Body */}
                    <tbody className="text-gray-700">
                        {payments.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-8 text-gray-500">
                                    No payment history found.
                                </td>
                            </tr>
                        ) : (
                            payments.map((payment, index) => (
                                <tr key={payment._id} className="hover:bg-gray-50 border-b last:border-none transition-colors">
                                    
                                    {/* Index */}
                                    <td className="pl-6 font-bold text-indigo-600">
                                        {index + 1}
                                    </td>

                                    {/* Transaction ID */}
                                    <td className="font-mono text-xs md:text-sm">
                                        {payment.transactionId}
                                    </td>

                                    {/* Amount */}
                                    <td className="font-bold text-green-600">
                                        {payment.currency?.toUpperCase()} {payment.amount}
                                    </td>

                                    {/* Logic: Who did I pay / Who paid me? */}
                                    <td>
                                        <div className="flex flex-col">
                                            {user.email === payment.studentEmail ? (
                                                <span className="text-sm font-medium text-red-500">
                                                    Paid to: <span className="text-gray-600">{payment.tutorEmail}</span>
                                                </span>
                                            ) : (
                                                <span className="text-sm font-medium text-green-500">
                                                    Received from: <span className="text-gray-600">{payment.studentEmail}</span>
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-400 mt-1">Tuition ID: {payment.tuitionId.slice(-6)}...</span>
                                        </div>
                                    </td>

                                    {/* Date */}
                                    <td>
                                        {new Date(payment.date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                        <br/>
                                        <span className="text-xs text-gray-400">
                                            {new Date(payment.date).toLocaleTimeString()}
                                        </span>
                                    </td>

                                    {/* Status Badge */}
                                    <td>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold 
                                            ${payment.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {payment.status?.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentHistory;