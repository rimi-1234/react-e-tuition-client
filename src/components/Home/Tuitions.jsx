import { useCallback, useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router'
import {
  FaMapMarkerAlt, FaSearch, FaArrowRight,
  FaChevronLeft, FaChevronRight, FaStar, FaBookmark,
  FaRegBookmark, FaTimes
} from 'react-icons/fa'
import useAxiosSecure from '../../hooks/useAxiosSecure'
import useAuth from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import { useDebounce } from '../../hooks/useDebounce'

/* ------------------------------------------------------------------ */
/*  FEATURE 1 – All filter state lives in the URL.                     */
/*  A search like /tuitions?search=Math&class=Class+10 is bookmarkable */
/*  and survives a page refresh.                                        */
/* ------------------------------------------------------------------ */
const Tuitions = () => {
  const axiosSecure = useAxiosSecure()
  const { user } = useAuth()

  // Read filters from the URL instead of local state
  const [params, setParams] = useSearchParams()
  const search     = params.get('search')      || ''
  const filterClass = params.get('class')       || ''
  const sort        = params.get('sort')         || 'newest'
  const page        = Number(params.get('page')) || 1
  const limit = 8

  // Debounce the search text so typing "Math" doesn't fire 4 API requests
  const debouncedSearch = useDebounce(search, 400)

  // Helper: update one param and reset page to 1 (except when changing page itself)
  const setFilter = useCallback((key, value) => {
    setParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) { next.set(key, value) } else { next.delete(key) }
      if (key !== 'page') next.set('page', '1')
      return next
    })
  }, [setParams])

  const setPage = useCallback((p) => {
    setParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('page', String(p))
      return next
    })
  }, [setParams])

  const clearFilters = () => setParams({})

  const hasActiveFilters = search || filterClass || sort !== 'newest'

  const { data, isLoading } = useQuery({
    queryKey: ['approved-tuitions', debouncedSearch, filterClass, sort, page],
    queryFn: async () => {
      const res = await axiosSecure.get(`/tuitions/status`, {
        params: { status: 'Approved', search: debouncedSearch, filterClass, sort, page, limit }
      })
      return res.data
    },
    keepPreviousData: true
  })

  /* FEATURE 3 – Bookmarks: fetch saved tuition IDs for this user */
  const { data: bookmarks = [], refetch: refetchBookmarks } = useQuery({
    queryKey: ['bookmarks-ids', user?.email],
    enabled: !!user,
    queryFn: async () => {
      const res = await axiosSecure.get('/bookmarks')
      return res.data.map(b => b.tuitionId)
    }
  })

  // Track which tuition IDs are currently being toggled (to show a spinner)
  const pendingRef = useRef(new Set())
  const [pendingSet, setPendingSet] = useState(new Set())

  const toggleBookmark = async (tuitionId, e) => {
    e.preventDefault()
    e.stopPropagation()   // prevent click from bubbling to any parent link/handler

    if (!user) { toast.error('Please log in to save tuitions'); return }
    if (pendingRef.current.has(tuitionId)) return  // already in-flight, ignore double-click

    // Mark as pending
    pendingRef.current.add(tuitionId)
    setPendingSet(new Set(pendingRef.current))

    try {
      if (bookmarks.includes(tuitionId)) {
        await axiosSecure.delete(`/bookmarks/${tuitionId}`)
        toast.success('Removed from saved')
      } else {
        await axiosSecure.post('/bookmarks', { tuitionId })
        toast.success('Saved to bookmarks!')
      }
      refetchBookmarks()
    } catch {
      toast.error('Could not update bookmark')
    } finally {
      pendingRef.current.delete(tuitionId)
      setPendingSet(new Set(pendingRef.current))
    }
  }

  const tuitions = data?.tuitions || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-base-200 font-sans text-base-content pb-20">

      {/* --- SEARCH & FILTER HERO --- */}
      <div className="bg-primary/5 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="mb-2 font-display text-4xl font-bold text-base-content md:text-5xl">
            Browse <span className="text-primary">Tuition</span> Jobs
          </h1>
          <p className="mb-8 text-sm text-base-content/60">
            {data?.total ? `${data.total} tuitions available` : 'Loading…'}
            {hasActiveFilters && <span className="ml-2 text-primary font-semibold">· Filters active</span>}
          </p>

          <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 rounded-2xl border border-base-300 bg-base-100 p-3 shadow-xl lg:flex-row">
            <div className="relative w-full flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="text"
                aria-label="Search tuitions"
                placeholder="Search by subject, class or location…"
                className="input input-bordered w-full bg-base-100 pl-12 text-base-content focus:border-primary focus:outline-none"
                onChange={(e) => setFilter('search', e.target.value)}
                value={search}
              />
            </div>

            <div className="flex w-full gap-3 lg:w-auto">
              <select
                aria-label="Filter by class"
                className="select select-bordered w-full bg-base-100 text-base-content md:w-44"
                onChange={(e) => setFilter('class', e.target.value)}
                value={filterClass}
              >
                <option value="">All Classes</option>
                <option value="O Level">O Level</option>
                <option value="A Level">A Level</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 8">Class 8</option>
              </select>

              <select
                aria-label="Sort tuitions"
                className="select select-bordered w-full bg-base-100 text-base-content md:w-44"
                onChange={(e) => setFilter('sort', e.target.value)}
                value={sort}
              >
                <option value="newest">Newest First</option>
                <option value="salary_desc">Highest Budget</option>
                <option value="salary_asc">Lowest Budget</option>
              </select>

              {hasActiveFilters && (
                <button
                  aria-label="Clear all filters"
                  onClick={clearFilters}
                  className="btn btn-ghost btn-circle text-error"
                  title="Clear filters"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- LISTING GRID --- */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            [...Array(limit)].map((_, i) => <SkeletonCard key={i} />)
          ) : (
            tuitions.map((item) => (
              <TuitionCard
                key={item._id}
                item={item}
                isSaved={bookmarks.includes(item._id)}
                isPending={pendingSet.has(item._id)}
                onBookmark={toggleBookmark}
              />
            ))
          )}
        </div>

        {!isLoading && tuitions.length === 0 && (
          <div className="mt-10 rounded-3xl border-2 border-dashed border-base-300 bg-base-100 py-20 text-center">
            <p className="text-xl font-bold text-base-content/50">No tuitions match your filters.</p>
            <button onClick={clearFilters} className="btn btn-link text-primary">Clear all filters</button>
          </div>
        )}

        {/* --- PAGINATION --- */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center">
            <div className="join border border-base-300 shadow-sm">
              <button className="join-item btn btn-md bg-base-100" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}><FaChevronLeft /></button>
              <button className="join-item btn btn-md btn-primary">Page {page} of {totalPages}</button>
              <button className="join-item btn btn-md bg-base-100" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}><FaChevronRight /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


