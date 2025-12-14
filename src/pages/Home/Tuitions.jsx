import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion' // Import Framer Motion
import { 
  FaMapMarkerAlt, FaDollarSign, FaSearch, FaArrowRight, 
  FaSortAmountDown, FaFilter, FaChevronLeft, FaChevronRight 
} from 'react-icons/fa'
import useAxiosSecure from '../../hooks/useAxiosSecure'

const Tuitions = () => {
  const axiosSecure = useAxiosSecure() 
  
  // --- States for Filters ---
  const [search, setSearch] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [filterSubject, setFilterSubject] = useState('')   
  const [filterLocation, setFilterLocation] = useState('') 
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const limit = 8

  // --- Reset Page on Any Filter Change ---
  useEffect(() => {
    setPage(1);
  }, [search, filterClass, filterSubject, filterLocation, sort]);

  // --- Fetch Data ---
  const { data, isLoading } = useQuery({
    queryKey: ['approved-tuitions', search, filterClass, filterSubject, filterLocation, sort, page],
    queryFn: async () => {
      const res = await axiosSecure.get(`/tuitions/status`, {
          params: {
              status: 'Approved',
              search,
              filterClass,
              filterSubject,
              filterLocation,
              sort,
              page,
              limit
          }
      })
      return res.data
    },
    keepPreviousData: true
  })

  const tuitions = data?.tuitions || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // --- Reset Handler ---
  const handleReset = () => {
      setSearch('');
      setFilterClass('');
      setFilterSubject('');
      setFilterLocation('');
      setSort('newest');
  }

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1 // Delay between each card appearing
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50 } }
  }

  return (
    <div className="min-h-screen bg-base-100 font-sans text-gray-800">
      
      {/* --- HERO / FILTER SECTION --- */}
      <div className="bg-primary/5 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
              <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900">
                Browse <span className="text-primary">Tuitions</span>
              </h1>
              <p className="text-gray-500 mt-2">Find the perfect tuition job that matches your skills.</p>
          </motion.div>
          
          {/* --- FILTER BAR --- */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col gap-4"
          >
            
            {/* Top Row: Search */}
            <div className="relative w-full">
               <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search by keyword (e.g. 'Urgent English Tutor')..." 
                 className="input input-bordered w-full pl-12 focus:outline-none focus:border-primary"
                 onChange={(e) => setSearch(e.target.value)}
                 value={search}
               />
            </div>

            {/* Bottom Row: Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Class Filter */}
                <select 
                  className="select select-bordered w-full font-urbanist"
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

                {/* 2. Subject Filter */}
                <select 
                  className="select select-bordered w-full font-urbanist"
                  onChange={(e) => setFilterSubject(e.target.value)}
                  value={filterSubject}
                >
                  <option value="">All Subjects</option>
                  <option value="Bangla">Bangla</option>
                  <option value="English">English</option>
                  <option value="Math">Math</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Higher Math">Higher Math</option>
                  <option value="ICT">ICT</option>
                  <option value="All Subjects">All Subjects</option>
                </select>

                {/* 3. Location Filter */}
                <select 
                  className="select select-bordered w-full font-urbanist"
                  onChange={(e) => setFilterLocation(e.target.value)}
                  value={filterLocation}
                >
                  <option value="">All Locations</option>
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chittagong">Chittagong</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Barisal">Barisal</option>
                  <option value="Rangpur">Rangpur</option>
                  <option value="Mymensingh">Mymensingh</option>
                </select>

                {/* 4. Sort */}
                <div className="relative w-full">
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
          </motion.div>
        </div>
      </div>

      {/* --- RESULTS GRID --- */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {isLoading ? (
           <div className="flex justify-center py-20">
              <span className="loading loading-spinner loading-lg text-primary"></span>
           </div>
        ) : (
          <>
             <div className="mb-8 font-bold text-gray-500 font-urbanist flex justify-between items-center">
                <span>
                    Showing {tuitions.length} of {total} jobs
                    {total > 0 && <span className="ml-2 text-xs font-normal text-gray-400">(Page {page} of {totalPages})</span>}
                </span>

                {(search || filterClass || filterSubject || filterLocation || sort !== 'newest') && (
                    <button 
                        onClick={handleReset}
                        className="text-primary text-sm underline hover:text-primary-focus flex items-center gap-1"
                    >
                        <FaFilter/> Reset Filters
                    </button>
                )}
             </div>

             {/* ANIMATED GRID CONTAINER */}
             <motion.div 
               variants={containerVariants}
               initial="hidden"
               animate="show"
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
               key={page + sort + search + filterClass} // Re-trigger animation on filter change
             >
               <AnimatePresence mode='wait'>
                 {tuitions.map((item) => (
                   <TuitionCard key={item._id} item={item} variants={itemVariants} />
                 ))}
               </AnimatePresence>
             </motion.div>

             {tuitions.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50"
                >
                   <h3 className="text-xl font-bold text-gray-400">No tuitions found.</h3>
                   <p className="text-gray-400 mt-2">Try adjusting your filters.</p>
                   <button onClick={handleReset} className="btn btn-sm btn-outline mt-4">Clear All Filters</button>
                </motion.div>
             )}

             {/* Pagination */}
             {total > limit && (
                <div className="flex justify-center mt-12">
                    <div className="join shadow-sm border border-base-200">
                        <button className="join-item btn btn-md bg-white hover:bg-gray-100" onClick={() => page > 1 && setPage(page - 1)} disabled={page === 1}><FaChevronLeft /></button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button key={i} onClick={() => setPage(i + 1)} className={`join-item btn btn-md ${page === i + 1 ? 'btn-primary text-white' : 'bg-white hover:bg-gray-100'}`}>{i + 1}</button>
                        ))}
                        <button className="join-item btn btn-md bg-white hover:bg-gray-100" onClick={() => page < totalPages && setPage(page + 1)} disabled={page === totalPages}><FaChevronRight /></button>
                    </div>
                </div>
             )}
          </>
        )}
      </div>
    </div>
  )
}

/* --- REUSABLE ANIMATED CARD --- */
const TuitionCard = ({ item, variants }) => {
  const gradients = ["from-purple-500 to-indigo-600", "from-blue-500 to-cyan-600", "from-orange-500 to-red-600", "from-emerald-500 to-teal-600"];
  const gradientIndex = item._id ? item._id.charCodeAt(item._id.length - 1) % gradients.length : 0;
  
  return (
    <motion.div 
      variants={variants}
      whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }} // Smooth hover lift
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 group flex flex-col h-full"
    >
       <div className={`h-28 bg-gradient-to-r ${gradients[gradientIndex]} relative p-5 flex flex-col justify-between`}>
          <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold w-fit border border-white/30">{item.class}</span>
          <h3 className="text-xl font-display font-bold text-white tracking-wide truncate">{item.subject}</h3>
       </div>
       <div className="p-5 flex-1 flex flex-col">
          <div className="space-y-3 mb-6">
             <div className="flex items-center gap-3 text-gray-600"><FaMapMarkerAlt className="text-secondary" /><span className="font-urbanist font-medium text-sm truncate">{item.location}</span></div>
             <div className="flex items-center gap-3 text-gray-600"><FaDollarSign className="text-primary" /><span className="font-display font-bold text-gray-800 text-lg">৳{item.budget} <span className="text-xs font-normal text-gray-400">/mo</span></span></div>
          </div>
          <Link to={`/tuition/${item._id}`} className="btn btn-outline btn-primary btn-sm w-full mt-auto font-urbanist">
            View Details <FaArrowRight className="ml-1" />
          </Link>
       </div>
    </motion.div>
  )
}

export default Tuitions