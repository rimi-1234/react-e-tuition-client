import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router' 
import toast from 'react-hot-toast'
import { TbFidgetSpinner } from 'react-icons/tb'
import axios from 'axios'

import useAuth from '../../hooks/useAuth'
import LoadingSpinner from '../../components/Shared/LoadingSpinner'
import ThemeToggle from '../../components/Shared/ThemeToggle'
import SocialLogin from '../SocialLogin/SocialLogin'

const DEMO_ROLES = [
  { role: 'Student', label: 'Student',  color: 'bg-indigo-600 hover:bg-indigo-700',  icon: '🎓' },
  { role: 'Tutor',   label: 'Tutor',    color: 'bg-emerald-600 hover:bg-emerald-700', icon: '📚' },
  { role: 'Admin',   label: 'Admin',    color: 'bg-rose-600 hover:bg-rose-700',       icon: '🛡️' },
]

const Login = () => {
  const { signIn, signInWithDemo, loading: authLoading, setLoading: setAuthLoading, user } = useAuth()
  const navigate = useNavigate()

  const [loading,     setLoading]     = useState(false)
  const [demoLoading, setDemoLoading] = useState(null)   // which role is loading

  // Always land on the dashboard after login (not profile / home)
  const redirectTo = '/dashboard'

  if (authLoading) return <LoadingSpinner />
  if (user) return <Navigate to={redirectTo} replace={true} />

  /* ── Normal email/password login ─────────────────────────────── */
  const handleSubmit = async event => {
    event.preventDefault()
    const form     = event.currentTarget
    const email    = form.email.value
    const password = form.password.value

    if (!email || !password) return toast.error('Please fill in both fields')

    try {
      setLoading(true)
      await signIn(email, password)
      navigate(redirectTo, { replace: true })
      toast.success('Login Successful')
    } catch (err) {
      console.error('Login Error:', err)
      toast.error(err?.message || 'Login failed')
    } finally {
      setLoading(false)
      setAuthLoading(false)
    }
  }

  /* ── One-click demo login ─────────────────────────────────────── */
  const handleDemoLogin = async (role) => {
    setDemoLoading(role)
    const toastId = toast.loading(`Signing in as Demo ${role}…`)
    try {
      // 1. Get a custom Firebase token from the backend (no password needed)
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/demo-login`,
        { role }
      )

      // 2. Exchange it for a real Firebase session
      await signInWithDemo(data.token)

      toast.success(`Logged in as Demo ${role}`, { id: toastId })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error('Demo login error:', err)
      const msg = err?.response?.data?.message || err?.message || 'Demo login failed'
      toast.error(msg, { id: toastId })
    } finally {
      setDemoLoading(null)
      setAuthLoading(false)
    }
  }

  return (
    <div className='relative flex min-h-screen items-center justify-center bg-base-200 py-12 font-body text-base-content'>
      <div className='absolute right-4 top-4'>
        <ThemeToggle />
      </div>
      <div className='flex w-full max-w-md flex-col rounded-2xl border border-base-300 bg-base-100 p-6 text-base-content shadow-xl sm:p-10'>
        
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

        {/* ── Demo Login ─────────────────────────────────────────── */}
        <div className='mt-8 rounded-xl border border-base-300 bg-base-200/60 p-4'>
          <p className='mb-3 text-center text-xs font-bold uppercase tracking-widest text-base-content/50'>
            One-Click Demo Login
          </p>
          <div className='grid grid-cols-3 gap-2'>
            {DEMO_ROLES.map(({ role, label, color, icon }) => (
              <button
                key={role}
                type='button'
                disabled={demoLoading !== null}
                onClick={() => handleDemoLogin(role)}
                className={`flex flex-col items-center gap-1.5 rounded-xl py-3 px-2 text-white transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed ${color}`}
              >
                <span className='text-xl'>
                  {demoLoading === role
                    ? <TbFidgetSpinner className='animate-spin text-xl' />
                    : icon}
                </span>
                <span className='text-xs font-semibold'>{label}</span>
              </button>
            ))}
          </div>
          <p className='mt-2 text-center text-[10px] text-base-content/40'>
            No password needed — temporary session only
          </p>
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