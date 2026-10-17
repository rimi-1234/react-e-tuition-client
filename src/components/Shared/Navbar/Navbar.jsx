import { Link, NavLink } from 'react-router';
import logo from '../../../assets/logo.png';
import useAuth from '../../../hooks/useAuth';
import ThemeToggle from '../ThemeToggle';
import NotificationBell from './NotificationBell';

const NavBar = () => {
    const { user, logOut } = useAuth();

    const handleLogOut = () => {
        logOut()
            .then(() => console.log("Logged out"))
            .catch(error => console.error(error));
    };

    const navLinks = (
        <>
            <li>
                <NavLink to="/" className={({ isActive }) => isActive ? "text-primary font-bold" : "hover:text-primary transition font-medium"}>Home</NavLink>
            </li>
            <li>
                <NavLink to="/tuitions" className={({ isActive }) => isActive ? "text-primary font-bold" : "hover:text-primary transition font-medium"}>Tuitions</NavLink>
            </li>
            <li>
                <NavLink to="/tutors" className={({ isActive }) => isActive ? "text-primary font-bold" : "hover:text-primary transition font-medium"}>Tutors</NavLink>
            </li>
            <li>
                <NavLink to="/about" className={({ isActive }) => isActive ? "text-primary font-bold" : "hover:text-primary transition font-medium"}>About</NavLink>
            </li>
            <li>
                <NavLink to="/contact" className={({ isActive }) => isActive ? "text-primary font-bold" : "hover:text-primary transition font-medium"}>Contact</NavLink>
            </li>
        </>
    );

    const getDashboardPath = () => {
        if (!user?.role) return "/dashboard";
        if (user.role === "student") return "/dashboard/student";
        if (user.role === "tutor") return "/dashboard/tutor";
        if (user.role === "admin") return "/dashboard/admin";
        return "/dashboard";
    };

    return (
        <div className="navbar sticky top-0 z-50 border-b border-base-300 bg-base-100/95 px-4 shadow-sm backdrop-blur-sm transition-colors duration-300 md:px-8">
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden pl-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                        </svg>
                    </div>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 w-52 gap-2 rounded-box border border-base-300 bg-base-100 p-2 text-base-content shadow">
                        {navLinks}
                    </ul>
                </div>

                <Link to="/" className="flex items-center gap-2 group">
                    <img src={logo} alt="Edurock Logo" className="w-8 h-8 object-contain" />
                    <span className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                        Edurock
                    </span>
                </Link>
            </div>

            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 gap-6 text-[15px]">
                    {navLinks}
                </ul>
            </div>

            <div className="navbar-end gap-2 md:gap-3">
                <NotificationBell />
                <ThemeToggle />

                {user ? (
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar border hover:border-primary transition">
                            <div className="w-10 rounded-full">
                                <img alt="User Profile" src={user.photoURL || "/images/portrait-1.jpg"} />
                            </div>
                        </div>
                        <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 w-52 rounded-box border border-base-300 bg-base-100 p-2 text-base-content shadow-lg">
                            <li className="menu-title px-4 py-2 text-primary font-semibold">Hi, {user.displayName || "User"}</li>
                            <li><Link to={getDashboardPath()}>Dashboard</Link></li>
                            <li><Link to="/profile">Profile</Link></li>
                            <li><button onClick={handleLogOut} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950">Logout</button></li>
                        </ul>
                    </div>
                ) : (
                    <Link to="/login" className="btn btn-primary btn-sm md:btn-md text-white px-6">Log In</Link>
                )}
            </div>
        </div>
    );
};

export default NavBar;