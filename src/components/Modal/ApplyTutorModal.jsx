import { useForm } from 'react-hook-form'
import Swal from 'sweetalert2'
import useAxiosSecure from '../../hooks/useAxiosSecure'
import useAuth from '../../hooks/useAuth'


const ApplyTutorModal = ({ tuitionId, tuitionTitle, closeModal }) => {
  const { user } = useAuth()
  const axiosSecure = useAxiosSecure()
  const { register, handleSubmit, reset } = useForm()

  const onSubmit = async (data) => {
    const applicationData = {
      tuitionId,
      tuitionTitle,
      tutorName: user?.displayName,
      tutorEmail: user?.email,
      qualifications: data.qualifications,
      experience: data.experience,
      expectedSalary: parseFloat(data.expectedSalary),
      status: 'pending', // Default status
      appliedDate: new Date()
    }

    try {
      const res = await axiosSecure.post('/applications', applicationData)
      if (res.data.insertedId) {
        reset()
        closeModal()
        Swal.fire({
          icon: 'success',
          title: 'Application Submitted!',
          text: 'The student will review your application.',
          confirmButtonColor: '#6B46F3'
        })
      }
    } catch (error) {
      console.error(error)
      Swal.fire('Error', 'You have already applied to this job.', 'error')
    }
  }

  return (
    <dialog id="apply_modal" className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl bg-white">
        <h3 className="font-bold text-2xl font-display text-base-content mb-4">Apply for: {tuitionTitle}</h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Read Only Fields */}
            <div className="form-control">
              <label className="label"><span className="label-text font-urbanist">Name</span></label>
              <input type="text" value={user?.displayName} readOnly className="input input-bordered bg-gray-100 text-gray-500" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-urbanist">Email</span></label>
              <input type="email" value={user?.email} readOnly className="input input-bordered bg-gray-100 text-gray-500" />
            </div>
          </div>

          {/* Input Fields */}
          <div className="form-control">
            <label className="label"><span className="label-text font-urbanist font-bold">Qualifications</span></label>
            <input 
              {...register('qualifications', { required: true })} 
              placeholder="e.g. BSc in Math from BUET" 
              className="input input-bordered focus:outline-none focus:border-primary" 
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text font-urbanist font-bold">Experience</span></label>
            <input 
              {...register('experience', { required: true })} 
              placeholder="e.g. 2 years teaching Class 9" 
              className="input input-bordered focus:outline-none focus:border-primary" 
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text font-urbanist font-bold">Expected Salary (৳)</span></label>
            <input 
              type="number" 
              {...register('expectedSalary', { required: true })} 
              placeholder="5000" 
              className="input input-bordered w-full focus:outline-none focus:border-primary" 
            />
          </div>

          <div className="modal-action">
             <button type="submit" className="btn btn-primary text-white font-urbanist px-8">Submit Application</button>
             <button type="button" onClick={closeModal} className="btn btn-ghost">Cancel</button>
          </div>
        </form>
      </div>
    </dialog>
  )
}

export default ApplyTutorModal