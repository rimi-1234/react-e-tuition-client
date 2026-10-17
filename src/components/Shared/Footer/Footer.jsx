import { Link } from 'react-router';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const Footer = () => {
    return (
        <footer className="border-t border-base-300 bg-base-100 py-16 font-sans text-base-content">
            <div className="mx-auto max-w-7xl px-6">
                <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-4">
                        <h3 className="font-display text-2xl font-bold">
                            Edu<span className="text-primary">rock</span>
                        </h3>
                        <p className="text-sm leading-relaxed text-base-content/70">
                            We connect students with verified tutors for subjects, classes, and locations across Bangladesh.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="inline-block transition-colors hover:text-primary">Home</Link></li>
                            <li><Link to="/tuitions" className="inline-block transition-colors hover:text-primary">Find a Tuition</Link></li>
                            <li><Link to="/tutors" className="inline-block transition-colors hover:text-primary">Find a Tutor</Link></li>
                            <li><Link to="/about" className="inline-block transition-colors hover:text-primary">About</Link></li>
                            <li><Link to="/contact" className="inline-block transition-colors hover:text-primary">Contact</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Contact</h4>
                        <ul className="space-y-3 text-sm text-base-content/70">
                            <li>123 Education Street, Dhaka, Bangladesh</li>
                            <li>
                                <a href="mailto:support@edurock.com" className="transition-colors hover:text-primary">
                                    support@edurock.com
                                </a>
                            </li>
                            <li>
                                <a href="tel:+8801712345678" className="transition-colors hover:text-primary">
                                    +880 1712 345 678
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Follow</h4>
                        <p className="text-sm text-base-content/70">Updates on new tutors, subjects, and learning tips.</p>
                        <div className="flex gap-3">
                            <SocialIcon href="https://facebook.com" icon={FaFacebookF} label="Facebook" />
                            <SocialIcon href="https://twitter.com" icon={FaXTwitter} label="X" />
                            <SocialIcon href="https://instagram.com" icon={FaInstagram} label="Instagram" />
                            <SocialIcon href="https://linkedin.com" icon={FaLinkedinIn} label="LinkedIn" />
                        </div>
                    </div>
                </div>

                <div className="my-8 border-t border-base-300"></div>

                <div className="flex flex-col items-center justify-between gap-4 text-xs text-base-content/60 md:flex-row">
                    <p>&copy; {new Date().getFullYear()} Edurock. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link to="/about" className="transition-colors hover:text-primary">About</Link>
                        <Link to="/contact" className="transition-colors hover:text-primary">Contact</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const SocialIcon = ({ href, icon: Icon, label }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-base-300 bg-base-200 text-base-content transition-all duration-300 hover:-translate-y-1 hover:bg-primary hover:text-white"
    >
        <Icon className="text-lg" />
    </a>
);

export default Footer;
