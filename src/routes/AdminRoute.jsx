import { Navigate, useLocation } from 'react-router'
import useAuth from '../hooks/useAuth'
import useRole from '../hooks/useRole'

const TutorRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const [role, roleLoading] = useRole()
  const location = useLocation()

  // 1. Wait for Auth and Role data to load
  if (loading || roleLoading) {
    return <div className="h-screen flex justify-center items-center"><span className="loading loading-spinner text-primary loading-lg"></span></div>
  }

  // 2. Allow access if logged in AND role is 'tutor'
  if (user && role === 'Admin') {
    return children
  }

  // 3. Otherwise, logout & redirect to login
  return <Navigate to="/login" state={{ from: location }} replace />
}

export default TutorRoute