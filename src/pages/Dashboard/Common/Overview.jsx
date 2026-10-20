import AdminOverview from '../../../components/dashboard/AdminOverview';
import StudentOverview from '../../../components/dashboard/StudentOverview';
import TutorOverview from '../../../components/dashboard/TutorOverview';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useAuth } from '../../../providers/AuthProvider';

export default function Overview() {
  const { role } = useAuth();
  useDocumentTitle(role === 'Admin' ? 'Analytics' : 'Dashboard');
  if (role === 'Admin') return <AdminOverview />;
  if (role === 'Tutor') return <TutorOverview />;
  return <StudentOverview />;
}
