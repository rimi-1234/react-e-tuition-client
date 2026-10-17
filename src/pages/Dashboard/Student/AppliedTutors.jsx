import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FaCheck, FaTimes, FaStar, FaChalkboardTeacher } from 'react-icons/fa';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import LeaveReviewModal from '../../../components/Modal/LeaveReviewModal';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';

const AppliedTutors = () => {
  const { user } = useAuth();
  const axiosSecure       = useAxiosSecure();
  const queryClient       = useQueryClient();
  const [reviewTarget, setReviewTarget] = useState(null);

  /* ── Fetch applications received for this student's tuitions ────── */
  const { data: applications = [], isLoading, isError } = useQuery({
    queryKey: ['received-applications', user?.email],
    // By the time AppliedTutors mounts, StudentRoute has already confirmed
    // the user is logged in and is a Student — no need to re-check `loading`.
    enabled:  !!user?.email,
    retry:    false,   // fail fast — no 3× retry that causes long spinner
    staleTime: 30_000, // don't refetch if data is less than 30 s old
    queryFn:  async () => {
      // Backend reads email from the verified Firebase token — no ?email= needed
      const res = await axiosSecure.get('/applications/received');
      return res.data;
    }
  });

  /* ── Hire & Pay — redirects to Stripe Checkout ──────────────────── */
  const handlePay = async (application) => {
    const toastId = toast.loading('Opening Stripe checkout…');
    try {
      const res = await axiosSecure.post('/create-checkout-session', {
        applicationId: application._id,
        tuitionId:     application.tuitionId,
      });
      toast.dismiss(toastId);
      if (res.data.url) window.location.replace(res.data.url);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Payment initiation failed. Please try again.',
        { id: toastId }
      );
    }
  };

  /* ── Reject application ──────────────────────────────────────────── */
  const rejectMutation = useMutation({
    mutationFn: (id) => axiosSecure.patch(`/applications/reject/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['received-applications', user?.email] });
      toast.success('Application rejected.');
    },
    onError: () => toast.error('Could not reject application.'),
  });

  const handleReject = (app) => {
    if (!window.confirm(`Reject application from ${app.tutorName}?`)) return;
    rejectMutation.mutate(app._id);
  };

  /* ── Render ──────────────────────────────────────────────────────── */
  if (isLoading) return <LoadingSpinner />;

  if (isError) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-4xl">⚠️</p>
      <p className="text-xl font-bold text-base-content">Could not load applications</p>
      <p className="text-sm text-base-content/50">
        Make sure you are logged in and your account has the Student role.
      </p>
      <button onClick={() => window.location.reload()} className="btn btn-primary btn-sm">
        Retry
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-200 p-4 text-base-content md:p-8">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold">Applied Tutors</h2>
          <p className="mt-1 text-sm text-base-content/60">
            Tutors who applied for your posted tuitions
          </p>
        </div>
        <span className="badge badge-primary badge-outline">{applications.length} applications</span>
      </div>

      {/* Empty state */}
      {applications.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-base-300 bg-base-100 py-24 text-center">
          <FaChalkboardTeacher className="text-5xl text-base-content/20" />
          <p className="text-xl font-bold text-base-content/50">No applications yet.</p>
          <p className="max-w-xs text-sm text-base-content/40">
            Once you post a tuition and tutors apply, their cards will appear here.
          </p>
          <Link to="/dashboard/post-tuition" className="btn btn-primary mt-2">
            Post a Tuition
          </Link>
        </div>
      )}

      {/* Table — desktop */}
      {applications.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-base-200 text-[11px] uppercase text-base-content/60">
                <tr>
                  <th>Tutor</th>
                  <th>Subject</th>
                  <th>Experience</th>
                  <th>Salary Ask</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app._id} className="border-base-300 transition hover:bg-base-200/50">

                    {/* Tutor info */}
                    <td>
                      <div className="flex items-center gap-3">
                        <img
                          src={app.tutorImage || '/images/portrait-1.jpg'}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-base-300"
                          alt={app.tutorName}
                        />
                        <div>
                          <div className="font-bold">{app.tutorName}</div>
                          <div className="text-xs text-base-content/50">{app.tutorEmail}</div>
                        </div>
                      </div>
                    </td>

                    <td className="text-sm font-medium">{app.tuitionSubject || app.tuitionTitle || '—'}</td>

                    <td className="max-w-[180px] text-xs text-base-content/70">
                      <p className="truncate">{app.qualifications}</p>
                      <p className="truncate text-base-content/50">{app.experience}</p>
                    </td>

                    <td className="font-bold text-success">৳{app.expectedSalary}</td>

                    {/* Status badge */}
                    <td>
                      <span className={`badge badge-sm ${
                        app.status === 'Approved' ? 'badge-success' :
                        app.status === 'Rejected' ? 'badge-error'   : 'badge-warning'
                      }`}>
                        {app.status}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td>
                      {app.status === 'Pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePay(app)}
                            className="btn btn-sm btn-success gap-1 text-white"
                          >
                            <FaCheck size={11} /> Hire & Pay
                          </button>
                          <button
                            onClick={() => handleReject(app)}
                            disabled={rejectMutation.isPending}
                            className="btn btn-sm btn-circle btn-ghost text-error"
                            title="Reject"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ) : app.status === 'Approved' ? (
                        <button
                          onClick={() => setReviewTarget(app)}
                          className="btn btn-sm btn-outline btn-warning gap-1"
                        >
                          <FaStar size={11} /> Review
                        </button>
                      ) : (
                        <span className="text-xs text-base-content/40">Closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review modal */}
      {reviewTarget && (
        <LeaveReviewModal
          application={reviewTarget}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </div>
  );
};

export default AppliedTutors;
