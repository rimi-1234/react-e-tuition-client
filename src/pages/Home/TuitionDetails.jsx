import { useParams, Link, useNavigate } from 'react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  FaMapMarkerAlt, FaChalkboardTeacher, FaCalendarAlt, 
  FaClock, FaArrowLeft, FaCheckCircle, FaSpinner, 
  FaGraduationCap, FaWallet, FaUserGraduate, FaStar, FaQuoteLeft
} from 'react-icons/fa'
import { useState } from 'react'
import Swal from 'sweetalert2'
import useAxiosSecure from '../../hooks/useAxiosSecure'
import useAuth from '../../hooks/useAuth'

const TuitionDetails = () => {
  const { id } = useParams()
  const axiosSecure = useAxiosSecure()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeImg, setActiveImg] = useState(0)

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
    }
  })

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="font-bold text-gray-400 animate-pulse">Loading Tuition Details...</p>
      </div>
    </div>
  )

  const { 
    subject, class: className, location, budget, schedule, 
    description, recruiterImage, recruiterName, postedDate, _id, media = [] 
  } = tuition;

  const handleApply = (e) => {
    e.preventDefault();
    const form = e.target;
    const applicationData = {
        tuitionId: _id,
        tuitionSubject: subject,
        tutorEmail: user?.email,
        qualifications: form.qualifications.value,
        experience: form.experience.value,
        expectedSalary: form.expectedSalary.value,
        status: 'Pending',
        appliedDate: new Date()
    }
    mutate(applicationData);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      
      {/* --- HERO / HEADER --- */}
      <div className="bg-white border-b border-gray-100 pt-10 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <Link to="/tuitions" className="inline-flex items-center text-gray-400 hover:text-primary mb-8 font-bold text-sm transition-all group">
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> BACK TO LISTINGS
          </Link>
          
          <div className="flex flex-col lg:flex-row justify-between gap-8">
            <div className="space-y-4">
              <div className="flex gap-2">
                <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                  {className}
                </span>
                <span className="bg-secondary/10 text-secondary px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                  {schedule} Days/Week
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
                {subject} <span className="text-primary">Tutor</span> Needed
              </h1>
              <div className="flex items-center text-gray-500 gap-4 font-medium">
                <span className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-red-400"/> {location}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                <span>Posted {new Date(postedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric'})}</span>
              </div>
            </div>

            <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-2xl shadow-primary/30 min-w-[280px] flex flex-col justify-center text-center lg:text-left">
               <p className="text-primary-content/70 font-bold uppercase tracking-tighter text-sm mb-1">Monthly Budget</p>
               <h2 className="text-5xl font-black">৳{budget?.toLocaleString()}</h2>
               <p className="mt-2 text-primary-content/60 text-xs italic">Negotiable based on experience</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* --- LEFT SIDE: CONTENT (8 Cols) --- */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* 1. MEDIA GALLERY */}
            {media.length > 0 && (
              <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="aspect-video w-full overflow-hidden rounded-2xl bg-gray-100">
                  <img src={media[activeImg]} alt="Tuition Media" className="w-full h-full object-cover transition-all duration-500" />
                </div>
                {media.length > 1 && (
                  <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
                    {media.map((img, index) => (
                      <button 
                        key={index} 
                        onClick={() => setActiveImg(index)}
                        className={`w-24 h-20 rounded-xl overflow-hidden border-4 transition-all flex-shrink-0 ${activeImg === index ? 'border-primary' : 'border-transparent opacity-60'}`}
                      >
                        <img src={img} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. DESCRIPTION SECTON */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-primary rounded-full"></span> Description & Overview
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line italic font-medium">
                "{description || "No specific details provided for this tuition."}"
              </p>
            </div>

            {/* 3. KEY SPECIFICATIONS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <SpecCard icon={<FaUserGraduate/>} label="Student Level" value={className} color="bg-blue-50 text-blue-600" />
               <SpecCard icon={<FaCalendarAlt/>} label="Weekly Schedule" value={`${schedule} Days Per Week`} color="bg-purple-50 text-purple-600" />
               <SpecCard icon={<FaWallet/>} label="Salary" value={`৳${budget} / Month`} color="bg-emerald-50 text-emerald-600" />
               <SpecCard icon={<FaGraduationCap/>} label="Subject" value={subject} color="bg-orange-50 text-orange-600" />
            </div>

            {/* 4. REVIEWS SECTION (Static Design) */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-gray-900">Guardian Reviews</h3>
                  <div className="flex items-center gap-1 text-yellow-500 font-bold">
                    <FaStar/> <FaStar/> <FaStar/> <FaStar/> <FaStar/> 
                    <span className="text-gray-400 ml-2">(14 Reviews)</span>
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="p-6 bg-gray-50 rounded-2xl relative">
                    <FaQuoteLeft className="absolute top-4 right-6 text-gray-200 text-4xl"/>
                    <p className="text-gray-600 italic mb-4">"The previous tutor we found through this platform was exceptional for {subject}. Highly recommend hiring based on verified qualifications."</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20"></div>
                      <span className="font-bold text-gray-800">Sarah Ahmed</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* --- RIGHT SIDE: ACTION SIDEBAR (4 Cols) --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-10">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-50">
                   <img src={recruiterImage} className="w-16 h-16 rounded-2xl object-cover" alt="Recruiter" />
                   <div>
                     <p className="text-[10px] font-black text-primary uppercase tracking-widest">Posted By</p>
                     <h4 className="text-xl font-black text-gray-900">{recruiterName}</h4>
                   </div>
                </div>

                <div className="space-y-4">
                   <button 
                    onClick={() => user ? document.getElementById('apply_modal').showModal() : Swal.fire('Login Required', 'Please login to apply', 'warning')}
                    className="btn btn-primary w-full h-16 rounded-2xl text-lg font-black shadow-xl shadow-primary/20"
                   >
                     Apply For This Job
                   </button>
                   <button className="btn btn-outline border-2 w-full h-16 rounded-2xl font-black">
                     Save To Favorites
                   </button>
                </div>

                <div className="mt-8 space-y-4 bg-yellow-50/50 p-6 rounded-2xl border border-yellow-100">
                   <h5 className="font-bold text-yellow-800 text-sm flex items-center gap-2">
                     <FaCheckCircle/> Safety Protocol
                   </h5>
                   <ul className="text-xs text-yellow-700/80 space-y-2 font-medium">
                     <li>• Never pay any "processing fees" to recruiters.</li>
                     <li>• Always verify the location in daylight.</li>
                     <li>• Report suspicious postings immediately.</li>
                   </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- MODAL (Same as your code but styled) --- */}
      <dialog id="apply_modal" className="modal">
        <div className="modal-box rounded-[2rem] p-10 max-w-2xl">
          <h3 className="font-black text-3xl mb-2">Submit Application</h3>
          <p className="text-gray-400 font-medium mb-8 uppercase text-xs tracking-[0.2em]">Subject: {subject} • {className}</p>
          <form onSubmit={handleApply} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label font-bold text-gray-700">Full Name</label>
                <input type="text" value={user?.displayName} readOnly className="input input-bordered rounded-xl bg-gray-50" />
              </div>
              <div className="form-control">
                <label className="label font-bold text-gray-700">Email Address</label>
                <input type="text" value={user?.email} readOnly className="input input-bordered rounded-xl bg-gray-50" />
              </div>
            </div>
            <div className="form-control">
                <label className="label font-bold text-gray-700">Current Qualifications</label>
                <input name="qualifications" placeholder="e.g. BSc in Math (NSU)" className="input input-bordered rounded-xl focus:border-primary" required />
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div className="form-control">
                    <label className="label font-bold text-gray-700">Years of Experience</label>
                    <input name="experience" placeholder="e.g. 3 years" className="input input-bordered rounded-xl" required />
                </div>
                <div className="form-control">
                    <label className="label font-bold text-gray-700">Desired Salary</label>
                    <input name="expectedSalary" type="number" defaultValue={budget} className="input input-bordered rounded-xl" required />
                </div>
            </div>
            <div className="modal-action">
              <button type="button" className="btn btn-ghost font-bold" onClick={() => document.getElementById('apply_modal').close()}>Cancel</button>
              <button type="submit" disabled={isApplying} className="btn btn-primary px-10 rounded-xl font-black">
                {isApplying ? <FaSpinner className="animate-spin"/> : 'Send Application'}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  )
}

const SpecCard = ({ icon, label, value, color }) => (
  <div className={`p-6 rounded-[2rem] border border-gray-100 bg-white flex items-center gap-5 transition-all hover:shadow-md`}>
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-2xl`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="font-bold text-gray-800 text-lg leading-tight">{value}</p>
    </div>
  </div>
)

export default TuitionDetails;