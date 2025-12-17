import { useQuery } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { FaCheck, FaTimes, FaEnvelope, FaMoneyBillAlt } from 'react-icons/fa';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const AppliedTutors = () => {
    const { user, loading } = useAuth();
    const axiosSecure = useAxiosSecure();

    // --- Fetch Applications ---
    const { data: applications = [], refetch, isLoading } = useQuery({
        queryKey: ['received-applications', user?.email],
        enabled: !loading && !!user?.email,
        queryFn: async () => {
            const res = await axiosSecure.get(`/applications/received?email=${user.email}`);
            return res.data;
        }
    });

    // --- Handle Pay (Stripe Checkout Session) ---
    const handlePay = async (application) => {
        try {
            // 1. Request a session URL from your backend
            const res = await axiosSecure.post('/create-checkout-session', {
                applicationId: application._id,
                tuitionId: application.tuitionId 
            });

            // 2. Redirect user to Stripe's hosted page
            if (res.data.url) {
                window.location.replace(res.data.url);
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', error.response?.data?.message || 'Payment initiation failed', 'error');
        }
    };

    // --- Handle Reject ---
    const handleReject = (id, tutorName) => {
        Swal.fire({
            title: `Reject ${tutorName}?`,
            text: `This will mark the application as rejected.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: `Yes, Reject`
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await axiosSecure.patch(`/applications/reject/${id}`);
                    if (res.data.modifiedCount > 0) {
                        refetch();
                        Swal.fire('Rejected', 'Application rejected.', 'success');
                    }
                } catch (error) {
                    Swal.fire('Error', 'Could not reject.', 'error');
                }
            }
        });
    };

    if (isLoading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="w-full p-6 bg-base-200 min-h-screen">
            <h2 className="text-3xl font-bold mb-6">Applied Tutors</h2>
            <div className="overflow-x-auto bg-base-100 rounded-xl shadow-lg">
                <table className="table w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th>Tutor</th>
                            <th>Subject</th>
                            <th>Salary</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map(app => (
                            <tr key={app._id}>
                                <td>
                                    <div className="font-bold">{app.tutorName}</div>
                                    <div className="text-xs text-gray-500">{app.tutorEmail}</div>
                                </td>
                                <td>{app.tuitionSubject}</td>
                                <td className="font-bold text-green-600">৳{app.expectedSalary}</td>
                                <td>
                                    <span className={`badge ${app.status === 'Approved' ? 'badge-success' : app.status === 'Rejected' ? 'badge-error' : 'badge-warning'}`}>
                                        {app.status}
                                    </span>
                                </td>
                                <td>
                                    {app.status === 'pending' || app.status === 'Pending' ? (
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handlePay(app)}
                                                className="btn btn-sm btn-success text-white"
                                            >
                                                <FaCheck /> Hire & Pay
                                            </button>
                                            <button 
                                                onClick={() => handleReject(app._id, app.tutorName)}
                                                className="btn btn-sm btn-circle btn-ghost text-red-500"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-sm">Closed</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AppliedTutors;