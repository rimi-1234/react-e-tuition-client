import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, 
    FaPaperPlane, FaCheckCircle, FaQuestionCircle, FaClock 
} from 'react-icons/fa';

// --- Constants (Single Source of Truth) ---
const CONTACT_INFO = [
    {
        id: 'phone',
        icon: FaPhoneAlt,
        title: "Call Us",
        value: "+880 1712 345 678",
        sub: "Mon-Fri from 8am to 5pm",
        link: "tel:+8801712345678"
    },
    {
        id: 'email',
        icon: FaEnvelope,
        title: "Email Us",
        value: "support@tutorplatform.com",
        sub: "We usually reply within 24 hours",
        link: "mailto:support@tutorplatform.com"
    },
    {
        id: 'location',
        icon: FaMapMarkerAlt,
        title: "Our Office",
        value: "123 Education Street, Dhaka",
        sub: "View on Google Maps",
        link: "https://maps.google.com"
    }
];

const FAQS = [
    { question: "How do I find a tutor?", answer: "Simply go to the 'Tutors' page and use the filters to find a match based on subject and location." },
    { question: "Is the first class free?", answer: "Many of our tutors offer a free demo class. Check their profile for the 'Trial Available' badge." },
    { question: "How do I become a tutor?", answer: "Click 'Register' in the navbar, select 'Tutor' as your role, and complete your profile." },
];

const Contact = () => {
    // --- State Management ---
    const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'

    // --- Handlers ---
    const handleChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');

        // Simulate API Call
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            setStatus('success');
            setFormState({ name: '', email: '', subject: '', message: '' });
            
            // Reset status after 5 seconds to allow sending another
            setTimeout(() => setStatus('idle'), 5000);
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <div className="bg-white min-h-screen">
            {/* --- Header Section --- */}
            <section className="bg-primary/5 py-20 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-primary font-bold tracking-wider uppercase text-xs bg-white px-3 py-1 rounded-full shadow-sm mb-4 inline-block">
                            24/7 Support
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold font-display text-gray-900 mb-6">
                            We're here to <span className="text-primary">help you.</span>
                        </h1>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                            Have questions about our platform? Whether you're a student looking for guidance or a tutor wanting to join, we'd love to hear from you.
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 -mt-10 mb-24 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* --- Sidebar: Contact Info --- */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4 h-fit"
                    >
                        {CONTACT_INFO.map((info) => (
                            <a 
                                key={info.id} 
                                href={info.link}
                                target={info.id === 'location' ? '_blank' : '_self'}
                                rel="noreferrer"
                                className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group"
                            >
                                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <info.icon className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{info.title}</h3>
                                    <p className="text-gray-600 font-medium">{info.value}</p>
                                    <p className="text-xs text-gray-400 mt-1">{info.sub}</p>
                                </div>
                            </a>
                        ))}

                        {/* Mini Map Preview (Visual only) */}
                        <div className="rounded-2xl overflow-hidden border border-gray-100 h-48 mt-6 relative group">
                            <img 
                                src="https://i.imgur.com/3Yd8qJ6.png" // Placeholder map image
                                alt="Map Location" 
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-transparent transition-colors">
                                <span className="bg-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">Dhaka, BD</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* --- Main: Contact Form --- */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-2"
                    >
                        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-gray-200/50 border border-gray-100">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">Send us a Message</h2>
                                <p className="text-gray-500 text-sm mt-1">Fill out the form below and we'll get back to you shortly.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField 
                                        label="Full Name" 
                                        name="name" 
                                        type="text" 
                                        placeholder="John Doe" 
                                        value={formState.name} 
                                        onChange={handleChange} 
                                    />
                                    <InputField 
                                        label="Email Address" 
                                        name="email" 
                                        type="email" 
                                        placeholder="john@example.com" 
                                        value={formState.email} 
                                        onChange={handleChange} 
                                    />
                                </div>

                                <InputField 
                                    label="Subject" 
                                    name="subject" 
                                    type="text" 
                                    placeholder="I need help finding a math tutor..." 
                                    value={formState.subject} 
                                    onChange={handleChange} 
                                />

                                <div className="form-control">
                                    <label className="label text-sm font-bold text-gray-700 mb-1">Message</label>
                                    <textarea 
                                        name="message"
                                        value={formState.message}
                                        onChange={handleChange}
                                        className="textarea textarea-bordered h-40 w-full bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-base" 
                                        placeholder="Tell us more about your inquiry..." 
                                        required
                                    ></textarea>
                                </div>

                                {/* Submit Button Logic */}
                                <div className="pt-2">
                                    <AnimatePresence mode='wait'>
                                        {status === 'success' ? (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-green-50 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 font-medium border border-green-200"
                                            >
                                                <FaCheckCircle /> Message sent successfully! We will contact you soon.
                                            </motion.div>
                                        ) : (
                                            <button 
                                                type="submit" 
                                                disabled={status === 'submitting'}
                                                className="btn btn-primary w-full md:w-auto text-white px-8 h-12 gap-2 text-base shadow-lg shadow-primary/30 hover:shadow-primary/50 disabled:bg-primary/70"
                                            >
                                                {status === 'submitting' ? (
                                                    <>
                                                        <span className="loading loading-spinner loading-sm"></span> Sending...
                                                    </>
                                                ) : (
                                                    <>Send Message <FaPaperPlane className="text-xs" /></>
                                                )}
                                            </button>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>

                {/* --- FAQ Section (Value Add) --- */}
                <div className="mt-24 max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-8 flex items-center justify-center gap-2">
                        <FaQuestionCircle className="text-primary" /> Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {FAQS.map((faq, index) => (
                            <div key={index} className="collapse collapse-plus bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                                <input type="radio" name="my-accordion-3" defaultChecked={index === 0} /> 
                                <div className="collapse-title text-lg font-medium text-gray-800">
                                    {faq.question}
                                </div>
                                <div className="collapse-content text-gray-500">
                                    <p>{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Reusable Input Component (Cleaner Code) ---
const InputField = ({ label, name, type, placeholder, value, onChange }) => (
    <div className="form-control w-full">
        <label className="label text-sm font-bold text-gray-700 mb-1">{label}</label>
        <input 
            type={type} 
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder} 
            className="input input-bordered w-full bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all h-12" 
            required 
        />
    </div>
);

export default Contact;