import { motion } from 'framer-motion';

const SubjectExplorer = () => {
    const subjects = [
        { name: "Mathematics", icon: "📐" },
        { name: "Physics", icon: "⚛️" },
        { name: "Chemistry", icon: "🧪" },
        { name: "English", icon: "📚" },
        { name: "Biology", icon: "🧬" },
        { name: "Economics", icon: "📈" },
        { name: "Coding", icon: "💻" },
        { name: "Spanish", icon: "🇪🇸" }
    ];

    return (
        <section className="py-24 px-6 bg-base-100">
            <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold font-display mb-12">
                    What would you like to <span className="text-primary">learn today?</span>
                </h2>
                
                <div className="flex flex-wrap justify-center gap-4">
                    {subjects.map((subject, idx) => (
                        <motion.button
                            key={idx}
                            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-3 px-6 py-4 bg-white border border-gray-100 rounded-2xl font-bold shadow-sm hover:border-primary transition-colors group"
                        >
                            <span className="text-2xl">{subject.icon}</span>
                            <span className="text-gray-700 group-hover:text-primary transition-colors">
                                {subject.name}
                            </span>
                        </motion.button>
                    ))}
                    
                    <button className="px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-focus transition-all shadow-lg shadow-primary/20">
                        View All Subjects
                    </button>
                </div>
            </div>
        </section>
    );
};

export default SubjectExplorer;