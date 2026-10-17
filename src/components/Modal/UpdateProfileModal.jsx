import { useState } from 'react'
import PropTypes from 'prop-types'
import toast from 'react-hot-toast'
import axios from 'axios'
import { FiX, FiCamera, FiUser, FiPhone, FiMapPin, FiBook, FiBriefcase, FiInfo } from 'react-icons/fi'
import { TbFidgetSpinner } from 'react-icons/tb'
import useAuth from '../../hooks/useAuth'
import useAxiosSecure from '../../hooks/useAxiosSecure'

const SUBJECT_OPTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English', 'Bangla', 'History', 'Geography',
  'ICT', 'Accounting', 'Economics', 'Finance',
]

const UpdateProfileModal = ({ isOpen, setIsOpen, user, profile, role, onSuccess }) => {
  const { updateUserProfile } = useAuth()
  const axiosSecure = useAxiosSecure()

  const [loading,   setLoading]   = useState(false)
  const [imgPreview, setImgPreview] = useState(null)
  const [subjects, setSubjects]   = useState(profile?.subjects || [])

  const toggleSubject = (s) =>
    setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const handleImagePreview = (e) => {
    const file = e.target.files[0]
    if (file) setImgPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const form     = e.target
    const toastId  = toast.loading('Saving profile…')

    try {
      let photoURL = user?.photoURL || profile?.photoURL || ''

      // Upload image if a new one was chosen
      const imgFile = form.image?.files?.[0]
      if (imgFile) {
        const key = import.meta.env.VITE_IMAGE_HOST_KEY
        if (key) {
          const formData = new FormData()
          formData.append('image', imgFile)
          const { data } = await axios.post(
            `https://api.imgbb.com/1/upload?key=${key}`,
            formData
          )
          if (data.success) photoURL = data.data.url
        }
      }

      const displayName = form.displayName.value.trim()

      // 1. Update Firebase display name + photo
      await updateUserProfile(displayName, photoURL)

      // 2. Update MongoDB via the /profile PATCH endpoint
      const patchBody = {
        displayName,
        photoURL,
        phone:         form.phone?.value?.trim()         || '',
        location:      form.location?.value?.trim()      || '',
        bio:           form.bio?.value?.trim()           || '',
        ...(role === 'Tutor' && {
          experience:    form.experience?.value?.trim()  || '',
          qualification: form.qualification?.value?.trim() || '',
          subjects,
        }),
      }
      await axiosSecure.patch('/profile', patchBody)

      toast.success('Profile updated!', { id: toastId })
      if (onSuccess) onSuccess()
      setIsOpen(false)
    } catch (err) {
      console.error(err)
      toast.error(err?.response?.data?.message || err.message || 'Failed to update', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-base-100 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-base-200 px-6 py-4">
          <h3 className="font-display text-lg font-bold">Edit Profile</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1.5 hover:bg-base-200 transition"
          >
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} id="edit-profile-form" className="max-h-[78vh] overflow-y-auto px-6 py-5 space-y-5">

          {/* Avatar upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img
                src={imgPreview || user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'U')}&background=6B46F3&color=fff&size=96`}
                alt="avatar"
                className="h-20 w-20 rounded-full border-4 border-base-200 object-cover"
              />
              <label
                htmlFor="imgUpload"
                className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-primary p-1.5 text-white shadow-lg hover:bg-primary/90"
              >
                <FiCamera size={13} />
              </label>
            </div>
            <input
              type="file"
              id="imgUpload"
              name="image"
              accept="image/*"
              className="hidden"
              onChange={handleImagePreview}
            />
            <p className="text-xs text-base-content/40">Click the camera icon to change photo</p>
          </div>

          {/* Display Name */}
          <div className="form-group">
            <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
              <FiUser className="text-primary" size={13} /> Display Name
            </label>
            <input
              type="text"
              name="displayName"
              defaultValue={user?.displayName || ''}
              required
              className="input input-bordered w-full"
              placeholder="Your full name"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
              <FiPhone className="text-blue-500" size={13} /> Phone
            </label>
            <input
              type="tel"
              name="phone"
              defaultValue={profile?.phone || ''}
              className="input input-bordered w-full"
              placeholder="+880 1XXX-XXXXXX"
            />
          </div>

          {/* Location */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
              <FiMapPin className="text-success" size={13} /> Location
            </label>
            <input
              type="text"
              name="location"
              defaultValue={profile?.location || ''}
              className="input input-bordered w-full"
              placeholder="e.g. Dhaka, Bangladesh"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
              <FiInfo className="text-secondary" size={13} /> Bio
            </label>
            <textarea
              name="bio"
              defaultValue={profile?.bio || ''}
              rows={3}
              className="textarea textarea-bordered w-full resize-none"
              placeholder="Tell something about yourself…"
            />
          </div>

          {/* Tutor-only fields */}
          {role === 'Tutor' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
                    <FiBriefcase className="text-warning" size={13} /> Experience (yrs)
                  </label>
                  <input
                    type="number"
                    name="experience"
                    min={0}
                    defaultValue={profile?.experience || ''}
                    className="input input-bordered w-full"
                    placeholder="e.g. 3"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
                    <FiBook className="text-primary" size={13} /> Qualification
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    defaultValue={profile?.qualification || ''}
                    className="input input-bordered w-full"
                    placeholder="e.g. B.Sc in Math"
                  />
                </div>
              </div>

              {/* Subjects */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <FiBook className="text-primary" size={13} /> Subjects Taught
                </label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECT_OPTIONS.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSubject(s)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                        subjects.includes(s)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-base-300 text-base-content/50 hover:border-primary/50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </form>

        {/* Footer buttons */}
        <div className="flex gap-3 border-t border-base-200 px-6 py-4">
          <button
            type="submit"
            form="edit-profile-form"
            disabled={loading}
            className="btn btn-primary flex-1 gap-2 text-white"
          >
            {loading ? <TbFidgetSpinner className="animate-spin text-lg" /> : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="btn btn-ghost flex-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

UpdateProfileModal.propTypes = {
  isOpen:     PropTypes.bool.isRequired,
  setIsOpen:  PropTypes.func.isRequired,
  user:       PropTypes.object,
  profile:    PropTypes.object,
  role:       PropTypes.string,
  onSuccess:  PropTypes.func,
}

export default UpdateProfileModal
