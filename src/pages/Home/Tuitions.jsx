import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom' 
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaMapMarkerAlt, FaDollarSign, FaSearch, FaArrowRight, 
  FaFilter 
} from 'react-icons/fa'
import useAxiosSecure from '../../hooks/useAxiosSecure'

const Tuitions = () => {
  const axiosSecure = useAxiosSecure() 
  
  // --- STATE ---
  const [page, setPage] = useState(1)
  const limit = 8 
  
  const [search, setSearch] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [filterSubject, setFilterSubject] = useState('')   
  const [filterLocation, setFilterLocation] = useState('') 
  const [sort, setSort] = useState('newest')

  // --- EFFECT: Reset to Page 1 on Filter Change ---
  useEffect(() => {
    setPage(1);
  }, [search, filterClass, filterSubject, filterLocation, sort]);

  // --- EFFECT: Scroll Top on Page Change ---
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  // --- DATA FETCHING ---
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

  // --- DERIVED VARIABLES ---
  const tuitions = data?.tuitions || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // --- CUSTOM PAGINATION LOGIC ---
  const getPageNumbers = () => {
    // If no pages or 1 page, return [1]
    if (totalPages <= 1) return [1];

    if (totalPages <= 10) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages = [1];
    const siblingCount = 2; 
    let start = Math.max(2, page - siblingCount);
    let end = Math.min(totalPages - 1, page + siblingCount);

    if (page <= siblingCount + 2) end = 5 + siblingCount; 
    if (page >= totalPages - (siblingCount + 1)) start = totalPages - (4 + siblingCount);
    
    start = Math.max(2, start);
    end = Math.min(totalPages - 1, end);

    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('...');
    
    pages.push(totalPages);
    return pages;
  };

  // --- ANIMATION ---
  const containerVariants = { show: { transition: { staggerChildren: 0.1 } } }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  }

  const handleReset = () => {
      setSearch(''); setSort('newest');
  }

  return (
    <div className="min-h-screen bg-base-100 font-sans text-gray-800 pb-20">
      
      {/* HEADER */}
      <div className="bg-primary/5 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
             <h1 className="text-4xl font-bold font-display text-gray-900">Browse <span className="text-primary">Tuitions</span></h1>
             <div className="mt-8 bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex flex-col md:flex-row gap-3 max-w-4xl mx-auto">
                 <div className="relative flex-1">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input 
                        className="input input-bordered w-full pl-10 focus:outline-none focus:border-primary" 
                        placeholder="Search subject or location..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                    />
                 </div>
                 <select className="select select-bordered" onChange={(e) => setSort(e.target.value)} value={sort}>
                    <option value="newest">Newest</option>
                    <option value="salary_desc">Budget: High-Low</option>
                    <option value="salary_asc">Budget: Low-High</option>
                 </select>
             </div>
        </div>
      </div>

      {/* RESULTS */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {isLoading ? (
           <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>
        ) : (
          <>
             <div className="flex justify-between items-center mb-6 px-2">
                <span className="text-gray-500 font-bold">Found {total} jobs</span>
                {(search || sort !== 'newest') && (
                    <button onClick={handleReset} className="text-primary text-sm underline flex items-center gap-1">
                        <FaFilter/> Reset Filters
                    </button>
                )}
             </div>

             <motion.div 
               variants={containerVariants}
               initial="hidden" animate="show"
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[400px]"
               key={page} 
             >
               <AnimatePresence mode='popLayout'>
                 {tuitions.map((item) => (
                   <TuitionCard key={item._id} item={item} variants={itemVariants} />
                 ))}
               </AnimatePresence>
             </motion.div>

             {tuitions.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl mt-4">
                    <p className="text-gray-400 font-bold text-lg">No results found.</p>
                </div>
             )}
             {
              console.log(total)
              
             }
             {/* ✅ PAGINATION START */}
             {/* Show if we have ANY results (total > 0) */}
             {/* {total > 0 && ( */}
               <div className="flex justify-center mt-16 font-sans">
                 <div className="join border border-gray-300 rounded-md shadow-sm bg-white">
                   
                   {/* PREV BUTTON */}
                   <button 
                     onClick={() => setPage(old => Math.max(old - 1, 1))}
                     disabled={page === 1}
                     className="join-item btn btn-md bg-white hover:bg-gray-50 text-gray-600 border-r border-gray-300 px-4 font-medium disabled:bg-white disabled:text-gray-300 rounded-none"
                   >
                     PREV
                   </button>

                   {/* PAGE NUMBERS */}
                   {getPageNumbers().map((number, index) => {
                     if (number === "...") {
                       return (
                         <button 
                           key={`dots-${index}`} 
                           className="join-item btn btn-md bg-white border-r border-gray-300 text-gray-400 cursor-default rounded-none pointer-events-none"
                         >
                           ...
                         </button>
                       );
                     }

                     return (
                       <button
                         key={number}
                         onClick={() => setPage(number)}
                         className={`join-item btn btn-md border-r border-gray-300 rounded-none transition-colors px-4 ${
                           page === number 
                             ? 'bg-blue-500 text-white border-blue-500' 
                             : 'bg-white text-gray-600 hover:bg-gray-100'
                         }`}
                       >
                         {number}
                       </button>
                     );
                   })}

                   {/* NEXT BUTTON */}
                   <button 
                     onClick={() => setPage(old => Math.min(old + 1, totalPages))}
                     disabled={page === totalPages || totalPages === 0}
                     className="join-item btn btn-md bg-white hover:bg-gray-50 text-gray-600 border-l border-gray-300 px-4 font-medium disabled:bg-white disabled:text-gray-300 rounded-none"
                   >
                     NEXT
                   </button>

                 </div>
               </div>
             {/* )} */}
             {/* ✅ PAGINATION END */}

          </>
        )}
      </div>
    </div>
  )
}

/* --- REUSABLE CARD --- */
const TuitionCard = ({ item, variants }) => {
    const gradients = ["from-purple-500 to-indigo-600", "from-blue-500 to-cyan-600", "from-orange-500 to-red-600", "from-emerald-500 to-teal-600"];
    const gradientIndex = item._id ? item._id.charCodeAt(item._id.length - 1) % gradients.length : 0;
    
    return (
      <motion.div 
        layout
        variants={variants}
        initial="hidden"
        animate="show"
        exit="exit"
        whileHover={{ y: -5, transition: { duration: 0.2 } }} 
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full"
      >
         <div className={`h-24 bg-gradient-to-r ${gradients[gradientIndex]} p-4 flex flex-col justify-between relative overflow-hidden`}>
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>
            <span className="bg-white/20 backdrop-blur-md text-white px-3 py-0.5 rounded-full text-xs font-bold w-fit border border-white/30">{item.class}</span>
            <h3 className="text-lg font-display font-bold text-white tracking-wide truncate">{item.subject}</h3>
         </div>
         
         <div className="p-5 flex-1 flex flex-col">
            <div className="space-y-3 mb-6">
               <div className="flex items-center gap-3 text-gray-500 text-sm">
                   <FaMapMarkerAlt className="text-secondary/80" />
                   <span className="truncate">{item.location}</span>
               </div>
               <div className="flex items-center gap-3">
                   <FaDollarSign className="text-primary" />
                   <span className="font-bold text-gray-800 text-lg">৳{item.budget}</span>
               </div>
            </div>
            <Link to={`/tuition/${item._id}`} className="btn btn-outline btn-primary btn-sm w-full mt-auto rounded-lg group">
              View Details <FaArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
         </div>
      </motion.div>
    )
}

export default Tuitions