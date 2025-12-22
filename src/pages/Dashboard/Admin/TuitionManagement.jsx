import { useQuery } from '@tanstack/react-query'
import { FaCheck, FaTimes, FaMapMarkerAlt, FaUser } from 'react-icons/fa'
import Swal from 'sweetalert2'
import useAxiosSecure from '../../../hooks/useAxiosSecure'

const TuitionManagement = () => {
  const axiosSecure = useAxiosSecure()

  // 1. Fetch ALL Tuitions (Admin sees everything)
  const { data: tuitions = [], refetch, isLoading } = useQuery({
    queryKey: ['all-tuitions-admin'],
    queryFn: async () => {
      // Admin route usually fetches all without filters
      const res = await axiosSecure.get('/tuitions') 
      return res.data
    }
  })

  // 2. Handle Approve/Reject
  const handleStatusChange = (id, newStatus) => {
    
    // Call the PATCH route we created specifically for status updates
    axiosSecure.patch(`/tuitions/status/${id}`, { status: newStatus })
      .then(res => {
        if(res.data.modifiedCount > 0){
            // Update UI immediately
            refetch()
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: `Post marked as ${newStatus}`,
                showConfirmButton: false,
                timer: 1500
            });
        }
      })
      .catch(err => {
        console.error(err)
        Swal.fire('Error', 'Failed to update status', 'error')
      })
  }

  if (isLoading) return (
    <div className="h-screen flex justify-center items-center">
        <span className="loading loading-spinner text-primary loading-lg"></span>
    </div>
  )

  return (
    <div className="w-full p-6 bg-base-200 min-h-screen font-body">
      
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-3xl font-bold font-display text-base-content">Tuition Management</h2>
           <p className="text-gray-500 mt-1 font-urbanist">Manage {tuitions.length} tuition posts.</p>
        </div>
      </div>

      {/* ------------------------------------------------------
          VIEW 1: TABLE (Visible only on Large Screens - lg+) 
         ------------------------------------------------------ */}
      <div className="hidden lg:block overflow-x-auto bg-base-100 rounded-xl shadow-lg border border-base-200">
        <table className="table w-full">
          {/* Table Head */}
          <thead className="bg-primary/5 text-base-content font-display text-sm uppercase">
            <tr>
              <th>#</th>
              <th>Subject & Class</th>
              <th>Student Info</th>
              <th>Salary</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="text-sm">
            {tuitions.map((item, index) => (
              <tr key={item._id} className="hover:bg-base-200/50 transition duration-200">
                <th>{index + 1}</th>
                <td>
                    <div className="font-bold text-base-content text-lg font-display">{item.subject}</div>
                    <div className="badge badge-ghost badge-sm mt-1 font-semibold">{item.class}</div>
                </td>
                <td>
                    <div className="font-bold text-gray-700">{item.studentEmail}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <FaMapMarkerAlt /> {item.location}
                    </div>
                </td>
                <td className="font-bold text-primary font-display text-lg">
                    {/* Fixed: Changed 'budget' to 'salary' to match your data structure */}
                    ৳{item.budget}
                </td>
                <td>
                    <StatusBadge status={item.status} />
                </td>
                <td className="text-center">
                   <ActionButtons item={item} onStatusChange={handleStatusChange} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ------------------------------------------------------
          VIEW 2: CARDS (Visible on Mobile & Tablet - up to lg) 
         ------------------------------------------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:hidden">
        {tuitions.map((item) => (
          <div key={item._id} className="card bg-base-100 shadow-md border border-gray-100">
            <div className="card-body p-5">
              
              {/* Card Top: Subject & Status */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="card-title text-lg font-display text-base-content">{item.subject}</h3>
                  <p className="text-sm text-primary font-bold">{item.class}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>

              {/* Card Details */}
              <div className="space-y-2 my-3 text-sm text-gray-500">
                 <div className="flex items-center gap-2">
                    <FaUser className="text-secondary" /> {item.studentEmail}
                 </div>
                 <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-secondary" /> {item.location}
                 </div>
                 <div className="flex items-center gap-2 font-bold text-base-content text-lg">
                    {/* Fixed: Changed 'budget' to 'salary' */}
                    ৳{item.budget} <span className="text-xs font-normal text-gray-400">/month</span>
                 </div>
              </div>

              {/* Card Description */}
              <div className="bg-base-200 p-3 rounded-lg text-xs text-gray-600 mb-4 line-clamp-3">
                <span className="font-bold">Note:</span> {item.description}
              </div>

              {/* Card Actions */}
              <div className="card-actions justify-end border-t pt-4">
                 <div className="flex gap-2 w-full">
                    <ActionButtons item={item} onStatusChange={handleStatusChange} isCard={true} />
                 </div>
              </div>

            </div>
          </div>
        ))}
      </div>
      
      {/* Empty State */}
      {tuitions.length === 0 && (
          <div className="text-center py-20 text-gray-400">
              No tuition posts found.
          </div>
      )}

    </div>
  )
}

/* --- REUSABLE SUB-COMPONENTS --- */

// 1. Status Badge Component
const StatusBadge = ({ status }) => {
    return (
        <span className={`badge font-bold p-3 text-white border-none
            ${status === 'Approved' ? 'bg-green-500' : ''}
            ${status === 'Rejected' ? 'bg-red-500' : ''}
            ${status === 'Booked' ? 'bg-blue-500' : ''} 
            ${!status || status === 'pending' ? 'bg-yellow-500' : ''}
        `}>
            {status || 'Pending'}
        </span>
    )
}
// 2. Action Buttons Component (Works for both Table and Card)
const ActionButtons = ({ item, onStatusChange, isCard }) => {
    return (
       <div className={`flex ${isCard ? 'w-full gap-3' : 'justify-center gap-2'}`}>
           {/* Approve Button */}
           <button 
               onClick={() => onStatusChange(item._id, 'Approved')}
               disabled={item.status === 'Approved'}
               className={`btn btn-sm ${isCard ? 'flex-1' : 'btn-circle'} btn-success text-white tooltip tooltip-top`}
               data-tip={!isCard ? "Approve" : ""}
           >
               <FaCheck /> {isCard && "Approve"}
           </button>

           {/* Reject Button */}
           <button 
               onClick={() => onStatusChange(item._id, 'Rejected')}
               disabled={item.status === 'Rejected'}
               className={`btn btn-sm ${isCard ? 'flex-1' : 'btn-circle'} btn-error text-white tooltip tooltip-top`}
               data-tip={!isCard ? "Reject" : ""}
           >
               <FaTimes /> {isCard && "Reject"}
           </button>
       </div>
    )
}

export default TuitionManagement