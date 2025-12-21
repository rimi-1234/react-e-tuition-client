import { Link } from 'react-router';
import useAuth from "../../../hooks/useAuth";

const UserHome = () => {
  const { user } = useAuth(); // Get logged-in user info

  return (
    <div>
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8 rounded-lg shadow-lg mb-8">
        <h2 className="text-3xl font-bold mb-2">
          Welcome back, {user?.displayName || 'User'}!
        </h2>
        <p className="opacity-90">Here is what's happening with your account today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: User Profile / Info */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">My Profile</h3>
          <div className="flex items-center gap-4">
            <img 
              src={user?.photoURL || 'https://via.placeholder.com/150'} 
              alt="Profile" 
              className="w-16 h-16 rounded-full border-2 border-indigo-500"
            />
            <div>
              <p className="text-lg font-medium">{user?.displayName}</p>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Section 2: Recent Activity / Call to Action */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            
            {/* Link 1: View My Bookings */}
            <Link 
                to="/tuitions" 
                className="w-full py-2 px-4 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition block text-center"
            >
              View My Tutions
            </Link>

            {/* Link 2: Edit Profile */}
            <Link 
                to="/dashboard/profile"
                className="w-full py-2 px-4 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition block text-center"
            >
              Edit Profile
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHome;