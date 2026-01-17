import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import {
  FaMapMarkerAlt, FaDollarSign, FaSearch, FaArrowRight,
  FaSortAmountDown, FaChevronLeft, FaChevronRight,
  FaStar, FaCalendarAlt
} from 'react-icons/fa'
import useAxiosSecure from '../../hooks/useAxiosSecure'

const Tuitions = () => {
  const axiosSecure = useAxiosSecure()
  const [search, setSearch] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const limit = 8 // Perfect for 4 cards per row (2 rows)

  // Reset page when filtering
  useEffect(() => { setPage(1); }, [search, filterClass, sort]);

  const { data, isLoading } = useQuery({
    queryKey: ['approved-tuitions', search, filterClass, sort, page],
    queryFn: async () => {
      const res = await axiosSecure.get(`/tuitions/status`, {
        params: { status: 'Approved', search, filterClass, sort, page, limit }
      })
      return res.data
    },
    keepPreviousData: true
  })

  const tuitions = data?.tuitions || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-base-100 font-sans text-gray-800 pb-20">

      {/* --- SEARCH & FILTER HERO --- */}
      <div className="bg-primary/5 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-8">
            Browse <span className="text-primary">Tuition</span> Jobs
          </h1>

        <div className="bg-white dark:bg-neutral-900 p-3 rounded-2xl shadow-xl max-w-5xl mx-auto flex flex-col lg:flex-row gap-3 items-center border border-gray-100 dark:border-neutral-800 transition-colors duration-300">
    
    {/* Search Input Container */}
    <div className="flex-1 w-full relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
            type="text"
            placeholder="Search by subject, title or area..."
            className="input input-bordered w-full pl-12 focus:border-primary bg-white dark:bg-neutral-800 dark:text-white dark:border-neutral-700 focus:outline-none"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
        />
    </div>

    {/* Filter Group */}
    <div className="flex w-full lg:w-auto gap-3">
        {/* Class Filter */}
        <select 
            className="select select-bordered w-full md:w-44 bg-white dark:bg-neutral-800 dark:text-white dark:border-neutral-700" 
            onChange={(e) => setFilterClass(e.target.value)} 
            value={filterClass}
        >
            <option value="" className="dark:bg-neutral-800">All Classes</option>
            <option value="O Level" className="dark:bg-neutral-800">O Level</option>
            <option value="A Level" className="dark:bg-neutral-800">A Level</option>
            <option value="Class 10" className="dark:bg-neutral-800">Class 10</option>
            <option value="Class 9" className="dark:bg-neutral-800">Class 9</option>
        </select>

        {/* Sort Filter */}
        <select 
            className="select select-bordered w-full md:w-44 bg-white dark:bg-neutral-800 dark:text-white dark:border-neutral-700" 
            onChange={(e) => setSort(e.target.value)} 
            value={sort}
        >
            <option value="newest" className="dark:bg-neutral-800">Newest First</option>
            <option value="salary_desc" className="dark:bg-neutral-800">Highest Budget</option>
            <option value="salary_asc" className="dark:bg-neutral-800">Lowest Budget</option>
        </select>
    </div>
</div>
        </div>
      </div>

      {/* --- LISTING GRID --- */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            // Skeleton Loader Grid (triggers while data is loading)
            [...Array(limit)].map((_, i) => <SkeletonCard key={i} />)
          ) : (
            tuitions.map((item) => <TuitionCard key={item._id} item={item} />)
          )}
        </div>

        {!isLoading && tuitions.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 mt-10">
            <p className="text-gray-400 font-bold text-xl">No tuition matches your current filters.</p>
            <button onClick={() => { setSearch(''); setFilterClass('') }} className="btn btn-link text-primary">Clear all filters</button>
          </div>
        )}

        {/* --- PAGINATION --- */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-16">
            <div className="join shadow-sm border border-base-200">
              <button className="join-item btn btn-md bg-white" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><FaChevronLeft /></button>
              <button className="join-item btn btn-md bg-primary text-white border-primary">Page {page} of {totalPages}</button>
              <button className="join-item btn btn-md bg-white" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><FaChevronRight /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


const TuitionCard = ({ item }) => {
  // Determine the cover image: Use the first image in the media array, 
  // fall back to recruiterImage, or a generic placeholder.
  const coverImage = item.media && item.media.length > 0
    ? item.media[0]
    : item.recruiterImage || "https://via.placeholder.com/400x225?text=No+Image+Available";

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full group">

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

        {/* Rating Overlay */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold text-yellow-600 shadow-sm">
          <FaStar size={10} /> 4.9
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-display font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {item.title || `${item.subject} Tutor Needed`}
        </h3>

        <p className="text-gray-500 text-xs mb-4 line-clamp-2 italic leading-relaxed h-[32px]">
          {item.description || "Looking for an experienced tutor to help with core concepts and exam preparation..."}
        </p>

        {/* Meta Info Grid */}
        <div className="space-y-2 mb-6 text-sm text-gray-600 font-medium">
          <div className="flex items-center gap-2">

            <span className="truncate text-xs">{item.location}</span>
          </div>
          <div className="flex items-center gap-2">

            <div className="flex items-center">
              <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                {item.postedDate ? (
                  new Date(item.postedDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })
                ) : (
                  "Just Now"
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-gray-50 mt-2">

            <span className="text-gray-900 font-bold text-lg">
              ৳{item.budget} <span className="text-[10px] text-gray-400 font-normal">/mo</span>
            </span>
          </div>
        </div>

        <Link
          to={`/tuition/${item._id}`}
          className="btn btn-primary btn-sm w-full rounded-xl text-white font-bold group-hover:shadow-lg transition-all"
        >
          View Details <FaArrowRight className="group-hover:translate-x-1 transition-transform ml-1" size={12} />
        </Link>
      </div>
    </div>
  );
};


/* --- SKELETON CARD (Exact same layout as TuitionCard) --- */
const SkeletonCard = () => (
  <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden h-[410px] flex flex-col animate-pulse">
    {/* Image Area */}
    <div className="aspect-video bg-gray-200"></div>

    {/* Content Area */}
    <div className="p-5 flex-1 flex flex-col">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-100 rounded w-5/6 mb-4"></div>

      <div className="mt-auto space-y-3">
        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
        <div className="h-3 bg-gray-100 rounded w-1/3"></div>
        <div className="h-10 bg-gray-200 rounded-xl w-full mt-2"></div>
      </div>
    </div>
  </div>
)

export default Tuitions;