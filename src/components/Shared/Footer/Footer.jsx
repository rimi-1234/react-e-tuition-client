import React from 'react';
import { Link } from 'react-router'; // or 'react-router-dom' depending on your version
import { FaFacebookF, FaLinkedinIn, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6'; // specific import for the new X logo

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 py-16 font-sans">
            <div className="max-w-7xl mx-auto px-6">
                
                {/* --- Top Section: 4 Column Layout --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    
                    {/* 1. About Platform */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-white font-display">
                            Tutor<span className="text-primary">Platform</span>
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            We are dedicated to bridging the gap between students and expert tutors worldwide. 
                            Empowering education through technology and community.
                        </p>
                    </div>

                    {/* 2. Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Home</Link>
                            </li>
                            <li>
                                <Link to="/tutors" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Find a Tutor</Link>
                            </li>
                            <li>
                                <Link to="/about" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">About Us</Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Contact</Link>
                            </li>
                        </ul>
                    </div>

                    {/* 3. Contact Information */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Contact Us</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li className="flex items-start gap-3">
                                <span className="text-white font-medium">Address:</span>
                                123 Education Street, <br /> Dhaka, Bangladesh
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-white font-medium">Email:</span>
                                <a href="mailto:support@plantnet.com" className="hover:text-primary transition-colors">
                                    support@plantnet.com
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-white font-medium">Phone:</span>
                                <a href="tel:+880123456789" className="hover:text-primary transition-colors">
                                    +880 1234 567 890
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* 4. Social Media */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Follow Us</h4>
                        <p className="text-sm text-gray-400">Join our community on social media for updates and tips.</p>
                        <div className="flex gap-4">
                            <SocialIcon href="https://facebook.com" icon={FaFacebookF} label="Facebook" />
                            <SocialIcon href="https://twitter.com" icon={FaXTwitter} label="X (Twitter)" />
                            <SocialIcon href="https://instagram.com" icon={FaInstagram} label="Instagram" />
                            <SocialIcon href="https://linkedin.com" icon={FaLinkedinIn} label="LinkedIn" />
                        </div>
                    </div>
                </div>

                {/* --- Divider --- */}
                <div className="border-t border-gray-800 my-8"></div>

                {/* --- Bottom Section: Copyright --- */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                    <p>
                        &copy; {new Date().getFullYear()} PlantNet Inc. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// --- Helper Component for consistent Social Icons ---
const SocialIcon = ({ href, icon: Icon, label }) => (
    <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        aria-label={label}
        className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all duration-300 transform hover:-translate-y-1"
    >
        <Icon className="text-lg" />
    </a>
);

export default Footer;