import { useQuery } from '@tanstack/react-query'
import useAuth from './useAuth'
import useAxiosSecure from './useAxiosSecure'

const useRole = () => {
  const { user, loading } = useAuth()
  const axiosSecure = useAxiosSecure()

  const { data: role, isLoading } = useQuery({
    queryKey: [user?.email, 'role'],
    enabled:   !loading && !!user?.email,
    retry:     false,      // fail fast — don't retry 3× on 401/403/404
    staleTime: 5 * 60_000, // role rarely changes; cache for 5 min
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/${user.email}/role`)
      return res.data?.role
    }
  })

  // Return the role (e.g., "tutor") and loading state
  return [role, isLoading]
}

export default useRole