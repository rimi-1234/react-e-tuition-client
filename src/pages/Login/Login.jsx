import { useState, useEffect } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router' 
import toast from 'react-hot-toast'
import { TbFidgetSpinner } from 'react-icons/tb'

import useAuth from '../../hooks/useAuth'
import LoadingSpinner from '../../components/Shared/LoadingSpinner'
import SocialLogin from '../SocialLogin/SocialLogin'

const Login = () => {
  const { signIn, loading: authLoading, setLoading:setAuthLoading, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // State for local button loading
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || location.state || '/'

  useEffect(() => {
    console.log('Login Page State -> User:', user, 'Loading:', authLoading)
  }, [user, authLoading])

  // 1. If global auth is initializing, show full page loader
  if (authLoading) return <LoadingSpinner />
  
  // 2. If already logged in, redirect immediately
  if (user) return <Navigate to={from} replace={true} />

  const handleSubmit = async event => {
    event.preventDefault()
    const form = event.currentTarget
    const email = form.email.value
    const password = form.password.value

    if(!email || !password) return toast.error('Please fill in both fields')

    try {
      setLoading(true)
      
      // Attempt Login
      await signIn(email, password)
      
      // Success
      navigate(from, { replace: true })
      toast.success('Login Successful')
      
    } catch (err) {
      console.error('Login Error:', err)
      toast.error(err?.message || 'Login failed')
      
    }
    setLoading(false) ;
    setAuthLoading(false);
  }

  return (
    <div className='flex justify-center items-center min-h-screen bg-base-100 font-body text-base-content'>
      <div className='flex flex-col max-w-md w-full p-6 rounded-2xl shadow-xl bg-white border border-primary/10 sm:p-10'>
        
        <div className='mb-8 text-center'>
          <h1 className='my-3 text-4xl font-bold font-display text-gray-900'>
            Log In
          </h1>
          <p className='text-sm text-gray-500'>
            Sign in to access your account
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-4'>
            <div>
              <label htmlFor='email' className='block mb-2 text-sm font-medium text-gray-600'>
                Email address
              </label>
              <input
                type='email'
                name='email'
                id='email'
                required
                placeholder='Enter Your Email Here'
                className='w-full px-4 py-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50 text-gray-900 transition-all'
              />
            </div>
            <div>
              <div className='flex justify-between'>
                <label htmlFor='password' className='text-sm mb-2 font-medium text-gray-600'>
                  Password
                </label>
              </div>
              <input
                type='password'
                name='password'
                id='password'
                autoComplete='current-password'
                required
                placeholder='*******'
                className='w-full px-4 py-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50 text-gray-900 transition-all'
              />
            </div>
          </div>

          <div>
            <button
              type='submit'
              disabled={loading}
              // FIXED: Changed 'isLoggingIn' to 'loading' to match your state variable
              className={`w-full rounded-lg py-3.5 px-4 font-bold text-white transition-all duration-300 transform shadow-lg shadow-primary/30 ${
                loading 
                  ? 'bg-primary/70 cursor-not-allowed' 
                  : 'bg-primary hover:bg-indigo-600 hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <TbFidgetSpinner className='animate-spin m-auto text-2xl' />
              ) : (
                'Continue'
              )}
            </button>
          </div>
        </form>

        <div className='space-y-1 mt-4 text-center'>
          <button className='text-xs font-medium hover:underline text-gray-500 hover:text-primary transition-colors'>
            Forgot password?
          </button>
        </div>

        <div className='flex items-center pt-6 space-x-1'>
          <div className='flex-1 h-px sm:w-16 bg-gray-200'></div>
          <p className='px-3 text-sm text-gray-400 font-urbanist'>
            Login with social accounts
          </p>
          <div className='flex-1 h-px sm:w-16 bg-gray-200'></div>
        </div>

        <div className="mt-4">
           <SocialLogin />
        </div>

        <p className='px-6 text-sm text-center text-gray-500 mt-6'>
          Don&apos;t have an account yet?{' '}
          <Link
            to='/signup'
            className='hover:underline font-bold text-primary hover:text-indigo-600 transition-colors'
          >
            Sign up
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

export default Login