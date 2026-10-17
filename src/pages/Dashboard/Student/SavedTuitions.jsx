import { Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaBookmark, FaMapMarkerAlt, FaTrashAlt, FaArrowRight } from 'react-icons/fa';
import toast from 'react-hot-toast';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useAuth from '../../../hooks/useAuth';

/* ------------------------------------------------------------------ */
/*  FEATURE 3 – Saved tuitions dashboard page                          */
/*  Students can browse their bookmarked posts here and remove any     */
/*  they are no longer interested in.                                  */
/* ------------------------------------------------------------------ */
const SavedTuitions = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: saved = [], isLoading } = useQuery({
    queryKey: ['bookmarks', user?.email],
    enabled: !!user,
    queryFn: async () => {
      const res = await axiosSecure.get('/bookmarks');
      return res.data;
    }
  });

  const remove = useMutation({
    mutationFn: (tuitionId) => axiosSecure.delete(`/bookmarks/${tuitionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks', user?.email] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks-ids', user?.email] });
      toast.success('Removed from saved');
    },
    onError: () => toast.error('Could not remove bookmark')
  });

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8 text-base-content">
      <div className="mb-8 flex items-center gap-3">
        <FaBookmark className="text-primary text-2xl" />
        <div>
          <h2 className="font-display text-3xl font-bold">Saved Tuitions</h2>
          <p className="text-sm text-base-content/60">
            {saved.length} tuition{saved.length !== 1 ? 's' : ''} saved
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 animate-pulse rounded-2xl border border-base-300 bg-base-100" />
          ))}
        </div>
      )}

      {!isLoading && saved.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-base-300 bg-base-100 py-24 text-center">
          <FaBookmark className="text-5xl text-base-content/20" />
          <p className="text-xl font-bold text-base-content/50">No saved tuitions yet.</p>
          <p className="text-sm text-base-content/40">
            Hit the bookmark icon on any tuition card to save it here.
          </p>
          <Link to="/tuitions" className="btn btn-primary mt-2">
            Browse Tuitions
          </Link>
        </div>
      )}

      {!isLoading && saved.length > 0 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {saved.map(({ tuitionId, tuition, savedAt }) => (
            <div
              key={tuitionId}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    {tuition?.class}
                  </span>
                  <button
                    aria-label="Remove from saved"
                    onClick={() => remove.mutate(tuitionId)}
                    disabled={remove.isPending}
                    className="btn btn-ghost btn-xs text-error"
                  >
                    <FaTrashAlt />
                  </button>
                </div>

                <h3 className="mt-3 font-display text-lg font-bold line-clamp-1">
                  {tuition?.title || `${tuition?.subject} Tutor Needed`}
                </h3>

                <p className="mt-1 line-clamp-2 text-xs text-base-content/60">
                  {tuition?.description || 'No description provided.'}
                </p>

                <div className="mt-3 flex items-center gap-2 text-xs text-base-content/60">
                  <FaMapMarkerAlt className="text-rose-400" />
                  <span className="truncate">{tuition?.location}</span>
                </div>

                <p className="mt-1 text-lg font-bold">
                  ৳{tuition?.budget}
                  <span className="ml-1 text-[10px] font-normal text-base-content/40">/mo</span>
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-base-300 pt-3">
                <span className="text-[10px] text-base-content/40">
                  Saved {new Date(savedAt).toLocaleDateString()}
                </span>
                <Link
                  to={`/tuition/${tuitionId}`}
                  className="btn btn-primary btn-xs gap-1"
                >
                  View <FaArrowRight size={10} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedTuitions;
