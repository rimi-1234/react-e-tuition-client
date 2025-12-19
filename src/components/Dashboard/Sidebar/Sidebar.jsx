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



import StudentMenu from './Menu/StudentMenu'
import TutorMenu from './Menu/TutorMenu'
import AdminMenu from './Menu/AdminMenu'
import useRole from '../../../hooks/useRole'
import useAuth from '../../../hooks/useAuth'
import MenuItem from './Menu/MenuItem'

const Sidebar = () => {
  const { logOut } = useAuth()
  const [isActive, setActive] = useState(false)
  const [role, isLoading] = useRole()
  console.log(role);


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
      <div className='bg-white text-gray-800 flex justify-between md:hidden border-b border-indigo-100'>
        <div>
          <div className='block cursor-pointer p-4 font-bold'>
            <Link to='/' className='flex items-center gap-2'>
              <img src={logo} alt='Logo' className='w-8 h-8 rounded-full object-cover' />
              <span className='text-lg font-bold text-indigo-700 uppercase'>Edurock</span>
            </Link>
          </div>
        </div>

        <button onClick={handleToggle} className='mobile-menu-button p-4 focus:outline-none hover:bg-indigo-50 transition'>
          <AiOutlineBars className='h-5 w-5 text-indigo-600' />
        </button>
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
            className={`z-10 md:fixed flex flex-col justify-between overflow-x-hidden bg-white w-64 space-y-6 px-2 py-4 absolute inset-y-0 left-0 transform md:translate-x-0 border-r border-indigo-100`}
          >
            <div className='flex flex-col h-full'>

              {/* Logo */}
              <div className='w-full hidden md:flex px-4 py-4 shadow-sm rounded-xl justify-center items-center bg-indigo-50 mx-auto mt-2'>
                <Link to='/' className='flex items-center gap-2'>
                  <img src={logo} alt='Logo' className='w-10 h-10 rounded-full object-cover' />
                  <span className='text-xl font-bold text-indigo-700 uppercase tracking-wider'>TutorBoom</span>
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
                <hr className='border-gray-200' />
                <MenuItem icon={FcSettings} label='Profile' address='/dashboard/profile' />
                <button onClick={logOut} className='flex cursor-pointer w-full items-center px-4 py-2 mt-5 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-300 transform rounded-md'>
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