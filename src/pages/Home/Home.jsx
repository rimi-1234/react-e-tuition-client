import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
    FaChalkboardTeacher, FaSearch, FaUserCheck, 
    FaShieldAlt, FaClock, FaStar
} from 'react-icons/fa';

// Imports
import Hero from "../../components/Shared/Hero/Hero";
import LatestTuitions from "./LatestTuitions"; // Imported here
import useAxiosSecure from '../../hooks/useAxiosSecure';
import LatestTutors from './LatestTutors';

const Home = () => {
    const axiosSecure = useAxiosSecure();

    // Note: 'LatestTuitions' component now handles its own data fetching (posts),
    // so we removed the 'latest-posts' query from here to improve performance and code separation.

    // --- Fetch Latest Tutors ---
const { data: latestPosts = [], isLoading: loadingPosts } = useQuery({
        queryKey: ['latest-posts-home'],
        queryFn: async () => {
            // Fetch 3 latest posts
            const res = await axiosSecure.get('/tuition-posts?limit=6&sort=newest');
            return res.data.data || res.data;
        }
    });

 
    // --- Animation Variants ---
    const fadeInUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    return (
        <div className="font-body text-base-content overflow-x-hidden">
            
            {/* 1. Hero Section */}
            <Hero />

            {/* 2. How It Works (Visual Steps) */}
            <section className="py-24 px-6 bg-base-200/50">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
                            How It <span className="text-primary">Works</span>
                        </h2>
                        <p className="text-gray-500 max-w-2xl mx-auto mb-16">
                            Find the perfect tutor or student in three simple steps. Our process is designed for speed and security.
                        </p>
                    </motion.div>
                    
                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
                    >
                        {/* Connecting Line (Desktop Only) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 -z-10 dashed-line"></div>

                        {[
                            { icon: FaSearch, title: "Post Requirement", desc: "Describe the subject, class, and days you need. It's free.", color: "text-blue-500", bg: "bg-blue-50" },
                            { icon: FaChalkboardTeacher, title: "Get Connected", desc: "Qualified tutors apply to your post. Review profiles.", color: "text-purple-500", bg: "bg-purple-50" },
                            { icon: FaUserCheck, title: "Hire & Learn", desc: "Select the best match and start learning securely.", color: "text-green-500", bg: "bg-green-50" }
                        ].map((step, idx) => (
                            <motion.div key={idx} variants={fadeInUp} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                                <div className={`w-20 h-20 mx-auto ${step.bg} rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <step.icon className={`text-3xl ${step.color}`} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 font-display">{step.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* 3. Latest Tuition Posts */}
            {/* The component now handles fetching and displaying the gradient cards */}
          <LatestTuitions 
                tuitions={latestPosts} 
                loading={loadingPosts} 
            />
          <LatestTutors  />

            {/* 5. Why Choose Us (Features) */}
            <section className="py-24 px-6 bg-base-100">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                    {/* Text Side */}
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="flex-1 space-y-8"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold font-display leading-tight">
                            Why Parents Trust <br /><span className="text-primary relative inline-block">
                                Tutor Platform
                                <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-300 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" /></svg>
                            </span>
                        </h2>
                        
                        <div className="space-y-6">
                            {[
                                { icon: FaShieldAlt, title: "Verified Tutors", desc: "Every tutor passes a background check.", bg: "bg-green-100", text: "text-green-600" },
                                { icon: FaClock, title: "Fastest Matching", desc: "Get responses within 24 hours.", bg: "bg-blue-100", text: "text-blue-600" },
                                { icon: FaChalkboardTeacher, title: "Free for Parents", desc: "Posting a requirement is 100% free.", bg: "bg-purple-100", text: "text-purple-600" }
                            ].map((feature, idx) => (
                                <div key={idx} className="flex gap-5 items-start p-4 hover:bg-base-200/50 rounded-xl transition-colors">
                                    <div className={`p-4 ${feature.bg} ${feature.text} rounded-xl shrink-0`}>
                                        <feature.icon className="text-xl" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">{feature.title}</h4>
                                        <p className="text-gray-500 text-sm">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Visual Side */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="flex-1 relative"
                    >
                        <div className="relative z-10">
                            <img 
                                src="https://img.freepik.com/free-photo/happy-student-with-graduation-hat-diploma_23-2147694703.jpg" 
                                className="rounded-3xl shadow-2xl w-full object-cover transform rotate-2 hover:rotate-0 transition-transform duration-500"
                                alt="Happy Student" 
                            />
                            {/* Floating Stats Card */}
                            <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 animate-bounce-slow hidden md:block">
                                <div className="flex items-center gap-4">
                                    <div className="avatar-group -space-x-4">
                                        <div className="avatar w-12 border-2 border-white"><div className="w-12"><img src="https://i.pravatar.cc/100?img=1" alt="Avatar 1"/></div></div>
                                        <div className="avatar w-12 border-2 border-white"><div className="w-12"><img src="https://i.pravatar.cc/100?img=2" alt="Avatar 2"/></div></div>
                                        <div className="avatar w-12 border-2 border-white"><div className="w-12"><img src="https://i.pravatar.cc/100?img=3" alt="Avatar 3"/></div></div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-800">5k+</div>
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Active Tutors</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Decorative background blob */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 rounded-full blur-3xl -z-0"></div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Home;