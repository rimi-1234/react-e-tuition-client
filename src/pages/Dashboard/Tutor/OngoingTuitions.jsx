import { useQuery } from '@tanstack/react-query'
import { FaMapMarkerAlt, FaUserGraduate, FaMoneyBillWave } from 'react-icons/fa'
import useAuth from '../../../hooks/useAuth'
import useAxiosSecure from '../../../hooks/useAxiosSecure'

const OngoingTuitions = () => {
  const { user } = useAuth()
  const axiosSecure = useAxiosSecure()

  const { data: ongoing = [], isLoading } = useQuery({
    queryKey: ['ongoing-tuitions', user?.email],
    queryFn: async () => {
      // CORRECTION: We call the specific endpoint we just created
      // No need to pass 'status=approved' manually anymore
      const res = await axiosSecure.get(`/applications/ongoing?tutorEmail=${user.email}`)
      return res.data
    },
    // Only run this query if the user email exists
    enabled: !!user?.email
  })

  if (isLoading) return (
    <div className="h-screen flex justify-center items-center bg-base-200">
      <span className="loading loading-spinner text-primary loading-lg"></span>
    </div>
  )

  return (
    <div className="w-full p-8 bg-base-200 min-h-screen font-body">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold font-display text-base-content mb-6">
          Ongoing <span className="text-primary">Tuitions</span>
        </h2>

        {ongoing.length === 0 ? (
          <div className="alert alert-info bg-blue-50 border-blue-200 text-blue-800">
            <span>No active tuitions found. Once a student pays, it will appear here.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ongoing.map(item => (
              <div key={item._id} className="card bg-base-100 shadow-xl border-l-4 border-success">
                <div className="card-body">
                  <div className="flex justify-between items-center mb-2">
                    <span className="badge badge-success text-white">Active</span>
                    <span className="text-xs text-gray-400 font-mono">#{item.transactionId?.slice(-6) || 'N/A'}</span>
                  </div>

                  <h3 className="card-title text-xl font-bold">{item.tuitionSubject}</h3>
                  
                  <div className="space-y-3 mt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-3">
                      <FaUserGraduate className="text-primary" />
                      <div>
                        <p className="text-xs text-gray-400">Student Email</p>
                        <p className="font-semibold">{item.recruiterEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FaMapMarkerAlt className="text-secondary" />
                      <div>
                        <p className="text-xs text-gray-400">Location</p>
                        <p className="font-semibold">{item.tuitionLocation}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FaMoneyBillWave className="text-accent" />
                      <div>
                        <p className="text-xs text-gray-400">Salary</p>
                        <p className="font-bold text-lg text-primary">৳{item.expectedSalary}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default OngoingTuitions