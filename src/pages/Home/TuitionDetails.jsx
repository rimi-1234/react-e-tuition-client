import { useParams, Link, useNavigate } from 'react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  FaMapMarkerAlt, FaChalkboardTeacher, FaCalendarAlt, 
  FaClock, FaArrowLeft, FaCheckCircle, FaSpinner 
} from 'react-icons/fa'
import { useState } from 'react'
import Swal from 'sweetalert2' // or use react-hot-toast
import useAxiosSecure from '../../hooks/useAxiosSecure'
import useAuth from '../../hooks/useAuth' // Assuming you have this hook

const TuitionDetails = () => {
  const { id } = useParams()
  const axiosSecure = useAxiosSecure()
  const { user } = useAuth() // Get logged in user
  const navigate = useNavigate()

  // --- 1. Fetch Tuition Data ---
  const { data: tuition = {}, isLoading } = useQuery({
    queryKey: ['tuition', id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/tuitions/${id}`)
      return res.data
    }
  })

  // --- 2. Application Mutation ---
  const { mutate, isPending: isApplying } = useMutation({
    mutationFn: async (applicationData) => {
        const res = await axiosSecure.post('/applications', applicationData);
        return res.data;
    },
    onSuccess: (data) => {
        if(data.insertedId){
            Swal.fire('Success', 'Application submitted successfully!', 'success');
            document.getElementById('apply_modal').close();
        }
    },
    onError: (error) => {
        Swal.fire('Error', error.response?.data?.message || 'Something went wrong', 'error');
    }
  })

  // --- 3. Handle Form Submit ---
  const handleApply = (e) => {
    e.preventDefault();
    const form = e.target;
    
    // Construct Application Data
    const applicationData = {
        tuitionId: tuition._id,
        tuitionSubject: tuition.subject, // Store for easy display on dashboard
        tuitionLocation: tuition.location,
        recruiterEmail: tuition.recruiterEmail || tuition.email, // Ensure you have this in DB
        tutorName: user?.displayName,
        tutorEmail: user?.email,
        qualifications: form.qualifications.value,
        experience: form.experience.value,
        expectedSalary: form.expectedSalary.value,
        status: 'Pending',
        appliedDate: new Date()
    }

    mutate(applicationData);
  }

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  // Destructure Data
  const { 
    subject, class: className, location, budget, schedule, 
    notes, recruiterImage, name, postedDate, _id 
  } = tuition;

  // Gradient Logic
  const gradients = [
    "from-purple-600 to-indigo-700",
    "from-blue-600 to-cyan-700",
    "from-orange-500 to-red-600",
    "from-emerald-500 to-teal-600"
  ];
  const gradientIndex = _id ? _id.charCodeAt(_id.length - 1) % gradients.length : 0;
  const selectedGradient = gradients[gradientIndex];

  return (
    <div className="min-h-screen bg-base-100 font-sans text-gray-800 pb-20">
      
      {/* --- HEADER SECTION (Motion Added) --- */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative bg-gradient-to-r ${selectedGradient} py-20 px-6`}
      >
        <div className="max-w-7xl mx-auto">
            <Link to="/tuitions" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
                <FaArrowLeft className="mr-2" /> Back to Tuitions
            </Link>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-bold border border-white/30 inline-block mb-4">
                        {className}
                    </span>
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl md:text-5xl font-display font-bold text-white mb-2"
                    >
                        {subject} Tutor Needed
                    </motion.h1>
                    <div className="flex items-center text-white/90 gap-2 text-lg">
                        <FaMapMarkerAlt /> {location}
                    </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 text-white min-w-[200px]">
                    <p className="text-sm opacity-80">Salary / Budget</p>
                    <p className="text-3xl font-bold font-display">৳{budget}</p>
                    <p className="text-xs opacity-80">per month</p>
                </div>
            </div>
        </div>
      </motion.div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: DETAILS */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2 space-y-8"
            >
                {/* 1. Job Info Card */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <FaChalkboardTeacher className="text-primary"/> Tuition Overview
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoItem icon={<FaCalendarAlt />} label="Days per Week" value={`${schedule} Days`} />
                        <InfoItem icon={<FaClock />} label="Posted Date" value={new Date(postedDate).toLocaleDateString()} />
                    </div>
                </div>

                {/* 2. Notes / Description */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Requirements & Notes</h3>
                    <div className="prose text-gray-600 leading-relaxed whitespace-pre-line">
                        {notes || "No additional notes provided."}
                    </div>
                </div>

                {/* 3. Posted By */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="avatar">
                        <div className="w-14 rounded-full border border-gray-200">
                            <img src={recruiterImage || "https://i.ibb.co/v6zPZF2j/cover.jpg"} alt={name} />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Posted by</p>
                        <h4 className="font-bold text-lg text-gray-900 capitalize">{name}</h4>
                    </div>
                </div>
            </motion.div>

            {/* RIGHT COLUMN: SIDEBAR ACTION */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-1"
            >
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 sticky top-24">
                    <div className="text-center mb-6">
                        <p className="text-gray-500 text-sm mb-1">Job ID: {_id?.slice(-6).toUpperCase()}</p>
                        <h3 className="text-2xl font-bold text-gray-900">Interested?</h3>
                    </div>

                    <div className="space-y-4">
                        <button 
                            className="btn btn-primary w-full h-14 text-lg font-bold shadow-lg shadow-primary/30"
                            onClick={() => {
                                if(user) {
                                    document.getElementById('apply_modal').showModal()
                                } else {
                                    Swal.fire('Login Required', 'Please login to apply.', 'warning')
                                    // navigate('/login')
                                }
                            }}
                        >
                            Apply Now
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Safety Tips</h4>
                        <ul className="text-sm text-gray-500 space-y-2">
                            <li className="flex gap-2"><FaCheckCircle className="text-green-500 flex-shrink-0 mt-0.5"/> Verify location before going.</li>
                            <li className="flex gap-2"><FaCheckCircle className="text-green-500 flex-shrink-0 mt-0.5"/> Discuss salary clearly.</li>
                        </ul>
                    </div>
                </div>
            </motion.div>

        </div>
      </div>

      {/* --- APPLY MODAL --- */}
      <dialog id="apply_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box p-8 max-w-lg">
            <h3 className="font-bold text-2xl mb-1">Apply Now</h3>
            <p className="text-gray-500 mb-6 text-sm">
                Apply for <span className="font-semibold text-gray-700">{subject}</span>
            </p>
            
            <form onSubmit={handleApply} className="space-y-4">
                
                {/* Read-Only Fields */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-control">
                        <label className="label"><span className="label-text">Name</span></label>
                        <input type="text" value={user?.displayName || ''} readOnly className="input input-bordered bg-gray-100 text-gray-500" />
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text">Email</span></label>
                        <input type="text" value={user?.email || ''} readOnly className="input input-bordered bg-gray-100 text-gray-500" />
                    </div>
                </div>

                {/* Tutor Inputs */}
                <div className="form-control">
                    <label className="label"><span className="label-text">Qualifications</span></label>
                    <input name="qualifications" type="text" placeholder="e.g. BSc in Math, BUET" className="input input-bordered focus:border-primary" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="form-control">
                        <label className="label"><span className="label-text">Experience</span></label>
                        <input name="experience" type="text" placeholder="e.g. 2 years" className="input input-bordered focus:border-primary" required />
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text">Expected Salary</span></label>
                        <input name="expectedSalary" type="number" defaultValue={budget} placeholder="Enter Amount" className="input input-bordered focus:border-primary" required />
                    </div>
                </div>

                <div className="modal-action pt-4">
                    <button 
                        type="button" 
                        className="btn btn-ghost" 
                        onClick={()=>document.getElementById('apply_modal').close()}
                        disabled={isApplying}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary px-8"
                        disabled={isApplying}
                    >
                        {isApplying ? <><FaSpinner className="animate-spin"/> Submitting...</> : 'Confirm Application'}
                    </button>
                </div>
            </form>
        </div>
        <form method="dialog" className="modal-backdrop">
            <button>close</button>
        </form>
      </dialog>

    </div>
  )
}

const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
        <div className="text-2xl text-primary bg-white p-3 rounded-lg shadow-sm">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 mb-0.5">{label}</p>
            <p className="font-bold text-gray-800">{value}</p>
        </div>
    </div>
)

export default TuitionDetails