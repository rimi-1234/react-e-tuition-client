import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaTimes, FaPaperPlane, FaStar, FaBriefcase, FaMoneyBillWave } from 'react-icons/fa';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';

/**
 * ApplyTutorModal – tutor application form shown inside a DaisyUI modal.
 *
 * Props:
 *   tuitionId    – MongoDB _id of the tuition post
 *   tuitionTitle – display name shown in the heading
 *   closeModal   – callback to dismiss the modal
 *
 * Security notes:
 *   • recruiterEmail, tuitionSubject, and tuitionLocation are fetched on the
 *     backend from the tuitions collection — the client never needs to send them.
 *   • The tutor's email comes from the verified Firebase token on the backend.
 */
const ApplyTutorModal = ({ tuitionId, tuitionTitle, closeModal }) => {
  const { user }    = useAuth();
  const axiosSecure = useAxiosSecure();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    const toastId = toast.loading('Submitting application…');
    try {
      // Only send the fields the client legitimately owns.
      // recruiterEmail, tuitionSubject, etc. are set by the backend.
      const res = await axiosSecure.post('/applications', {
        tuitionId,
        qualifications:  data.qualifications,
        experience:      data.experience,
        expectedSalary:  parseFloat(data.expectedSalary),
      });

      if (res.data.insertedId) {
        toast.success('Application submitted! The student will review it.', {
          id: toastId,
          duration: 4000,
        });
        reset();
        closeModal();
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        'Something went wrong. Please try again.';
      toast.error(msg, { id: toastId });
    }
  };

  return (
    <dialog className="modal modal-open">
      {/* Backdrop — click to close */}
      <div className="modal-backdrop" onClick={closeModal} />

      <div className="modal-box w-11/12 max-w-2xl bg-base-100 text-base-content">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="font-display text-2xl font-bold text-base-content">Apply for Tuition</h3>
            <p className="mt-1 text-sm text-base-content/60 line-clamp-1">{tuitionTitle}</p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="btn btn-circle btn-ghost btn-sm"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Read-only info */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="form-control">
              <label className="label pb-1 text-[11px] font-bold uppercase text-base-content/50">
                Your Name
              </label>
              <input
                value={user?.displayName || ''}
                readOnly
                className="input input-bordered bg-base-200 text-base-content/60"
              />
            </div>
            <div className="form-control">
              <label className="label pb-1 text-[11px] font-bold uppercase text-base-content/50">
                Your Email
              </label>
              <input
                value={user?.email || ''}
                readOnly
                className="input input-bordered bg-base-200 text-base-content/60"
              />
            </div>
          </div>

          {/* Qualifications */}
          <div className="form-control">
            <label className="label pb-1 text-[11px] font-bold uppercase text-base-content/50">
              <span className="flex items-center gap-1"><FaStar size={10} className="text-warning" /> Qualifications</span>
            </label>
            <input
              {...register('qualifications', { required: 'Qualifications are required' })}
              placeholder="e.g. BSc in Mathematics from BUET"
              className={`input input-bordered bg-base-100 focus:input-primary ${errors.qualifications ? 'input-error' : ''}`}
            />
            {errors.qualifications && (
              <span className="mt-1 text-xs text-error">{errors.qualifications.message}</span>
            )}
          </div>

          {/* Experience */}
          <div className="form-control">
            <label className="label pb-1 text-[11px] font-bold uppercase text-base-content/50">
              <span className="flex items-center gap-1"><FaBriefcase size={10} className="text-primary" /> Teaching Experience</span>
            </label>
            <input
              {...register('experience', { required: 'Experience is required' })}
              placeholder="e.g. 3 years teaching SSC students"
              className={`input input-bordered bg-base-100 focus:input-primary ${errors.experience ? 'input-error' : ''}`}
            />
            {errors.experience && (
              <span className="mt-1 text-xs text-error">{errors.experience.message}</span>
            )}
          </div>

          {/* Expected Salary */}
          <div className="form-control">
            <label className="label pb-1 text-[11px] font-bold uppercase text-base-content/50">
              <span className="flex items-center gap-1"><FaMoneyBillWave size={10} className="text-success" /> Expected Monthly Salary (৳)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-success">৳</span>
              <input
                type="number"
                min="500"
                {...register('expectedSalary', {
                  required: 'Expected salary is required',
                  min: { value: 500, message: 'Minimum is ৳500' },
                })}
                placeholder="5000"
                className={`input input-bordered w-full bg-base-100 pl-9 focus:input-primary ${errors.expectedSalary ? 'input-error' : ''}`}
              />
            </div>
            {errors.expectedSalary && (
              <span className="mt-1 text-xs text-error">{errors.expectedSalary.message}</span>
            )}
          </div>

          {/* Actions */}
          <div className="modal-action mt-6 border-t border-base-300 pt-4">
            <button type="button" onClick={closeModal} className="btn btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary gap-2 text-white"
            >
              {isSubmitting
                ? <span className="loading loading-spinner loading-sm" />
                : <FaPaperPlane size={14} />}
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default ApplyTutorModal;
