import { useEffect, useState } from 'react'
import { Link } from 'react-router' // Fixed 'react-router' to 'react-router-dom'
import { FaMapMarkerAlt, FaEdit, FaTrash, FaEye, FaDollarSign } from 'react-icons/fa'
import Swal from 'sweetalert2'
import useAuth from '../../../hooks/useAuth'
import useAxiosSecure from '../../../hooks/useAxiosSecure'
import LoadingSpinner from '../../../components/Shared/LoadingSpinner'

const MyTuitions = () => {
  const { user } = useAuth()
  const axiosSecure = useAxiosSecure()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Fetch Data
    if (user?.email) {
      axiosSecure.get(`/tuitions?studentEmail=${user.email}`)
        .then(res => {
          setPosts(res.data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [user, axiosSecure])

  // Delete Handler
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Delete this post?',
      text: "Tutors won't be able to apply anymore.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6B46F3', // Your Primary Color
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure.delete(`/tuitions/${id}`)
          .then(res => {
            if (res.data.deletedCount > 0) {
              Swal.fire('Deleted!', 'Your post has been removed.', 'success')
              const remaining = posts.filter(item => item._id !== id)
              setPosts(remaining)
            }
          })
      }
    })
  }
  if (loading) {
    return <LoadingSpinner/>;
  }

  return (
    <div className="w-full p-6 bg-base-200 min-h-screen font-body">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-base-content font-display">My Posted Tuitions</h2>
          <p className="text-gray-500 mt-1">Manage and track your tuition requirements.</p>
        </div>
        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-title text-gray-500 font-urbanist">Active Posts</div>
            <div className="stat-value text-primary font-display">{posts.length}</div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------
          VIEW 1: TABLE (Visible only on Large Devices: lg)
         -------------------------------------------------------- */}
      <div className="hidden lg:block overflow-x-auto bg-base-100 rounded-xl shadow-lg border border-base-200">
        <table className="table w-full">
          {/* Table Head */}
          <thead className="bg-primary/5 text-base-content font-display text-sm uppercase">
            <tr>
              <th className="py-4">Subject & Class</th>
              <th>Location</th>
              <th>Salary</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="font-medium text-gray-600">
            {posts.map((item) => (
              <tr key={item._id} className="hover:bg-base-200/50 transition duration-200">
                <td>
                  <div className="flex flex-col">
                    <span className="font-bold text-base-content text-lg font-display">{item.subject}</span>
                    <span className="badge badge-ghost badge-sm mt-1">{item.class}</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-secondary" />
                    <span>{item.location}</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-1 font-bold text-primary">
                    <FaDollarSign /> {item.budget}
                  </div>
                </td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
                <td>
                  <div className="flex justify-center gap-2">
                    <Link
                      to={`/dashboard/update-tuition/${item._id}`}
                      className="btn btn-sm btn-square btn-ghost text-primary hover:bg-primary hover:text-white transition-colors tooltip"
                      data-tip="Edit"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="btn btn-sm btn-square btn-ghost text-red-500 hover:bg-red-500 hover:text-white transition-colors tooltip"
                      data-tip="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --------------------------------------------------------
          VIEW 2: CARDS (Visible on Mobile & Tablet: md/sm)
         -------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-6">
        {posts.map((item) => (
          <div key={item._id} className="card bg-base-100 shadow-xl border border-gray-100 group hover:border-primary/50 transition duration-300">
            <div className="card-body p-6">

              {/* Card Top: Status & Title */}
              <div className="flex justify-between items-start mb-2">
                <div className="badge badge-outline badge-lg font-urbanist font-bold">{item.class}</div>
                <StatusBadge status={item.status} />
              </div>

              <h3 className="card-title font-display text-xl text-base-content mt-2 group-hover:text-primary transition-colors">
                {item.subject}
              </h3>

              {/* Card Details */}
              <div className="space-y-3 my-4 text-gray-500">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-secondary" />
                  <span className="text-sm">{item.location}</span>
                </div>
                <div className="flex items-center gap-2 text-base-content font-bold">
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <FaDollarSign className="w-3 h-3" />
                  </div>
                  <span>{item.salary} /month</span>
                </div>
              </div>

              {/* Card Actions */}
              <div className="card-actions justify-end mt-4 pt-4 border-t border-gray-100">
                <Link
                  to={`/dashboard/update-tuition/${item._id}`}
                  className="btn btn-sm btn-outline btn-primary font-urbanist"
                >
                  <FaEdit /> Edit
                </Link>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="btn btn-sm btn-ghost text-error hover:bg-error/10 font-urbanist"
                >
                  <FaTrash /> Delete
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {posts.length === 0 && !loading && (
        <div className="text-center py-20">
          <h3 className="text-xl font-display text-gray-400">No tuition posts found.</h3>
          <Link to="/dashboard/post-tuition" className="btn btn-primary mt-4 text-white font-urbanist">Post Your First Tuition</Link>
        </div>
      )}

    </div>
  )
}

/* --- Sub-Component for Consistent Badges --- */
const StatusBadge = ({ status }) => {
  const styles = {
    Approved: "bg-green-100 text-green-700 border-green-200",
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Rejected: "bg-red-100 text-red-700 border-red-200",
  }

  // Default to gray if status is unknown
  const activeStyle = styles[status] || "bg-gray-100 text-gray-600 border-gray-200"

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${activeStyle}`}>
      {status || 'Pending'}
    </span>
  )
}

export default MyTuitions