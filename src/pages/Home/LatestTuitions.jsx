import React, { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaArrowRight, FaMapMarkerAlt, FaDollarSign, 
    FaChalkboardTeacher, FaCalendarAlt, FaFilter 
} from 'react-icons/fa';

const LatestTuitions = ({ tuitions = [], loading = false }) => {
    const [activeCategory, setActiveCategory] = useState('All');

    // --- DYNAMIC CATEGORY LOGIC ---
    const categories = useMemo(() => {
        if (loading || !tuitions.length) return ["All"];

        // 1. Extract all subjects
        const allSubjects = tuitions.map(item => item.subject);
        
        // 2. Normalize (Capitalize first letter to handle 'math' vs 'Math')
        const formattedSubjects = allSubjects.map(sub => 
            sub ? sub.charAt(0).toUpperCase() + sub.slice(1).toLowerCase() : ""
        );

        // 3. Remove duplicates using Set and filter out empty strings
        const uniqueSubjects = [...new Set(formattedSubjects)].filter(Boolean);

        // 4. Return "All" + unique subjects (Limit to top 6 to keep UI clean if needed)
        return ["All", ...uniqueSubjects.slice(0, 7)]; 
    }, [tuitions, loading]);

    // --- FILTER LOGIC ---
    const filteredTuitions = useMemo(() => {
        if (activeCategory === 'All') return tuitions;

        return tuitions.filter(item => {
            // Check if subject matches or class matches
            const subjectMatch = item.subject?.toLowerCase().includes(activeCategory.toLowerCase());
            const classMatch = item.class?.toLowerCase().includes(activeCategory.toLowerCase());
            return subjectMatch || classMatch;
        });
    }, [activeCategory, tuitions]);

    return (
        <section className="py-24 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                {/* --- Section Header --- */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-100 pb-6">
                    <div>
                        <span className="badge badge-primary badge-outline mb-2 font-bold px-3 py-3">
                            New Opportunities
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold font-display text-gray-900">
                            Latest Tuition Jobs
                        </h2>
                    </div>
                    <Link to="/tuitions">
                        <button className="btn btn-ghost hover:bg-base-200 gap-2 mt-4 md:mt-0 group font-bold">
                            View All Jobs <FaArrowRight className="group-hover:translate-x-1 transition-transform text-primary" />
                        </button>
                    </Link>
                </div>

                {/* --- Dynamic Category Nav Bar --- */}
                {/* Only show filter if we have data */}
                {!loading && categories.length > 1 && (
                    <div className="mb-10 flex flex-wrap gap-3 items-center">
                        <div className="mr-2 text-gray-400 flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                            <FaFilter /> Filter:
                        </div>
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 border ${
                                    activeCategory === category
                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/30 transform scale-105"
                                        : "bg-white text-gray-500 border-gray-200 hover:border-primary/50 hover:text-primary"
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                )}

                {/* --- Content Grid --- */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex flex-col gap-4 border border-gray-100 p-4 rounded-2xl">
                                <div className="skeleton h-32 w-full rounded-xl"></div>
                                <div className="skeleton h-4 w-24"></div>
                                <div className="skeleton h-4 w-full"></div>
                                <div className="skeleton h-10 w-full rounded-lg mt-auto"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <motion.div 
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        <AnimatePresence mode='popLayout'>
                            {filteredTuitions.length > 0 ? (
                                filteredTuitions.slice(0, 8).map((post, index) => (
                                    <HomeTuitionCard key={post._id} item={post} index={index} />
                                ))
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }}
                                    className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200"
                                >
                                    <FaChalkboardTeacher className="mx-auto text-4xl mb-3 opacity-20" />
                                    <p>No tuitions found for "{activeCategory}"</p>
                                    <button 
                                        onClick={() => setActiveCategory('All')}
                                        className="text-primary text-sm font-bold mt-2 hover:underline"
                                    >
                                        Clear Filter
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </section>
    );
};

// --- Premium Card Component ---
const HomeTuitionCard = ({ item, index }) => {
    const gradients = [
        "from-purple-600 to-indigo-500",
        "from-blue-600 to-cyan-500",
        "from-emerald-500 to-teal-600",
        "from-rose-500 to-orange-500"
    ];
    // Use ID for consistent gradient, fallback to index
    const gradientIndex = item._id ? item._id.charCodeAt(item._id.length - 1) : index;
    const selectedGradient = gradients[gradientIndex % gradients.length];

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -5 }}
            className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
        >
            {/* Header */}
            <div className={`h-28 bg-gradient-to-br ${selectedGradient} p-5 relative flex flex-col justify-between`}>
                <div className="absolute top-2 right-2 opacity-10">
                    <FaChalkboardTeacher className="text-5xl text-white" />
                </div>
                <div className="flex justify-between items-start z-10">
                    <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                        Class {item.class}
                    </span>
                    <span className="text-white/90 text-[10px] font-mono flex items-center gap-1">
                         <FaCalendarAlt /> {item.postedDate ? new Date(item.postedDate).toLocaleDateString(undefined, { month:'short', day:'numeric'}) : 'New'}
                    </span>
                </div>
                <h3 className="text-lg font-display font-bold text-white tracking-wide truncate drop-shadow-sm z-10 mt-1">
                    {item.subject}
                </h3>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 flex flex-col">
                <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-2">
                        <div className="mt-1 min-w-[16px] text-gray-400 text-xs">
                            <FaMapMarkerAlt />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Location</p>
                            <p className="text-xs font-medium text-gray-700 line-clamp-2">{item.location}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="min-w-[16px] text-primary text-sm">
                            <FaDollarSign />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Budget</p>
                            <p className="text-base font-bold text-gray-900">
                                ৳{Number(item.salary || item.budget).toLocaleString()} 
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-3 border-t border-gray-50">
                    <Link to={`/tuition/${item._id}`}>
                        <button className="btn btn-outline btn-primary btn-xs sm:btn-sm w-full rounded-lg hover:bg-primary hover:text-white transition-colors">
                            Details <FaArrowRight className="ml-1" />
                        </button>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default LatestTuitions;