import Home from '../pages/Home/Home'
import ErrorPage from '../pages/ErrorPage'
import Login from '../pages/Login/Login'
import SignUp from '../pages/SignUp/SignUp'

import PrivateRoute from './PrivateRoute'
import DashboardLayout from '../layouts/DashboardLayout'


import Profile from '../pages/Dashboard/Common/Profile'

import MainLayout from '../layouts/MainLayout'
import AdminRoute from "./AdminRoute";

import { createBrowserRouter } from 'react-router'
import PostTuition from '../pages/Dashboard/Student/PostTuition'
import MyTuitions from '../pages/Dashboard/Student/MyTuitions'
import UpdateTuition from '../pages/Dashboard/Student/UpdateTuition'
import UserManagement from '../pages/Dashboard/Admin/UserManagement'
import TuitionManagement from '../pages/Dashboard/Admin/TuitionManagement'
import StudentRoute from './StudentRoute'
import TutorRoute from './TutorRoute'
import Tuitions from '../components/Home/Tuitions'
import TuitionDetails from '../pages/Home/TuitionDetails'
import Tutors from '../pages/Home/Tutors'
import MyApplications from '../pages/Dashboard/Tutor/MyApplications'
import AppliedTutors from '../pages/Dashboard/Student/AppliedTutors'
import PaymentSuccess from '../pages/Dashboard/Student/PaymentSuccess'
import PaymentHistory from '../pages/Dashboard/Student/PaymentHistory'
import Dashboard from '../pages/Dashboard/Common/Dashboard'
import OngoingTuitions from '../pages/Dashboard/Tutor/OngoingTuitions'
import About from '../pages/Home/About'
import Contact from '../pages/Home/Contact'


export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/tuitions',
        element: <Tuitions />,
      },
      {
        path: "/tuition/:id", // <--- ADD THIS ROUTE
        element: <TuitionDetails />,
      },
      {
        path: "/tutors",
        element: <Tutors />, // The Tutors page we just made
      },
      {
        path: "/about",
        element: <About />, // The Tutors page we just made
      },
      {
        path: "/contact",
        element: <Contact />, // The Tutors page we just made
      },

    ],
  },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <SignUp /> },
  {
    path: '/dashboard',
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <PrivateRoute>
            <Dashboard /> {/* Points to the new smart component */}
          </PrivateRoute>
        ),
      },
      {
        path: "post-tuition",
        element: (
          <StudentRoute>
            <PostTuition />
          </StudentRoute>
        ),
      },
      {
        path: 'my-posts',
        element: (
          <StudentRoute>
            <MyTuitions />
          </StudentRoute>
        ),
      },

      {
        path: 'applied-tutors',
        element: (
          <StudentRoute>
            <AppliedTutors />
          </StudentRoute>
        )
      },
      {
        path: 'payment/success',
        element: (
          <StudentRoute>
            <PaymentSuccess />
          </StudentRoute>
        )
      },
      {
        path: 'payment-history',
        element: (
          <StudentRoute>
            <PaymentHistory />
          </StudentRoute>
        )
      },
      {
        path: "my-applications", // This makes the URL: /dashboard/my-applications
        element: (<TutorRoute><MyApplications /></TutorRoute>)
      },
      {
        path: 'update-tuition/:id', // matches the Link to={`.../${item._id}`}
        element: <UpdateTuition />
      },
      {
        path: 'admin/users',
        element: (
          <AdminRoute><UserManagement /></AdminRoute>
        )
      },
      {
        path: 'admin/tuitions',
        element: (
          <AdminRoute><TuitionManagement /></AdminRoute>
        )
      },
      {
        path: 'ongoing-tuitions',
        element: (
          <TutorRoute>
            <OngoingTuitions />
          </TutorRoute>
        )
      },
    
   
      // {
      //   path: 'tutor/my-applications', // Matches "My Applications" menu
      //   element: (
      //     <TutorRoute>
      //       <MyApplications />
      //     </TutorRoute>
      //   )
      // },
      // {
      //   path: 'tutor/my-profile', // Matches "Update Profile" menu
      //   element: (
      //     <TutorRoute>
      //       <TutorProfile />
      //     </TutorRoute>
      //   )
      // },
      {
        path: 'profile',
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      }

    ],
  },
])
