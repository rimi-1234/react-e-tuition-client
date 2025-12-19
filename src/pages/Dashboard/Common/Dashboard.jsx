// Assuming you have a hook to get role


import useRole from '../../../hooks/useRole';
import AdminStatistics from '../../../components/Dashboard/Statistics/AdminStatistics';
import UserHome from '../../../components/Dashboard/Statistics/UserHome';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';

const Dashboard = () => {
  const [role, isLoading] = useRole();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      {/* If user is Admin, show Statistics */}
      {role === 'Admin' && <AdminStatistics />}

      {/* If user is a normal User/Host, show their specific Home */}
      {role === 'Tutor' && <UserHome />}
      {role === 'Student' && <UserHome />}
    </div>
  );
};

export default Dashboard;