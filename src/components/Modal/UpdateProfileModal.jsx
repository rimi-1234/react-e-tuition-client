import PropTypes from 'prop-types'
import { useState } from 'react'
import useAuth from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import axios from 'axios' // 1. Import axios

const UpdateProfileModal = ({ isOpen, setIsOpen, user }) => {
  const { updateUserProfile } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const form = e.target
    const name = form.name.value
    const imageFile = form.image.files[0] // Get the file

    // 2. Prepare ImgBB URL
    const image_API_URL = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMAGE_HOST_KEY}`

    try {
      let photoURL = user?.photoURL

      // 3. Upload Image Logic (Just like Register page)
      if (imageFile) {
        const formData = new FormData()
        formData.append('image', imageFile)
        
        const res = await axios.post(image_API_URL, formData)
        
        if (res.data.success) {
           photoURL = res.data.data.url
        }
      }

      // 4. Update Firebase Profile with new Name and PhotoURL
      await updateUserProfile(name, photoURL)
      
      // Optional: If you have a backend (MongoDB), you might want to update it here too using axiosSecure
      // await axiosSecure.patch(`/users/${user?.email}`, { name, photoURL })

      toast.success('Profile Updated Successfully')
      setIsOpen(false)
      window.location.reload() // Reload to reflect changes if state doesn't auto-sync
    } catch (err) {
      console.error(err)
      toast.error(err.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-neutral-800/70'>
      <div className='relative w-full max-w-md p-6 mx-auto bg-white rounded-xl shadow-xl'>
        
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-xl font-semibold text-gray-900'>Update Profile</h3>
          <button onClick={() => setIsOpen(false)} className='text-gray-400 hover:text-gray-600 transition'>✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-4'>
          
          {/* Image Input */}
          <div className='flex flex-col gap-2'>
            <label className='text-sm font-medium text-gray-700'>Profile Picture</label>
            <input
              type='file'
              name='image'
              accept='image/*'
              className='file-input file-input-bordered w-full' // Used DaisyUI class to match your style
            />
          </div>

          {/* Name Input */}
          <div className='flex flex-col gap-2'>
            <label className='text-sm font-medium text-gray-700'>Name</label>
            <input
              type='text'
              name='name'
              defaultValue={user?.displayName}
              required
              className='input input-bordered w-full' // Used DaisyUI class
            />
          </div>

          {/* Buttons */}
          <div className='flex gap-4 mt-6'>
            <button
              type='submit'
              disabled={loading}
              className='btn btn-success text-white w-full' // DaisyUI button
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
            <button
              type='button'
              onClick={() => setIsOpen(false)}
              className='btn btn-ghost w-full'
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

UpdateProfileModal.propTypes = {
  isOpen: PropTypes.bool,
  setIsOpen: PropTypes.func,
  user: PropTypes.object,
}

export default UpdateProfileModal