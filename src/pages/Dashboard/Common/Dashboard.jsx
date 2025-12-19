// Assuming you have a hook to get role


import useRole from '../../../hooks/useRole';

import UserHome from '../../../components/Dashboard/Statistics/UserHome';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';
import RevenueHistory from '../../../components/Dashboard/Statistics/RevenueHistory';
import AdminAnalytics from '../../../components/Dashboard/Statistics/AdminAnalytics';

const Dashboard = () => {
  const [role, isLoading] = useRole();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      {/* If user is Admin, show Statistics */}
      {role === 'Admin' && <AdminAnalytics />}

      {/* If user is a normal User/Host, show their specific Home */}
      {role === 'Tutor' && <RevenueHistory />}
      {role === 'Student' && <UserHome />}
    </div>
  );
};

export default Dashboard;