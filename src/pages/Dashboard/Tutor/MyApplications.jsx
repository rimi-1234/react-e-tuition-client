import { useQuery } from '@tanstack/react-query'
import { FaTrashAlt, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import Swal from 'sweetalert2'
import useAuth from '../../../hooks/useAuth'
import useAxiosSecure from '../../../hooks/useAxiosSecure'

const MyApplications = () => {
  const { user } = useAuth()
  const axiosSecure = useAxiosSecure()

  const { data: applications = [], refetch, isLoading } = useQuery({
    queryKey: ['my-applications', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/applications?tutorEmail=${user.email}`)
      return res.data
    }
  })

  // Handle Delete (Withdraw Application)
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Withdraw Application?',
      text: "You can't undo this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, Withdraw'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await axiosSecure.delete(`/applications/${id}`)
        if (res.data.deletedCount > 0) {
          refetch()
          Swal.fire('Withdrawn!', 'Your application has been removed.', 'success')
        }
      }
    })
  }

  if (isLoading) return <div className="h-screen flex justify-center items-center"><span className="loading loading-spinner text-primary loading-lg"></span></div>

  return (
    <div className="w-full p-6 bg-base-200 min-h-screen font-body">
      <h2 className="text-3xl font-bold font-display text-base-content mb-6">My Applications</h2>
      
      <div className="overflow-x-auto bg-base-100 rounded-xl shadow-lg border border-base-200">
        <table className="table w-full">
          <thead className="bg-primary/5 text-base-content font-display text-sm uppercase">
            <tr>
              <th>Tuition Job</th>
              <th>Expected Salary</th>
              <th>Status</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app._id}>
                <td>
                  <div className="font-bold text-lg">{app.tuitionTitle}</div>
                  <div className="text-xs text-gray-500">Applied: {new Date(app.appliedDate).toLocaleDateString()}</div>
                </td>
                <td className="font-bold text-primary">৳{app.expectedSalary}</td>
                <td>
                  <span className={`badge p-3 font-bold text-white
                    ${app.status === 'approved' ? 'badge-success' : ''}
                    ${app.status === 'rejected' ? 'badge-error' : ''}
                    ${app.status === 'pending' ? 'badge-warning' : ''}
                  `}>
                    {app.status === 'approved' && <FaCheckCircle className="mr-1"/>}
                    {app.status === 'rejected' && <FaTimesCircle className="mr-1"/>}
                    {app.status === 'pending' && <FaClock className="mr-1"/>}
                    {app.status.toUpperCase()}
                  </span>
                </td>
                <td className="text-center">
                  {app.status === 'pending' ? (
                    <button 
                      onClick={() => handleDelete(app._id)} 
                      className="btn btn-sm btn-ghost text-red-500 hover:bg-red-50"
                    >
                      <FaTrashAlt /> Withdraw
                    </button>
                  ) : (
                    <span className="text-gray-400 text-xs italic">Closed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MyApplications