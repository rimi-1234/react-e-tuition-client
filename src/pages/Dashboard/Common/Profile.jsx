import { useState } from 'react'
import useAuth from '../../../hooks/useAuth'
import useRole from '../../../hooks/useRole'

import UpdateProfileModal from '../../../components/Modal/UpdateProfileModal'

const Profile = () => {
  const { user } = useAuth()
  const [role] = useRole()
  
  // State for Modal visibility
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  return (
    // 1. Background changed to base-200 (light gray/dark blue depending on mode)
    <div className='flex justify-center items-center min-h-screen bg-base-200'>


      {/* 2. Card Background changed to base-100 (white/darker blue) */}
      <div className='bg-base-100 shadow-xl rounded-2xl md:w-4/5 lg:w-3/5 overflow-hidden border border-base-200'>
        
        {/* 3. Gradient changed to Primary -> Secondary (Purple -> Pink) */}
        <div className='h-40 w-full bg-gradient-to-r from-primary to-secondary'></div>

        <div className='flex flex-col items-center justify-center p-4 -mt-20'>
          <a href='#' className='relative block z-10'>
            <img
              alt='profile'
              src={user?.photoURL || 'https://i.ibb.co/4pDNDk1/avatar.png'}
              // 4. Border changed to match card background
              className='mx-auto object-cover rounded-full h-32 w-32 border-4 border-base-100 shadow-lg'
            />
          </a>

          {/* 5. Role Badge using Primary Color */}
          <p className='mt-3 p-2 px-5 text-xs text-primary bg-primary/10 rounded-full font-bold uppercase tracking-wider'>
            {role || 'Guest'}
          </p>

          <p className='mt-2 text-2xl font-bold text-base-content font-display'>
            {user?.displayName}
          </p>
          
          <p className='text-xs text-base-content/60 font-mono'>
             ID: {user?.uid}
          </p>

          <div className='w-full p-4 mt-6 rounded-xl bg-base-200/50'>
            <div className='flex flex-wrap items-center justify-between text-sm gap-6'>
              
              <div className="flex flex-col gap-3">
                <div className='flex flex-col'>
                  <span className='text-xs text-base-content/60 uppercase font-semibold tracking-wide'>Email</span>
                  <span className='font-bold text-base-content text-lg'>{user?.email}</span>
                </div>
                
                <div className='flex flex-col'>
                  <span className='text-xs text-base-content/60 uppercase font-semibold tracking-wide'>Last Login</span>
                  <span className='font-bold text-base-content'>
                    {user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2"> 
                {/* 6. Button using DaisyUI 'btn-primary' */}
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className='btn btn-primary text-white px-8 rounded-full shadow-lg hover:shadow-primary/40 transition-all duration-300'
                >
                  Update Profile
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Render the Modal Component */}
      <UpdateProfileModal 
        isOpen={isEditModalOpen} 
        setIsOpen={setIsEditModalOpen} 
        user={user} 
      />
    </div>
  )
}

export default Profile