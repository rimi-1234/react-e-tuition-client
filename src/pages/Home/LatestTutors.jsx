import React from 'react';
import { Link } from 'react-router'; // ✅ Correct import
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
    FaStar, FaMapMarkerAlt, FaChalkboardTeacher, 
    FaArrowRight, FaMoneyBillWave 
} from 'react-icons/fa';

import useAxiosSecure from '../../hooks/useAxiosSecure';

const LatestTutors = () => {
    const axiosPublic = useAxiosSecure();

    // --- Fetch Data ---
    const { data: tutors = [], isLoading } = useQuery({
        queryKey: ['latest-tutors-home'],
        queryFn: async () => {
            // Fetch top 6 tutors (sorted by rating or newest)
            const res = await axiosPublic.get('/tutors-post?limit=4&sort=rating');
            const data = res.data;
            // ✅ FIX: Must return the data
            return data; 
        }
    });

    return (
        <section className="py-24 px-6 bg-gray-50/50">
            <div className="max-w-7xl mx-auto">
                {/* --- Section Header --- */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-gray-200 pb-6">
                    <div className="max-w-2xl">
                        <span className="text-primary font-bold tracking-wider uppercase text-xs bg-primary/10 px-3 py-1 rounded-full">
                            Expert Mentors
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold font-display text-gray-900 mt-3">
                            Meet Our <span className="text-primary">Top Rated</span> Tutors
                        </h2>
                        <p className="text-gray-500 mt-2">
                            Connect with qualified instructors who have a proven track record of academic excellence.
                        </p>
                    </div>
                    
                    <Link to="/tutors">
                        <button className="hidden md:flex btn btn-ghost hover:bg-white gap-2 group font-bold">
                            View All Tutors <FaArrowRight className="group-hover:translate-x-1 transition-transform text-primary" />
                        </button>
                    </Link>
                </div>

                {/* --- Content Grid --- */}
                {isLoading ? (
                    <TutorListSkeleton />
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {tutors.map((tutor, index) => (
                            <HomeTutorCard key={tutor._id} tutor={tutor} index={index} />
                        ))}
                    </motion.div>
                )}

                {/* Mobile View All Button */}
                <div className="mt-8 text-center md:hidden">
                    <Link to="/tutors">
                        <button className="btn btn-outline btn-primary w-full rounded-lg">
                            View All Tutors <FaArrowRight />
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

// --- Homepage Specific Tutor Card (Clean Style - Matches Tutors Page) ---
const HomeTutorCard = ({ tutor, index }) => {
    // Safe Data Extraction (Handles different API field names if necessary)
    const {
        _id,
        name = tutor.tutorName || "Anonymous",
        image = tutor.tutorImage,
        subject = tutor.tuitionSubject || "General",
        location = tutor.tuitionLocation || "Online",
        experience = 0,
        salary = "Negotiable",
        rating = 5.0
    } = tutor;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -8, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
            className="card bg-white border border-gray-100 transition-all duration-300 h-full flex flex-col group overflow-hidden rounded-2xl"
        >
            <div className="p-5 flex flex-col h-full relative">
                
                {/* Top Decoration: Rating Badge */}
                <div className="absolute top-4 right-4 bg-amber-50 border border-amber-100 px-2 py-1 rounded-lg flex items-center gap-1">
                    <FaStar className="text-amber-400 text-xs" />
                    <span className="text-xs font-bold text-amber-700">{rating}</span>
                </div>

                {/* Avatar Section */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="avatar">
                        <div className="w-16 h-16 rounded-full ring-2 ring-offset-2 ring-gray-100 overflow-hidden group-hover:ring-primary transition-all">
                            <img 
                                src={image || "https://i.ibb.co/mJ9rwdJ/user.png"} 
                                alt={name} 
                                className="object-cover w-full h-full"
                                onError={(e) => { e.target.src = "https://placehold.co/150?text=No+Img"; }}
                            />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                            {name}
                        </h3>
                        <span className="text-xs font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                            {subject}
                        </span>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="space-y-3 pt-2 mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-gray-300" />
                            <span className="truncate max-w-[120px] text-xs font-medium">{location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded">
                             <FaChalkboardTeacher className="text-gray-400"/>
                             <span>{experience}+ Years</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <FaMoneyBillWave className="text-green-500" />
                        <span>{Number(salary).toLocaleString()} <span className="text-[10px] font-normal text-gray-400">BDT</span></span>
                    </div>
                </div>

                {/* Action Button */}
                <div className="mt-auto pt-2">
                    <Link to={`/tutor/${_id}`}>
                        <button className="btn btn-sm btn-ghost w-full bg-gray-50 hover:bg-primary hover:text-white group-hover:bg-primary group-hover:text-white transition-all border-none">
                            View Profile
                        </button>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

// --- Skeleton Loader ---
const TutorListSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card bg-white h-72 border border-gray-100 p-5 rounded-2xl">
                <div className="flex gap-4 items-center mb-6">
                    <div className="skeleton w-16 h-16 rounded-full"></div>
                    <div className="flex flex-col gap-2">
                        <div className="skeleton h-4 w-24"></div>
                        <div className="skeleton h-3 w-16"></div>
                    </div>
                </div>
                <div className="skeleton h-4 w-full mb-2"></div>
                <div className="skeleton h-4 w-2/3 mb-6"></div>
                <div className="skeleton h-10 w-full mt-auto rounded-lg"></div>
            </div>
        ))}
    </div>
);

export default LatestTutors;