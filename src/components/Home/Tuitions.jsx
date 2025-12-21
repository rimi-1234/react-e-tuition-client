import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { FaMapMarkerAlt, FaDollarSign, FaSearch, FaArrowRight, FaSortAmountDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import useAxiosSecure from '../../hooks/useAxiosSecure'

const Tuitions = () => {
  const axiosSecure = useAxiosSecure() 
  
  // --- States ---
  const [search, setSearch] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1) // Current Page
  const limit = 6 // Items per page

  // --- Reset Page on Filter Change ---
  // If user searches/filters, we must jump back to Page 1
  useEffect(() => {
    setPage(1);
  }, [search, filterClass, sort]);

  // --- Fetch Data ---
  const { data, isLoading, isError } = useQuery({
    queryKey: ['approved-tuitions', search, filterClass, sort, page],
    queryFn: async () => {
      const res = await axiosSecure.get(`/tuitions/status`, {
          params: {
              status: 'Approved',
              search,
              filterClass,
              sort,
              page,
              limit
          }
      })
      return res.data // Expecting: { tuitions: [], total: 0 }
    },
    keepPreviousData: true // Smooth transition between pages
  })

  // Destructure data safely
  const tuitions = data?.tuitions || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // --- Pagination Handlers ---
  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  }

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  }

  return (
    <div className="min-h-screen bg-base-100 font-sans text-gray-800">
      
      {/* --- HERO SECTION --- */}
      <div className="bg-primary/5 py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h4 className="text-primary font-bold uppercase tracking-widest text-sm mb-3">Find Your Job</h4>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-gray-900 mb-6">
            Browse Available <span className="text-primary">Tuitions</span>
          </h1>
          
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-xl max-w-5xl mx-auto flex flex-col lg:flex-row gap-4 items-center border border-gray-100">
            
            {/* Search Input */}
            <div className="flex-1 w-full relative">
               <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search by subject or location..." 
                 className="input input-bordered w-full pl-12 focus:outline-none focus:border-primary"
                 onChange={(e) => setSearch(e.target.value)}
                 value={search}
               />
            </div>

            <div className="flex w-full lg:w-auto gap-4">
                
                {/* --- UPDATED CLASS FILTER --- */}
                <select 
                  className="select select-bordered w-full md:w-48 font-urbanist"
                  onChange={(e) => setFilterClass(e.target.value)}
                  value={filterClass}
                >
                  <option value="">All Classes</option>
                  <option value="Class 6">Class 6</option>
                  <option value="Class 7">Class 7</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="SSC / Class 10">SSC / Class 10</option>
                  <option value="HSC 1st Year">HSC 1st Year</option>
                  <option value="HSC 2nd Year">HSC 2nd Year</option>
                  <option value="O Level">O Level</option>
                  <option value="A Level">A Level</option>
                </select>

                {/* Sort Dropdown */}
                <div className="relative w-full md:w-48">
                    <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none"/>
                    <select 
                        className="select select-bordered w-full pl-10 font-urbanist"
                        onChange={(e) => setSort(e.target.value)}
                        value={sort}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="salary_desc">Budget: High to Low</option>
                        <option value="salary_asc">Budget: Low to High</option>
                    </select>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- LISTING GRID --- */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        
        {isLoading ? (
           <div className="flex justify-center py-20">
              <span className="loading loading-spinner loading-lg text-primary"></span>
           </div>
        ) : (
          <>
             {/* Results Count */}
             <div className="mb-8 font-bold text-gray-500 font-urbanist flex justify-between items-center">
                <span>
                    Showing {tuitions.length} of {total} available jobs
                    {total > 0 && <span className="ml-2 text-xs font-normal text-gray-400">(Page {page} of {totalPages})</span>}
                </span>

                {(search || filterClass || sort !== 'newest') && (
                    <button 
                        onClick={() => {setSearch(''); setFilterClass(''); setSort('newest')}}
                        className="text-primary text-sm underline hover:text-primary-focus"
                    >
                        Reset Filters
                    </button>
                )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {tuitions.map((item) => (
                 <TuitionCard key={item._id} item={item} />
               ))}
             </div>

             {/* Empty State */}
             {tuitions.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                   <h3 className="text-xl font-bold text-gray-400">No tuitions found.</h3>
                   <p className="text-gray-400 mt-2">Try adjusting your search or filters.</p>
                </div>
             )}

             {/* --- PAGINATION CONTROLS --- */}
             {/* {total > limit && ( */}
                <div className="flex justify-center mt-12">
                    <div className="join shadow-sm border border-base-200">
                        <button 
                            className="join-item btn btn-md bg-white hover:bg-gray-100" 
                            onClick={handlePrev} 
                            disabled={page === 1}
                        >
                            <FaChevronLeft />
                        </button>
                        
                        {/* Generate Page Numbers */}
                        {[...Array(totalPages)].map((_, index) => {
                            const pageNum = index + 1;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={`join-item btn btn-md ${page === pageNum ? 'btn-primary text-white' : 'bg-white hover:bg-gray-100'}`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button 
                            className="join-item btn btn-md bg-white hover:bg-gray-100" 
                            onClick={handleNext} 
                            disabled={page === totalPages}
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                </div>
             {/* )} */}
          </>
        )}
      </div>

    </div>
  )
}

/* --- REUSABLE CARD COMPONENT --- */
const TuitionCard = ({ item }) => {
  const gradients = [
    "from-purple-500 to-indigo-600",
    "from-blue-500 to-cyan-600",
    "from-orange-500 to-red-600",
    "from-emerald-500 to-teal-600"
  ];
  const gradientIndex = item._id ? item._id.charCodeAt(item._id.length - 1) % gradients.length : 0;
  const selectedGradient = gradients[gradientIndex];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
       
       <div className={`h-28 bg-gradient-to-r ${selectedGradient} relative p-5 flex flex-col justify-between`}>
          <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold w-fit border border-white/30">
             {item.class}
          </span>
          <h3 className="text-xl font-display font-bold text-white tracking-wide truncate">
             {item.subject}
          </h3>
       </div>

       <div className="p-5 flex-1 flex flex-col">
          <div className="space-y-3 mb-6">
             <div className="flex items-center gap-3 text-gray-600">
                <FaMapMarkerAlt className="text-secondary" />
                <span className="font-urbanist font-medium text-sm truncate">{item.location}</span>
             </div>
             <div className="flex items-center gap-3 text-gray-600">
                <FaDollarSign className="text-primary" />
                <span className="font-display font-bold text-gray-800 text-lg">
                    ৳{item.budget} <span className="text-xs font-normal text-gray-400">/mo</span>
                </span>
             </div>
          </div>
          
          <Link 
             to={`/tuition/${item._id}`} 
             className="btn btn-outline btn-primary btn-sm w-full mt-auto font-urbanist"
          >
             View Details <FaArrowRight />
          </Link>
       </div>
    </div>
  )
}

export default Tuitions