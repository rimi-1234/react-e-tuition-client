import { motion } from 'framer-motion';
import { FaStar, FaQuoteLeft, FaGraduationCap, FaArrowTrendUp } from 'react-icons/fa6';

const SuccessStories = () => {
    const stories = [
        {
            name: "Arjun Mehta",
            role: "Year 11 Student",
            result: "From Grade 4 to Grade 9",
            subject: "GCSE Mathematics",
            quote: "I used to be terrified of Calculus. My tutor broke it down into simple steps that actually made sense. I couldn't have hit my target without them.",
            avatar: "https://i.pravatar.cc/150?u=arjun",
            badgeColor: "bg-blue-100 text-blue-600"
        },
        {
            name: "Sarah Thompson",
            role: "Parent of Year 6 Student",
            result: "11+ Exam Success",
            subject: "English & Verbal Reasoning",
            quote: "The personalized attention Sarah received was incredible. Her confidence soared, and she secured a spot at her first-choice grammar school!",
            avatar: "https://i.pravatar.cc/150?u=sarah",
            badgeColor: "bg-green-100 text-green-600"
        },
        {
            name: "James Wilson",
            role: "University Applicant",
            result: "Accepted to Oxford",
            subject: "Physics & PAT Prep",
            quote: "The interview prep was the most valuable part. My tutor had actually been through the process and knew exactly what the professors look for.",
            avatar: "https://i.pravatar.cc/150?u=james",
            badgeColor: "bg-purple-100 text-purple-600"
        }
    ];

    return (
        <section className="py-24 px-6 bg-base-200/30">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4 uppercase tracking-wider">
                            <FaGraduationCap /> Impact Stories
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold font-display leading-tight">
                            Real results that <br />
                            <span className="text-primary italic">change lives</span>
                        </h2>
                    </div>
                    <div className="hidden md:block">
                        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <img key={i} className="w-10 h-10 rounded-full border-2 border-white" src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                                ))}
                            </div>
                            <div className="text-sm">
                                <p className="font-bold">4.9/5 Average Rating</p>
                                <p className="text-gray-500">From 10,000+ Students</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stories.map((story, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-shadow duration-300 group"
                        >
                            <div className="mb-6 relative">
                                <FaQuoteLeft className="text-primary/10 text-5xl absolute -top-2 -left-2" />
                                <div className="flex gap-1 text-yellow-400 mb-4 relative z-10">
                                    {[...Array(5)].map((_, i) => <FaStar key={i} />)}
                                </div>
                                <p className="text-gray-600 leading-relaxed italic relative z-10">
                                    "{story.quote}"
                                </p>
                            </div>

                            <div className="mt-auto pt-6 border-t border-gray-50">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${story.badgeColor} text-xs font-bold mb-4 uppercase`}>
                                    <FaArrowTrendUp /> {story.result}
                                </div>
                                <div className="flex items-center gap-4">
                                    <img 
                                        src={story.avatar} 
                                        alt={story.name} 
                                        className="w-12 h-12 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all"
                                    />
                                    <div>
                                        <h4 className="font-bold text-gray-800">{story.name}</h4>
                                        <p className="text-xs text-gray-400">{story.role}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SuccessStories;