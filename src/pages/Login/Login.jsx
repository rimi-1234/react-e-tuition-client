import { useState, useEffect } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router' 
import toast from 'react-hot-toast'
import { TbFidgetSpinner } from 'react-icons/tb'

import useAuth from '../../hooks/useAuth'
import LoadingSpinner from '../../components/Shared/LoadingSpinner'
import SocialLogin from '../SocialLogin/SocialLogin'

const Login = () => {
  const { signIn, loading: authLoading, setLoading: setAuthLoading, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [loading, setLoading] = useState(false)
  const from = location.state?.from?.pathname || location.state || '/'
  console.log(location.state?.from?.pathname);
  

  // Function to quickly fill demo credentials
  const handleDemoLogin = (email, password) => {
    // We use set timeout to ensure the DOM is ready, 
    // though usually not needed if fields are already rendered.
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    if (emailField && passwordField) {
      emailField.value = email;
      passwordField.value = password;
    }
  };

  if (authLoading) return <LoadingSpinner />
  if (user) return <Navigate to={from} replace={true} />

  const handleSubmit = async event => {
    event.preventDefault()
    const form = event.currentTarget
    const email = form.email.value
    const password = form.password.value

    if (!email || !password) return toast.error('Please fill in both fields')

    try {
      setLoading(true)
      await signIn(email, password)
      navigate(from, { replace: true })
      toast.success('Login Successful')
    } catch (err) {
      console.error('Login Error:', err)
      toast.error(err?.message || 'Login failed')
    } finally {
      setLoading(false)
      setAuthLoading(false)
    }
  }

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-50 font-body text-base-content py-12'>
      <div className='flex flex-col max-w-md w-full p-6 rounded-2xl shadow-xl bg-white border border-gray-100 sm:p-10'>
        
        <div className='mb-8 text-center'>
          <h1 className='my-3 text-4xl font-bold text-gray-900'>Log In</h1>
          <p className='text-sm text-gray-500'>Sign in to access your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-4'>
            <div>
              <label htmlFor='email' className='block mb-2 text-sm font-medium text-gray-600'>Email address</label>
              <input
                type='email' name='email' id='email' required
                placeholder='Enter Your Email Here'
                className='w-full px-4 py-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500/20 bg-gray-50 text-gray-900'
              />
            </div>
            <div>
              <label htmlFor='password' className='text-sm mb-2 font-medium text-gray-600'>Password</label>
              <input
                type='password' name='password' id='password' required
                placeholder='*******'
                className='w-full px-4 py-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500/20 bg-gray-50 text-gray-900'
              />
            </div>
          </div>

          <button
            type='submit'
            disabled={loading}
            className={`w-full rounded-lg py-3.5 px-4 font-bold text-white transition-all shadow-lg ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? <TbFidgetSpinner className='animate-spin m-auto text-2xl' /> : 'Continue'}
          </button>
        </form>

        {/* --- DEMO CREDENTIALS SECTION --- */}
        <div className='mt-8 p-4 bg-orange-50 border border-orange-100 rounded-xl'>
          <p className='text-xs font-bold text-orange-700 uppercase tracking-wider mb-3'>Demo Accounts (Click to use)</p>
          <div className='grid grid-cols-1 gap-2'>
            <button 
              type="button"
              onClick={() => handleDemoLogin('habiba@gmail.com', '123@Abc')} 
              className='text-left text-xs p-2 rounded hover:bg-orange-100 transition-colors border border-orange-200'
            >
              <strong>Admin:</strong> habiba@gmail.com (123@Abc)
            </button>
            <button 
              type="button"
              onClick={() => handleDemoLogin('rimi1234@gamil.com', '123@Abc')} 
              className='text-left text-xs p-2 rounded hover:bg-orange-100 transition-colors border border-orange-200'
            >
              <strong>Tutor:</strong> rimi1234@gamil.com (123@Abc)
            </button>
            <button 
              type="button"
              onClick={() => handleDemoLogin('riadi@gmail.com', '123@Abc')} 
              className='text-left text-xs p-2 rounded hover:bg-orange-100 transition-colors border border-orange-200'
            >
              <strong>Student:</strong> riadi@gmail.com (123@Abc)
            </button>
          </div>
        </div>

        <div className='flex items-center pt-6 space-x-1'>
          <div className='flex-1 h-px bg-gray-200'></div>
          <p className='px-3 text-sm text-gray-400'>Or login with social</p>
          <div className='flex-1 h-px bg-gray-200'></div>
        </div>

        <div className="mt-4">
           <SocialLogin />
        </div>

        <p className='px-6 text-sm text-center text-gray-500 mt-6'>
          Don&apos;t have an account yet?{' '}
          <Link to='/signup' className='font-bold text-blue-600 hover:underline'>Sign up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login