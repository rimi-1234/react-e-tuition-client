import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';
import useAxiosSecure from '../../hooks/useAxiosSecure';

/* ------------------------------------------------------------------ */
/*  FEATURE 5 – Leave a star review after a completed booking          */
/*  Only students with an approved booking can reach this modal.       */
/* ------------------------------------------------------------------ */
const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1" role="group" aria-label="Rating">
    {[1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        type="button"
        aria-label={`${star} star${star > 1 ? 's' : ''}`}
        onClick={() => onChange(star)}
        className={`text-2xl transition-transform hover:scale-110 ${
          star <= value ? 'text-amber-400' : 'text-base-300'
        }`}
      >
        <FaStar />
      </button>
    ))}
  </div>
);

const LeaveReviewModal = ({ application, onClose }) => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const submit = useMutation({
    mutationFn: () =>
      axiosSecure.post('/reviews', {
        tutorEmail: application.tutorEmail,
        applicationId: application._id,
        rating,
        comment
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Review submitted — thank you!');
      onClose();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Could not submit review');
    }
  });

  return (
    <dialog open className="modal modal-open z-50 bg-base-300/50 backdrop-blur-sm">
      <div className="modal-box w-full max-w-md border border-base-300 bg-base-100 text-base-content shadow-2xl">
        <button
          aria-label="Close"
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
          onClick={onClose}
        >
          ✕
        </button>

        <h3 className="mb-1 font-display text-xl font-bold text-primary">Leave a Review</h3>
        <p className="mb-6 text-sm text-base-content/60">
          You're rating <span className="font-semibold text-base-content">{application.tutorName}</span> for the{' '}
          <span className="font-semibold text-base-content">{application.tuitionSubject}</span> tuition.
        </p>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold">Your rating</label>
          <StarPicker value={rating} onChange={setRating} />
          <p className="mt-1 text-xs text-base-content/50">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="review-comment" className="mb-2 block text-sm font-semibold">
            Comment <span className="font-normal text-base-content/40">(optional)</span>
          </label>
          <textarea
            id="review-comment"
            rows={4}
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="What did you enjoy about the lessons? Would you recommend this tutor?"
            className="textarea textarea-bordered w-full resize-none bg-base-100 text-base-content focus:border-primary focus:outline-none"
          />
        </div>

        <div className="modal-action justify-between gap-3">
          <button onClick={onClose} className="btn btn-ghost flex-1">
            Cancel
          </button>
          <button
            onClick={() => submit.mutate()}
            disabled={submit.isPending}
            className="btn btn-primary flex-1"
          >
            {submit.isPending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              'Submit Review'
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default LeaveReviewModal;
