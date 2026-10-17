import { useState } from 'react'
import { Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
// Adjusted paths: Go up 4 levels to reach /src/hooks
import { FaHome } from 'react-icons/fa';

import logo from '../../../assets/logo.png'
// Icons
import { GrLogout } from 'react-icons/gr'
import { FcSettings } from 'react-icons/fc'
import { AiOutlineBars } from 'react-icons/ai'
import { BsGraphUp } from 'react-icons/bs'

// User Menu Components (Adjusted paths: Go up 1 level to reach /Menu)

import { FaTachometerAlt } from 'react-icons/fa';

import StudentMenu from './Menu/StudentMenu'
import TutorMenu from './Menu/TutorMenu'
import AdminMenu from './Menu/AdminMenu'
import useRole from '../../../hooks/useRole'
import useAuth from '../../../hooks/useAuth'
import MenuItem from './Menu/MenuItem'
import ThemeToggle from '../../Shared/ThemeToggle'

const Sidebar = () => {
  const { logOut } = useAuth()
  const [isActive, setActive] = useState(false)
  const [role, isLoading] = useRole()


  const handleToggle = () => {
    setActive(!isActive)
  }

  const sidebarVariants = {
    hidden: { x: '-100%', opacity: 0 },
    visible: { x: '0%', opacity: 1 },
  }

  return (
    <>
      {/* Small Screen Navbar */}
      <div className='flex items-center justify-between border-b border-base-300 bg-base-100 text-base-content md:hidden'>
        <div>
          <div className='block cursor-pointer p-4 font-bold'>
            <Link to='/' className='flex items-center gap-2'>
              <img src={logo} alt='Logo' className='w-8 h-8 rounded-full object-cover' />
              <span className='text-lg font-bold uppercase text-primary'>Edurock</span>
            </Link>
          </div>
        </div>

        <div className='flex items-center gap-1 pr-2'>
          <ThemeToggle />
          <button onClick={handleToggle} className='mobile-menu-button p-4 transition hover:bg-base-200 focus:outline-none'>
            <AiOutlineBars className='h-5 w-5 text-primary' />
          </button>
        </div>
      </div>

      {/* Sidebar Container */}
      <AnimatePresence>
        {(isActive || window.innerWidth >= 768) && (
          <motion.div
            initial='hidden'
            animate='visible'
            exit='hidden'
            variants={sidebarVariants}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`absolute inset-y-0 left-0 z-10 flex w-64 transform flex-col justify-between space-y-6 overflow-x-hidden border-r border-base-300 bg-base-100 px-2 py-4 text-base-content md:fixed md:translate-x-0`}
          >
            <div className='flex flex-col h-full'>

              {/* Logo */}
              <div className='mx-auto mt-2 hidden w-full items-center justify-center rounded-xl bg-base-200 px-4 py-4 shadow-sm md:flex'>
                <Link to='/' className='flex items-center gap-2'>
                  <img src={logo} alt='Logo' className='h-10 w-10 rounded-full object-cover' />
                  <span className='text-xl font-bold uppercase tracking-wider text-primary'>Edurock</span>
                </Link>
              </div>

              {/* Menus */}
              <div className='flex flex-col justify-between flex-1 mt-6'>
                <nav>
                  <MenuItem
                    icon={FaHome}
                    label='Home'
                    address='/'
                  />
                  <MenuItem
                    icon={FaTachometerAlt} // FontAwesome dashboard icon
                    label='Dashboard'
                    address='/dashboard'
                  />


                  {/* Render Menu Based on Role */}
                  {!isLoading && (
                    <>
                      {role === 'Student' && <StudentMenu />}
                      {role === 'Tutor' && <TutorMenu />}
                      {role === 'Admin' && <AdminMenu />}
                    </>
                  )}
                </nav>
              </div>

              {/* Footer */}
              <div>
                <div className='mb-4 hidden px-2 md:block'>
                  <ThemeToggle className='w-full' />
                </div>
                <hr className='border-base-300' />
                <MenuItem icon={FcSettings} label='Profile' address='/dashboard/profile' />
                <button onClick={logOut} className='mt-5 flex w-full cursor-pointer items-center rounded-md px-4 py-2 text-base-content transition-colors duration-300 hover:bg-base-200 hover:text-primary'>
                  <GrLogout className='w-5 h-5' />
                  <span className='mx-4 font-medium'>Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar