import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { 
    FaUserGraduate, FaChalkboardTeacher, FaAward, FaUsers, 
    FaLightbulb, FaHandshake, FaGlobeAsia 
} from 'react-icons/fa';

// --- Constants (Data Layer) ---
const STATS = [
    { id: 1, icon: FaChalkboardTeacher, number: "5,000+", label: "Expert Tutors" },
    { id: 2, icon: FaUserGraduate, number: "12,000+", label: "Active Students" },
    { id: 3, icon: FaAward, number: "98%", label: "Success Rate" },
    { id: 4, icon: FaUsers, number: "24/7", label: "Support Team" },
];

const VALUES = [
    {
        id: 1,
        icon: FaLightbulb,
        title: "Innovation",
        desc: "We constantly evolve our platform to provide the smartest learning tools."
    },
    {
        id: 2,
        icon: FaHandshake,
        title: "Integrity",
        desc: "Transparency and trust are the foundations of our community."
    },
    {
        id: 3,
        icon: FaGlobeAsia,
        title: "Inclusivity",
        desc: "Quality education should be accessible to everyone, everywhere."
    }
];

// --- Animation Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { staggerChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const About = () => {
    return (
        <div className="bg-white">
            
            {/* --- Hero Section --- */}
            <section className="relative py-20 lg:py-28 bg-gray-50 overflow-hidden">
                {/* Abstract Background Element */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <span className="inline-block text-primary font-bold tracking-wider uppercase text-xs bg-primary/10 px-3 py-1 rounded-full mb-4">
                            About Our Platform
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-gray-900 leading-[1.1]">
                            Empowering <span className="text-primary relative inline-block">
                                Education
                                <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                                </svg>
                            </span> <br /> across the Globe.
                        </h1>
                        <p className="text-gray-500 mt-6 text-lg leading-relaxed max-w-lg">
                            We bridge the gap between ambitious students and expert tutors. 
                            Our platform is designed to make quality education accessible, 
                            personalized, and effective for everyone, everywhere.
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="absolute -z-10 top-10 -left-10 w-full h-full bg-gray-200 rounded-2xl transform rotate-3" />
                        <img 
                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80" 
                            alt="Team brainstorming session" 
                            className="rounded-2xl shadow-xl w-full object-cover h-[400px] lg:h-[500px]"
                        />
                        {/* Floating Badge */}
                        <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full text-green-600">
                                <FaAward className="text-xl" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-semibold uppercase">Certified</p>
                                <p className="text-sm font-bold text-gray-900">Education Excellence</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- Stats Section (Staggered Animation) --- */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12"
                    >
                        {STATS.map((stat) => (
                            <StatCard key={stat.id} {...stat} />
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* --- Mission & Values Section --- */}
            <section className="py-24 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Core Values</h2>
                        <p className="text-gray-500 text-lg">
                            "To create a world where knowledge knows no boundaries. We believe in growth, integrity, and excellence."
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {VALUES.map((value, index) => (
                            <motion.div 
                                key={value.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                            >
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-xl mb-6">
                                    <value.icon />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                                <p className="text-gray-500 leading-relaxed">
                                    {value.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- CTA Section (Conversion Booster) --- */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto bg-primary rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/30">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to start learning?</h2>
                        <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                            Join thousands of students and tutors connecting daily. Transform your education journey today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/tutors">
                                <button className="btn bg-white text-primary border-none hover:bg-gray-100 font-bold px-8">
                                    Find a Tutor
                                </button>
                            </Link>
                            <Link to="/register">
                                <button className="btn bg-transparent border-white text-white hover:bg-white/10 font-bold px-8">
                                    Become a Tutor
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

// Extracted for cleanliness and reusability
const StatCard = ({ icon: Icon, number, label }) => (
    <motion.div 
        variants={itemVariants}
        className="flex flex-col items-center p-6 rounded-xl hover:bg-gray-50 transition-colors"
    >
        <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-4 text-primary">
            <Icon className="text-2xl" />
        </div>
        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{number}</h3>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</p>
    </motion.div>
);

export default About;