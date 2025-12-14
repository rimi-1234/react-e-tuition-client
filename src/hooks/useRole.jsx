import { useQuery } from '@tanstack/react-query'
import useAuth from './useAuth'
import useAxiosSecure from './useAxiosSecure'

const useRole = () => {
  const { user, loading } = useAuth()
  const axiosSecure = useAxiosSecure()

  const { data: role, isLoading } = useQuery({
    queryKey: [user?.email, 'role'],
    enabled: !loading && !!user?.email,
    queryFn: async () => {
    console.log();
    
      const res = await axiosSecure.get(`/users/${user.email}/role`)
      console.log(res);
      
      return res.data?.role
    }
  })

  // Return the role (e.g., "tutor") and loading state
  return [role, isLoading]
}

export default useRole