import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaTrashAlt, FaClock, FaCheckCircle, FaTimesCircle, FaEdit, FaMapMarkerAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const MyApplications = () => {
    const { user, loading } = useAuth();
    const axiosSecure = useAxiosSecure();
    const [editingApp, setEditingApp] = useState(null);

    const { data: applications = [], refetch, isLoading } = useQuery({
        queryKey: ['my-applications', user?.email],
        enabled: !loading && !!user?.email,
        queryFn: async () => {
            // Ensure this matches your backend route exactly
            const res = await axiosSecure.get(`/applications/my-applications?email=${user.email}`);
            return res.data;
        }
    });

    if (loading || isLoading) {
        return <div className="h-screen flex justify-center items-center"><span className="loading loading-spinner text-primary loading-lg"></span></div>;
    }

    // --- Helper for Status Badge Color ---
    const getStatusStyles = (status) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return 'badge-success text-white border-green-600 bg-green-500';
            case 'rejected':
                return 'badge-error text-white border-red-600 bg-red-500';
            default: // pending
                return 'badge-warning text-white border-yellow-600 bg-yellow-500';
        }
    };

    // --- Handle Delete (Withdraw) ---
    const handleDelete = (id) => {
        Swal.fire({
            title: 'Withdraw Application?',
            text: "Are you sure you want to cancel this application?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, Withdraw'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await axiosSecure.delete(`/applications/${id}`);
                    if (res.data.deletedCount > 0) {
                        refetch(); // Reload the table
                        Swal.fire('Withdrawn!', 'Your application has been removed.', 'success');
                    }
                } catch (error) {
                    Swal.fire('Error', 'Failed to withdraw application', 'error');
                }
            }
        });
    };

    // --- Handle Update (Submit Salary Edit) ---
    const handleUpdate = async (e) => {
        e.preventDefault();
        const form = e.target;
        const newSalary = form.salary.value;

        try {
            const res = await axiosSecure.patch(`/applications/${editingApp._id}`, {
                expectedSalary: newSalary
            });

            if (res.data.modifiedCount > 0) {
                refetch(); // Reload the table
                setEditingApp(null); // Close modal
                Swal.fire('Updated!', 'Salary expectation updated successfully.', 'success');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Failed to update application', 'error');
        }
    };

    return (
        <div className="w-full p-2 md:p-6 bg-base-200 min-h-screen font-body">
            <h2 className="text-3xl font-bold font-display text-center md:text-left text-base-content mb-8">
                My Applications <span className="text-primary">({applications.length})</span>
            </h2>

            <div className="overflow-x-auto bg-base-100 rounded-xl shadow-lg border border-base-200">
                <table className="table w-full">
                    {/* Table Head */}
                    <thead className="bg-primary/10 text-base-content font-display text-sm uppercase">
                        <tr>
                            <th>Tuition Info</th>
                            <th>Expected Salary</th>
                            <th>Status</th>
                            <th className="text-center">Action</th>
                        </tr>
                    </thead>
                    {/* Table Body */}
                    <tbody>
                        {applications.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-gray-500">
                                    You haven't applied to any tuitions yet.
                                </td>
                            </tr>
                        ) : (
                            applications.map((app) => (
                                <tr key={app._id} className="hover:bg-base-200/50 transition-colors">
                                    {/* Column 1: Job Info */}
                                    <td>
                                        <div className="flex flex-col gap-1">
                                            <div className="font-bold text-lg text-primary">
                                                {app.tuitionSubject || "Unknown Subject"}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <FaMapMarkerAlt />
                                                {app.tuitionLocation || "Unknown Location"}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                Applied: {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Column 2: Salary */}
                                    <td className="font-bold text-base-content/70">
                                        ৳{app.expectedSalary}
                                    </td>

                                    {/* Column 3: Status with Dynamic Colors */}
                                    <td>
                                        <div className={`badge p-3 font-semibold gap-2 ${getStatusStyles(app.status)}`}>
                                            {app.status === 'Approved' && <FaCheckCircle />}
                                            {app.status === 'Rejected' && <FaTimesCircle />}
                                            {app.status === 'Pending' && <FaClock />}
                                            {app.status}
                                        </div>
                                    </td>

                                    {/* Column 4: Actions */}
                                    <td className="text-center">
                                        {app.status === 'Pending' ? (
                                            <div className="flex justify-center gap-3">
                                                {/* Edit Button */}
                                                <button
                                                    onClick={() => setEditingApp(app)}
                                                    className="btn btn-sm btn-circle btn-ghost text-blue-600 hover:bg-blue-100 tooltip tooltip-left"
                                                    data-tip="Edit Salary"
                                                >
                                                    <FaEdit size={16} />
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDelete(app._id)}
                                                    className="btn btn-sm btn-circle btn-ghost text-red-600 hover:bg-red-100 tooltip tooltip-left"
                                                    data-tip="Withdraw Application"
                                                >
                                                    <FaTrashAlt size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs font-bold text-gray-400 opacity-50 uppercase tracking-widest">
                                                Locked
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- EDIT MODAL --- */}
            {editingApp && (
                <dialog open className="modal modal-open bg-black/50 backdrop-blur-sm">
                    <div className="modal-box">
                        <button 
                            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                            onClick={() => setEditingApp(null)}
                        >✕</button>
                        
                        <h3 className="font-bold text-xl mb-2 text-primary">Update Salary</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Change your expected salary for: <br/>
                            <span className="font-semibold text-gray-700">{editingApp.tuitionSubject}</span>
                        </p>

                        <form onSubmit={handleUpdate}>
                            <div className="form-control w-full mb-6">
                                <label className="label">
                                    <span className="label-text font-semibold">Expected Salary (BDT)</span>
                                </label>
                                <input
                                    type="number"
                                    name="salary"
                                    defaultValue={editingApp.expectedSalary}
                                    className="input input-bordered w-full focus:outline-none focus:border-primary"
                                    required
                                    min="0"
                                />
                            </div>

                            <div className="modal-action">
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => setEditingApp(null)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary px-8">
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </dialog>
            )}
        </div>
    );
};

export default MyApplications;