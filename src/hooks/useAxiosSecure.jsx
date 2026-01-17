import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import axios from 'axios'
import useAuth from './useAuth'
console.log(import.meta.env.VITE_API_URL);


const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

const useAxiosSecure = () => {
  const { user, logOut, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user?.accessToken) {
      // Add request interceptor
      const requestInterceptor = axiosInstance.interceptors.request.use(
        config => {
          config.headers.authorization = `Bearer ${user.accessToken}`
          return config
        }
      )

      // Add response interceptor
    // Add response interceptor
const responseInterceptor = axiosInstance.interceptors.response.use(
  res => {
    console.log('Response received:', res); // Log for debugging
    return res; // VERY IMPORTANT: You must return the response
  },
  async err => { // Added 'async' if you want to use await inside
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      try {
        await logOut();
        console.log('Logged out successfully due to expired session.');
        navigate('/login');
      } catch (logoutError) {
        console.error('Logout failed:', logoutError);
      }
    }
    return Promise.reject(err);
  }
);

      // Cleanup to prevent multiple interceptors on re-renders
      return () => {
        axiosInstance.interceptors.request.eject(requestInterceptor)
        axiosInstance.interceptors.response.eject(responseInterceptor)
      }
    }
  }, [user, loading, logOut, navigate])

  return axiosInstance
}
export default useAxiosSecure
