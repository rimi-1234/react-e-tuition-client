import { lazy } from 'react';
import { Navigate, createBrowserRouter, useParams } from 'react-router';
import MainLayout from '../layouts/MainLayout';
import { GuestOnly, RequireAuth, RequireRole } from './guards';

/**
 * Every page is its own chunk. `page()` also exposes `.preload()` so links
 * can warm a route's code on hover (see routes/preload.js).
 */
const registry = {};
function page(name, loader) {
  const Component = lazy(loader);
  registry[name] = loader;
  return Component;
}
export const preloadRoute = (name) => registry[name]?.();

const Home = page('home', () => import('../pages/public/Home'));
const Tuitions = page('tuitions', () => import('../pages/public/Tuitions'));
const TuitionDetails = page('tuition', () => import('../pages/public/TuitionDetails'));
const Tutors = page('tutors', () => import('../pages/public/Tutors'));
const TutorProfile = page('tutor', () => import('../pages/public/TutorProfile'));
const About = page('about', () => import('../pages/public/About'));
const Contact = page('contact', () => import('../pages/public/Contact'));
const NotFound = page('404', () => import('../pages/public/NotFound'));
const RouteError = page('error', () => import('../pages/public/RouteError'));

const Login = page('login', () => import('../pages/auth/Login'));
const SignUp = page('signup', () => import('../pages/auth/SignUp'));

const DashboardLayout = page('dashboard-layout', () => import('../layouts/DashboardLayout'));
const Overview = page('dashboard', () => import('../pages/dashboard/common/Overview'));
const Profile = page('profile', () => import('../pages/dashboard/common/Profile'));
const PaymentHistory = page('payments', () => import('../pages/dashboard/common/PaymentHistory'));
const PaymentSuccess = page('payment-success', () => import('../pages/dashboard/common/PaymentSuccess'));
const SavedTuitions = page('saved', () => import('../pages/dashboard/common/SavedTuitions'));

const PostTuition = page('post-tuition', () => import('../pages/dashboard/student/PostTuition'));
const EditTuition = page('edit-tuition', () => import('../pages/dashboard/student/EditTuition'));
const MyTuitions = page('my-posts', () => import('../pages/dashboard/student/MyTuitions'));
const Applicants = page('applicants', () => import('../pages/dashboard/student/Applicants'));

const MyApplications = page('my-applications', () => import('../pages/dashboard/tutor/MyApplications'));
const OngoingTuitions = page('ongoing', () => import('../pages/dashboard/tutor/OngoingTuitions'));

const AdminTuitions = page('admin-tuitions', () => import('../pages/dashboard/admin/AdminTuitions'));
const AdminUsers = page('admin-users', () => import('../pages/dashboard/admin/AdminUsers'));
const AdminPayments = page('admin-payments', () => import('../pages/dashboard/admin/AdminPayments'));
const AdminMessages = page('admin-messages', () => import('../pages/dashboard/admin/AdminMessages'));
const AdminChats = page('admin-chats', () => import('../pages/dashboard/admin/AdminChats'));

const STUDENT = ['Student'];
const TUTOR = ['Tutor'];
const ADMIN = ['Admin'];
const role = (roles, el) => <RequireRole roles={roles}>{el}</RequireRole>;

/** Old URLs from the previous version keep working. */
function LegacyTuitionRedirect() {
  const { id } = useParams();
  return <Navigate to={`/tuitions/${id}`} replace />;
}
function LegacyEditRedirect() {
  const { id } = useParams();
  return <Navigate to={`/dashboard/edit-tuition/${id}`} replace />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Home /> },
      { path: 'tuitions', element: <Tuitions /> },
      { path: 'tuitions/:id', element: <TuitionDetails /> },
      { path: 'tuition/:id', element: <LegacyTuitionRedirect /> },
      { path: 'tutors', element: <Tutors /> },
      { path: 'tutors/:id', element: <TutorProfile /> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
      { path: 'profile', element: <Navigate to="/dashboard/profile" replace /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  { path: '/login', element: <GuestOnly><Login /></GuestOnly>, errorElement: <RouteError /> },
  { path: '/signup', element: <GuestOnly><SignUp /></GuestOnly>, errorElement: <RouteError /> },
  {
    path: '/dashboard',
    element: (
      <RequireAuth>
        <DashboardLayout />
      </RequireAuth>
    ),
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Overview /> },
      { path: 'profile', element: <Profile /> },
      { path: 'payment-history', element: role([...STUDENT, ...TUTOR], <PaymentHistory />) },
      { path: 'saved-tuitions', element: role([...STUDENT, ...TUTOR], <SavedTuitions />) },

      { path: 'post-tuition', element: role(STUDENT, <PostTuition />) },
      { path: 'my-posts', element: role(STUDENT, <MyTuitions />) },
      { path: 'edit-tuition/:id', element: role(STUDENT, <EditTuition />) },
      { path: 'update-tuition/:id', element: <LegacyEditRedirect /> },
      { path: 'applied-tutors', element: role(STUDENT, <Applicants />) },
      { path: 'payment/success', element: role(STUDENT, <PaymentSuccess />) },

      { path: 'my-applications', element: role(TUTOR, <MyApplications />) },
      { path: 'ongoing-tuitions', element: role(TUTOR, <OngoingTuitions />) },

      { path: 'admin/tuitions', element: role(ADMIN, <AdminTuitions />) },
      { path: 'admin/users', element: role(ADMIN, <AdminUsers />) },
      { path: 'admin/payments', element: role(ADMIN, <AdminPayments />) },
      { path: 'admin/messages', element: role(ADMIN, <AdminMessages />) },
      { path: 'admin/chats', element: role(ADMIN, <AdminChats />) },
    ],
  },
]);
