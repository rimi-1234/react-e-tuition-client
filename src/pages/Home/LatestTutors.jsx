import React, { useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
    FaStar, FaMapMarkerAlt, FaChalkboardTeacher, 
    FaArrowRight, FaMoneyBillWave 
} from 'react-icons/fa';
import useAxiosSecure from '../../hooks/useAxiosSecure';

const LatestTutors = () => {
    const axiosPublic = useAxiosSecure();
    const [selectedCategory, setSelectedCategory] = useState("All");

    // ✅ 1. Fetch Categories Dynamically
    const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
        queryKey: ['tutor-categories'],
        queryFn: async () => {
            const res = await axiosPublic.get('/tutor-categories');
            // Merge "All" with the fetched categories
            return ["All", ...res.data];
        }
    });

    // ✅ 2. Fetch Tutors (Filtered by Category)
    const { data: tutors = [], isLoading: isTutorsLoading } = useQuery({
        queryKey: ['latest-tutors-home', selectedCategory], 
        queryFn: async () => {
            let url = `/tutors-post?limit=4&sort=experience`;
            if (selectedCategory !== "All") {
                url += `&subject=${selectedCategory}`;
            }
            const res = await axiosPublic.get(url);
            return res.data; 
        }
    });

    return (
        <section className="py-24 px-6 bg-gray-50/50">
            <div className="max-w-7xl mx-auto">
                {/* --- Header Section --- */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-200 pb-6">
                    <div className="max-w-2xl">
                        <span className="text-primary font-bold tracking-wider uppercase text-xs bg-primary/10 px-3 py-1 rounded-full">
                            Expert Mentors
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold font-display text-gray-900 mt-3">
                            Meet Our <span className="text-primary">Top Experienced</span> Tutors
                        </h2>
                        <p className="text-gray-500 mt-2">
                            Connect with qualified instructors who have a proven track record.
                        </p>
                    </div>
                    
                    <Link to="/tutors">
                        <button className="hidden md:flex btn btn-ghost hover:bg-white gap-2 group font-bold">
                            View All Tutors <FaArrowRight className="group-hover:translate-x-1 transition-transform text-primary" />
                        </button>
                    </Link>
                </div>

                {/* --- ✅ Dynamic Category Filter Navbar --- */}
                <div className="flex flex-wrap gap-3 mb-10">
                    {isCategoriesLoading ? (
                        // Simple Skeleton for categories
                        [1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                        ))
                    ) : (
                        categories.map((item) => (
                            <button
                                key={item}
                                onClick={() => setSelectedCategory(item)}
                                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${
                                    selectedCategory === item
                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/30"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                                }`}
                            >
                                {item}
                            </button>
                        ))
                    )}
                </div>

                {/* --- Grid Section --- */}
                {isTutorsLoading ? (
                    <TutorListSkeleton />
                ) : (
                    <motion.div 
                        layout 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {tutors.length > 0 ? (
                            tutors.map((tutor, index) => (
                                <HomeTutorCard key={tutor._id} tutor={tutor} index={index} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-bold text-gray-900">No Tutors Found</h3>
                                <p className="text-gray-400 mt-2">We couldn't find any tutors for <span className="text-primary font-bold">{selectedCategory}</span>.</p>
                                <button onClick={() => setSelectedCategory("All")} className="mt-4 btn btn-link text-primary">View All Categories</button>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </section>
    );
};

// --- Card Component ---
const HomeTutorCard = ({ tutor, index }) => {
    const {
        tutorName,       
        tutorImage,      
        tuitionSubject,  
        tuitionLocation, 
        experience,      
        expectedSalary,  
    } = tutor;

    const rating = 4.8; 

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="card bg-white border border-gray-100 transition-all duration-300 h-full flex flex-col group overflow-hidden rounded-2xl hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-2"
        >
            <div className="p-5 flex flex-col h-full relative">
                <div className="absolute top-4 right-4 bg-amber-50 border border-amber-100 px-2 py-1 rounded-lg flex items-center gap-1">
                    <FaStar className="text-amber-400 text-xs" />
                    <span className="text-xs font-bold text-amber-700">{rating}</span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                    <div className="avatar">
                        <div className="w-16 h-16 rounded-full ring-2 ring-offset-2 ring-gray-100 overflow-hidden group-hover:ring-primary transition-all">
                            <img 
                                src={tutorImage || "https://i.ibb.co/mJ9rwdJ/user.png"} 
                                alt={tutorName} 
                                className="object-cover w-full h-full"
                                onError={(e) => { e.target.src = "https://placehold.co/150?text=No+Img"; }}
                            />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                            {tutorName}
                        </h3>
                        <span className="text-xs font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                            {tuitionSubject}
                        </span>
                    </div>
                </div>

                <div className="space-y-3 pt-2 mb-2">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-gray-300" />
                            <span className="truncate max-w-[120px] text-xs font-medium">
                                {tuitionLocation}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded">
                             <FaChalkboardTeacher className="text-gray-400"/>
                             <span>{experience} Years</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <FaMoneyBillWave className="text-green-500" />
                        <span>{Number(expectedSalary).toLocaleString()} <span className="text-[10px] font-normal text-gray-400">BDT</span></span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const TutorListSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card bg-white h-64 border border-gray-100 p-5 rounded-2xl">
                <div className="skeleton h-16 w-16 rounded-full mb-4"></div>
                <div className="skeleton h-4 w-3/4 mb-2"></div>
                <div className="skeleton h-4 w-1/2 mb-6"></div>
                <div className="skeleton h-4 w-full mt-auto"></div>
            </div>
        ))}
    </div>
);

export default LatestTutors;