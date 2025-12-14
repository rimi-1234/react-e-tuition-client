import { useState, useEffect, useMemo, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaMapMarkerAlt, FaSearch, FaFilter, FaStar, 
    FaMoneyBillWave, FaRegCalendarAlt, FaChalkboardTeacher, FaTimes 
} from 'react-icons/fa';
import useAxiosSecure from '../../hooks/useAxiosSecure'; 

// --- Constants (Easy to maintain) ---
const SUBJECT_OPTIONS = ['Math', 'English', 'Physics', 'Chemistry', 'Biology', 'ICT'];
const LOCATION_OPTIONS = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi'];
const ITEMS_PER_PAGE = 8;

const Tutors = () => {
    const axiosSecure = useAxiosSecure();
    
    // --- State ---
    const [search, setSearch] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [filterLocation, setFilterLocation] = useState('');
    const [page, setPage] = useState(1);

    // Reset page to 1 when any filter changes
    useEffect(() => { setPage(1); }, [search, filterSubject, filterLocation]);

    // --- Data Fetching ---
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['tutors', search, filterSubject, filterLocation, page],
        queryFn: async () => {
            const res = await axiosSecure.get(`/users/tutors`, {
                params: {
                    search,
                    subject: filterSubject,
                    location: filterLocation,
                    page,
                    limit: ITEMS_PER_PAGE
                }
            });
            return res.data;
        },
        keepPreviousData: true,
        staleTime: 5000, // Cache data for 5 seconds to prevent rapid refetching
    });

    const tutors = data?.tutors || [];
    const total = data?.total || 0;
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    const handleReset = () => {
        setSearch('');
        setFilterSubject('');
        setFilterLocation('');
    };

    // --- Animation ---
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* --- HERO SECTION --- */}
            <div className="bg-white border-b border-gray-200 pt-12 pb-16 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
                    >
                        Find Your Perfect <span className="text-primary">Tutor</span>
                    </motion.h1>
                    <p className="text-gray-500 max-w-2xl mx-auto mb-10">
                        Connect with experienced mentors who can help you excel in your studies.
                    </p>

                    {/* --- FILTERS BAR --- */}
                    <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex flex-col md:flex-row gap-4 max-w-5xl mx-auto z-10 relative">
                        {/* Search Input */}
                        <div className="relative flex-grow">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search by name..." 
                                className="input input-bordered w-full pl-10 pr-10 bg-gray-50 focus:bg-white transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <button 
                                    onClick={() => setSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>

                        {/* Dropdowns */}
                        <select 
                            className="select select-bordered w-full md:w-48 bg-gray-50 focus:bg-white"
                            value={filterSubject}
                            onChange={(e) => setFilterSubject(e.target.value)}
                            aria-label="Filter by Subject"
                        >
                            <option value="">All Subjects</option>
                            {SUBJECT_OPTIONS.map(sub => <option key={sub} value={sub.toLowerCase()}>{sub}</option>)}
                        </select>

                        <select 
                            className="select select-bordered w-full md:w-48 bg-gray-50 focus:bg-white"
                            value={filterLocation}
                            onChange={(e) => setFilterLocation(e.target.value)}
                            aria-label="Filter by Location"
                        >
                            <option value="">All Locations</option>
                            {LOCATION_OPTIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>

                        {/* Global Reset */}
                        {(search || filterSubject || filterLocation) && (
                            <button 
                                onClick={handleReset} 
                                className="btn btn-circle btn-ghost text-red-500 tooltip tooltip-bottom" 
                                data-tip="Clear All Filters"
                            >
                                <FaFilter />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {isLoading ? (
                    <TutorListSkeleton />
                ) : isError ? (
                    <div className="text-center py-20 bg-red-50 rounded-xl border border-red-100">
                        <p className="text-red-600 font-semibold">Failed to load tutors.</p>
                        <p className="text-sm text-red-400 mt-2">{error?.message || "Please check your connection."}</p>
                    </div>
                ) : (
                    <>
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                            key={`${page}-${search}-${filterSubject}`} // Force re-animation on filter change
                        >
                            <AnimatePresence mode="popLayout">
                                {tutors.map((tutor) => (
                                    <TutorCard key={tutor._id} tutor={tutor} />
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {/* Empty State */}
                        {tutors.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-300">
                                <div className="p-4 bg-gray-50 rounded-full mb-4">
                                    <FaChalkboardTeacher className="text-4xl text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-600">No tutors found</h3>
                                <p className="text-gray-400 mt-1">Try adjusting your search or filters.</p>
                                <button onClick={handleReset} className="btn btn-link text-primary mt-2">Clear Filters</button>
                            </div>
                        )}

                        {/* Pagination */}
                        {total > ITEMS_PER_PAGE && (
                            <div className="flex justify-center mt-16">
                                <div className="join shadow-sm border border-gray-100 bg-white">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => setPage(i + 1)} 
                                            className={`join-item btn btn-sm md:btn-md ${page === i + 1 ? 'btn-primary' : 'btn-ghost'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// --- Sub-Component: Skeleton Loader (Better UX) ---
const TutorListSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
            <div key={i} className="card bg-white h-96 shadow-sm border border-gray-100 animate-pulse">
                <div className="p-5 flex flex-col h-full gap-4">
                    <div className="flex justify-between">
                        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                        <div className="w-20 h-6 bg-gray-200 rounded"></div>
                    </div>
                    <div className="w-3/4 h-6 bg-gray-200 rounded mt-2"></div>
                    <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                    <div className="mt-auto space-y-2">
                         <div className="w-full h-4 bg-gray-200 rounded"></div>
                         <div className="w-full h-4 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

// --- Sub-Component: Professional Tutor Card ---
// Wrapped in 'memo' to prevent re-renders if props don't change
const TutorCard = memo(({ tutor }) => {
    // 1. Safe Data Extraction
    const {
        name = tutor.tutorName || "Anonymous Tutor",
        image = tutor.tutorImage,
        subject = tutor.tuitionSubject || "General Science",
        location = tutor.tuitionLocation || "Online",
        experience = 0,
        salary = tutor.expectedSalary || "Negotiable",
        status = "Pending",
        appliedDate
    } = tutor;

    // 2. Memoized Date Formatting (Prevents hydration errors and invalid date crashes)
    const formattedDate = useMemo(() => {
        const dateVal = tutor.date || appliedDate;
        if (!dateVal) return "N/A";
        try {
            return new Date(dateVal).toLocaleDateString("en-GB", {
                day: 'numeric', month: 'short', year: 'numeric'
            });
        } catch (e) {
            return "Invalid Date";
        }
    }, [tutor.date, appliedDate]);

    // 3. Status Logic
    const getStatusStyles = (statusStr) => {
        const s = statusStr?.toLowerCase();
        if (s === 'approved') return 'bg-green-100 text-green-700 border-green-200';
        if (s === 'rejected') return 'bg-red-100 text-red-700 border-red-200';
        return 'bg-amber-100 text-amber-700 border-amber-200'; // Pending
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="card bg-white border border-gray-100 transition-all duration-300 h-full flex flex-col group"
        >
            <div className="p-5 flex flex-col flex-grow">
                {/* Header: Avatar & Status */}
                <div className="flex justify-between items-start mb-4">
                    <div className="avatar">
                        <div className="w-16 h-16 rounded-full ring-2 ring-offset-2 ring-gray-100 overflow-hidden group-hover:ring-primary transition-all">
                            <img 
                                src={image || "https://placehold.co/150?text=Tutor"} 
                                alt={name} 
                                className="object-cover w-full h-full"
                                onError={(e) => { e.target.src = "https://placehold.co/150?text=No+Img"; }}
                            />
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyles(status)}`}>
                        {status}
                    </span>
                </div>

                {/* Main Info */}
                <div className="mb-4">
                    <h2 className="text-lg font-bold text-gray-800 leading-tight group-hover:text-primary transition-colors line-clamp-1" title={name}>
                        {name}
                    </h2>
                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-primary/5 text-primary border border-primary/10">
                        {subject}
                    </div>
                </div>

                {/* Details Grid */}
                <div className="mt-auto space-y-3 pt-4 border-t border-gray-50">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-gray-400" />
                            <span className="truncate max-w-[100px]">{location}</span>
                        </div>
                        {Number(experience) > 0 && (
                            <div className="flex items-center gap-1 text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-600">
                                <FaStar className="text-yellow-400" />
                                <span>{experience} Yrs</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <FaMoneyBillWave className="text-green-500" />
                        <span>{salary} <span className="text-xs font-normal text-gray-400">BDT</span></span>
                    </div>
                </div>
            </div>

            {/* Footer: Date Applied */}
            <div className="bg-gray-50/50 px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                    <FaRegCalendarAlt /> Applied
                </span>
                <span className="font-medium text-gray-600">{formattedDate}</span>
            </div>
        </motion.div>
    );
});

TutorCard.displayName = "TutorCard"; // Helpful for React DevTools debugging

export default Tutors;