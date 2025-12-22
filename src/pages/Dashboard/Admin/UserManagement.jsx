
import { useQuery } from '@tanstack/react-query'
import { FaTrashAlt, FaUserEdit, FaSearch, FaTimes } from 'react-icons/fa'
import Swal from 'sweetalert2'
import useAxiosSecure from '../../../hooks/useAxiosSecure'
import { useForm } from 'react-hook-form'

const UserManagement = () => {
  const axiosSecure = useAxiosSecure()


  // 1. Fetch All Users
  const { data: users = [], refetch,  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await axiosSecure.get('/users')
      return res.data
    }
  })

  // 2. Handle Role Change
  const handleRoleChange = (user, newRole) => {
    Swal.fire({
      title: `Change role to ${newRole}?`,
      text: `Are you sure you want to make ${user.name} a ${newRole}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6B46F3',
      confirmButtonText: 'Yes, Update!'
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure.patch(`/users/role/${user._id}`, { role: newRole })
          .then(res => {
            if (res.data.modifiedCount > 0) {
              refetch()
              Swal.fire('Success', `User role updated to ${newRole}`, 'success')
            }
          })
      } else {
        refetch() // Reset UI if cancelled
      }
    })
  }

  // 3. Handle Delete User
  const handleDeleteUser = (user) => {
    Swal.fire({
      title: "Delete User?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure.delete(`/users/${user._id}`)
          .then(res => {
            if (res.data.deletedCount > 0) {
              refetch()
              Swal.fire("Deleted!", "User has been removed.", "success");
            }
          })
      }
    });
  }

  return (
    <div className="w-full p-6 bg-base-200 min-h-screen font-body">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold font-display text-base-content">User Management</h2>
          <p className="text-gray-500 mt-1 font-urbanist">Manage {users.length} registered users.</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto bg-base-100 rounded-xl shadow-lg border border-base-200">
        <table className="table w-full">
          <thead className="bg-primary/5 text-base-content font-display text-sm uppercase">
            <tr>
              <th>User Profile</th>
              <th>Role (Access Level)</th>
              <th>Update Info</th>
              <th className="text-center">Delete</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-base-200/50">
                <td>
                    <div className="flex items-center gap-3">
                        <div className="avatar">
                            <div className="mask mask-squircle w-12 h-12">
                                <img src={user.photoURL || "https://i.ibb.co/5GzXkwq/user.png"} alt="Avatar" />
                            </div>
                        </div>
                        <div>
                            <div className="font-bold text-base-content">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                    </div>
                </td>
                
                {/* Role Switcher */}
                <td>
                  <select 
                    defaultValue={user.role || 'Student'}
                    onChange={(e) => handleRoleChange(user, e.target.value)}
                    className="select select-bordered select-sm w-full max-w-xs focus:border-primary font-urbanist font-bold"
                  >
                    <option value="Student">Student</option>
                    <option value="Tutor">Tutor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>

                {/* Edit Button */}
                <td>
                   <button 
                     onClick={() => document.getElementById(`modal_${user._id}`).showModal()}
                     className="btn btn-sm btn-ghost text-primary hover:bg-primary/10"
                   >
                     <FaUserEdit className="text-lg" /> Edit
                   </button>
                   {/* Edit Modal (Included directly here for simplicity) */}
                   <EditUserModal user={user} axiosSecure={axiosSecure} refetch={refetch} />
                </td>

                {/* Delete Button */}
                <td className="text-center">
                  <button 
                    onClick={() => handleDeleteUser(user)} 
                    className="btn btn-sm btn-square btn-ghost text-red-500 hover:bg-red-50"
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Sub-component: Edit Modal
const EditUserModal = ({ user, axiosSecure, refetch }) => {
    const { register, handleSubmit } = useForm()
    const onSubmit = async (data) => {
        const res = await axiosSecure.patch(`/users/update/${user._id}`, data)
        if(res.data.modifiedCount > 0){
            refetch()
            document.getElementById(`modal_${user._id}`).close()
            Swal.fire('Updated', 'User info updated', 'success')
        }
    }
    return (
        <dialog id={`modal_${user._id}`} className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Update {user.name}</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="py-4 space-y-3">
                <input {...register("name")} defaultValue={user.name} placeholder="Name" className="input input-bordered w-full" />
                <input {...register("image")} defaultValue={user.image} placeholder="Photo URL" className="input input-bordered w-full" />
                <button className="btn btn-primary w-full text-white">Save Changes</button>
            </form>
            <form method="dialog" className="modal-backdrop"><button>close</button></form>
          </div>
        </dialog>
    )
}

export default UserManagement