/* ------------------------------------------------------------------ */
/*  FEATURE 3 – Save button is part of the card                        */
/* ------------------------------------------------------------------ */
const TuitionCard = ({ item, isSaved, isPending, onBookmark }) => {
  const coverImage = item.media?.length > 0
    ? item.media[0]
    : item.recruiterImage || '/images/study-notes.jpg';

  return (
    <div className="group flex flex-col h-full overflow-hidden rounded-3xl border border-base-300 bg-base-100 text-base-content shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

      {/* Image Section */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <img
          src={coverImage}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Multi-image indicator badge (if more than 1 image exists) */}
        {item.media?.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] flex items-center gap-1">
            <FaImage size={10} /> +{item.media.length - 1}
          </div>
        )}

        {/* Class Tag Overlay */}
        <div className="absolute top-3 left-3">
          <span className="bg-primary text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
            {item.class}
          </span>
        </div>

        {/* Save / Bookmark button */}
        <button
          onClick={(e) => onBookmark(item._id, e)}
          aria-label={isSaved ? 'Remove from saved' : 'Save this tuition'}
          disabled={isPending}
          className={`absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full shadow transition-all ${
            isPending
              ? 'bg-base-100/90 text-primary animate-pulse'
              : isSaved
                ? 'bg-primary text-white scale-110'
                : 'bg-base-100/90 text-base-content backdrop-blur-sm hover:bg-primary hover:text-white hover:scale-110'
          }`}
        >
          {isPending
            ? <span className="loading loading-spinner loading-xs" />
            : isSaved
              ? <FaBookmark size={12} />
              : <FaRegBookmark size={12} />}
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 line-clamp-1 font-display text-lg font-bold transition-colors group-hover:text-primary">
          {item.title || `${item.subject} Tutor Needed`}
        </h3>

        <p className="mb-4 line-clamp-2 h-8 text-xs italic leading-relaxed text-base-content/60">
          {item.description || 'Looking for an experienced tutor to help with core concepts and exam preparation.'}
        </p>

        <div className="mb-6 mt-auto space-y-2 text-sm font-medium">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-rose-400" size={12} />
            <span className="truncate text-xs">{item.location}</span>
          </div>
          <div className="flex items-center gap-2 border-t border-base-300 pt-2">
            <span className="text-lg font-bold text-base-content">
              ৳{item.budget} <span className="text-[10px] font-normal text-base-content/50">/mo</span>
            </span>
            <span className="ml-auto rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-primary">
              {item.class}
            </span>
          </div>
        </div>

        <Link
          to={`/tuition/${item._id}`}
          className="btn btn-primary btn-sm w-full rounded-xl font-bold text-white transition-all group-hover:shadow-lg"
        >
          View Details <FaArrowRight className="ml-1 transition-transform group-hover:translate-x-1" size={12} />
        </Link>
      </div>
    </div>
  );
};


const SkeletonCard = () => (
  <div className="flex h-[380px] animate-pulse flex-col overflow-hidden rounded-3xl border border-base-300 bg-base-100">
    {/* Image Area */}
    <div className="aspect-video bg-base-300"></div>

    {/* Content Area */}
    <div className="p-5 flex-1 flex flex-col">
      <div className="h-6 bg-base-300 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-base-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-base-200 rounded w-5/6 mb-4"></div>

      <div className="mt-auto space-y-3">
        <div className="h-3 bg-base-200 rounded w-1/2"></div>
        <div className="h-3 bg-base-200 rounded w-1/3"></div>
        <div className="h-10 bg-base-300 rounded-xl w-full mt-2"></div>
      </div>
    </div>
  </div>
)

export default Tuitions;