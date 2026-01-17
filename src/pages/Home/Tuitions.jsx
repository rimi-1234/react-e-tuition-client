import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { 
  FaMapMarkerAlt, FaCalendarAlt, FaDollarSign, FaArrowRight, 
  FaStar, FaClock, FaChalkboardTeacher, FaUserGraduate 
} from 'react-icons/fa';
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
            {/* Browse <span className="text-primary">Tuition</span> Jobs */}
          </h1>
          
          <div className="bg-white p-3 rounded-2xl shadow-xl max-w-5xl mx-auto flex flex-col lg:flex-row gap-3 items-center border border-gray-100">
            <div className="flex-1 w-full relative">
               <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search by subject, title or area..." 
                 className="input input-bordered w-full pl-12 focus:border-primary"
                 onChange={(e) => setSearch(e.target.value)}
                 value={search}
               />
            </div>
            <div className="flex w-full lg:w-auto gap-3">
                <select className="select select-bordered w-full md:w-44" onChange={(e) => setFilterClass(e.target.value)} value={filterClass}>
                  <option value="">All Classes</option>
                  <option value="O Level">O Level</option>
                  <option value="A Level">A Level</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 9">Class 9</option>
                </select>
                <select className="select select-bordered w-full md:w-44" onChange={(e) => setSort(e.target.value)} value={sort}>
                    <option value="newest">Newest First</option>
                    <option value="salary_desc">Highest Budget</option>
                    <option value="salary_asc">Lowest Budget</option>
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
                <button onClick={() => {setSearch(''); setFilterClass('')}} className="btn btn-link text-primary">Clear all filters</button>
            </div>
        )}

        {/* --- PAGINATION --- */}
        {totalPages > 1 && (
            <div className="flex justify-center mt-16">
                <div className="join shadow-sm border border-base-200">
                    <button className="join-item btn btn-md bg-white" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}><FaChevronLeft/></button>
                    <button className="join-item btn btn-md bg-primary text-white border-primary">Page {page} of {totalPages}</button>
                    <button className="join-item btn btn-md bg-white" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}><FaChevronRight/></button>
                </div>
            </div>
        )}
      </div>
    </div>
  )
}

/* --- REUSABLE CARD COMPONENT --- */
const TuitionCard = ({ item }) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full group">
        
        {/* --- Top Visual Section --- */}
        <div className="relative aspect-video overflow-hidden bg-gray-100">
            <img 
                src={item.media?.[0] } 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            
            {/* Badges Overlay */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
                <span className="bg-primary/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                   {item.class}
                </span>
                {item.teachingMode && (
                   <span className="bg-white/90 backdrop-blur-md text-gray-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg border border-gray-100">
                    {item.teachingMode}
                   </span>
                )}
            </div>

            {/* Price Tag Overlay */}
            <div className="absolute bottom-3 right-3 bg-gray-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1 text-white shadow-xl border border-white/10">
                <span className="text-xs font-bold text-primary">৳</span>
                <span className="text-sm font-black tracking-tight">{item.budget}</span>
                <span className="text-[9px] opacity-60">/mo</span>
            </div>
        </div>

        {/* --- Content Section --- */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-display font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
              {item.subject}
            </h3>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                <FaStar size={10}/> 4.9
            </div>
          </div>
          
          <p className="text-gray-400 text-[11px] mb-5 line-clamp-2 leading-relaxed h-[32px]">
            {item.description || "Expert tutoring for academic excellence..."}
          </p>

          {/* Key Specifications Grid */}
          <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-6 border-t border-gray-50 pt-4">
              <div className="flex items-center gap-2 overflow-hidden">
                <FaMapMarkerAlt className="text-rose-400 shrink-0" size={12} />
                <span className="truncate text-[11px] font-semibold text-gray-600">{item.location}</span>
              </div>
              <div className="flex items-center gap-2 overflow-hidden">
                <FaClock className="text-sky-400 shrink-0" size={12} />
                <span className="truncate text-[11px] font-semibold text-gray-600">{item.schedule || 'Flexible'}</span>
              </div>
              <div className="flex items-center gap-2 overflow-hidden">
                <FaChalkboardTeacher className="text-emerald-400 shrink-0" size={12} />
                <span className="truncate text-[11px] font-semibold text-gray-600">{item.preferredTutor || 'Any'} Tutor</span>
              </div>
              <div className="flex items-center gap-2 overflow-hidden">
                <FaUserGraduate className="text-orange-400 shrink-0" size={12} />
                <span className="truncate text-[11px] font-semibold text-gray-600">{item.experienceNeeded || 'Student'}</span>
              </div>
          </div>
          
          {/* Action Footer */}
          <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
             <div className="flex items-center gap-2">
                <img src={item.recruiterImage} className="w-6 h-6 rounded-full object-cover" alt="" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{item.recruiterName?.split(' ')[0]}</span>
             </div>
             <Link 
                to={`/tuition/${item._id}`} 
                className="btn btn-primary btn-xs px-4 rounded-lg text-white font-bold hover:gap-3 transition-all"
              >
                Apply <FaArrowRight size={10} />
              </Link>
          </div>
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