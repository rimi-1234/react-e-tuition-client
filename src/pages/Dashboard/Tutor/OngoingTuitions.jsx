import { useQuery } from '@tanstack/react-query'
import { FaMapMarkerAlt, FaUserGraduate } from 'react-icons/fa'
import useAuth from '../../../hooks/useAuth'
import useAxiosSecure from '../../../hooks/useAxiosSecure'

const OngoingTuitions = () => {
  const { user } = useAuth()
  const axiosSecure = useAxiosSecure()

  // Fetch only approved applications
  const { data: ongoing = [], isLoading } = useQuery({
    queryKey: ['ongoing-tuitions', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/applications?tutorEmail=${user.email}&status=approved`)
      return res.data
    }
  })

  if (isLoading) return <div className="h-screen flex justify-center items-center"><span className="loading loading-spinner text-primary loading-lg"></span></div>

  return (
    <div className="w-full p-6 bg-base-200 min-h-screen font-body">
      <h2 className="text-3xl font-bold font-display text-base-content mb-6">Ongoing Tuitions</h2>
      
      {ongoing.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No active tuitions yet. Keep applying!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ongoing.map(item => (
            <div key={item._id} className="card bg-base-100 shadow-xl border border-success/20">
              <div className="card-body">
                <h3 className="card-title font-display text-xl">{item.tuitionTitle}</h3>
                
                <div className="mt-4 space-y-2 text-gray-600">
                   <div className="flex items-center gap-2">
                      <FaUserGraduate className="text-primary"/> 
                      <span>Student ID: {item.studentEmail}</span>
                   </div>
                   <div className="badge badge-success text-white mt-2">Active</div>
                </div>

                <div className="card-actions justify-end mt-4 border-t pt-4">
                  <p className="text-sm font-bold text-gray-500">Agreed Salary</p>
                  <p className="text-2xl font-bold text-primary font-display">৳{item.expectedSalary}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OngoingTuitions