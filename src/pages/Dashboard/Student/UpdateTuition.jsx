import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { FaBook, FaMapMarkerAlt, FaDollarSign, FaChalkboardTeacher, FaSave } from 'react-icons/fa'
import Swal from 'sweetalert2'
import useAuth from '../../../hooks/useAuth' // Adjust path if needed
import useAxiosSecure from '../../../hooks/useAxiosSecure' // Adjust path if needed
// Already imported hooks, icons, Swal, etc.

const UpdateTuition = () => {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const axiosSecure = useAxiosSecure()

    const [loading, setLoading] = useState(true)
    const [tuitionData, setTuitionData] = useState({
        subject: '',
        class: '',
        location: '',
        salary: '',
        description: ''
    })

    // Fetch Existing Data
    useEffect(() => {
        axiosSecure.get(`/tuitions/${id}`)
            .then(res => {
                const data = res.data
                setTuitionData({
                    subject: data.subject || '',
                    class: data.class || '',
                    location: data.location || '',
                    salary: data.salary || data.budget || '',
                    description: data.description || ''
                })
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [id, axiosSecure])

    // Handle Update Submission
    const handleUpdate = async (e) => {
        e.preventDefault()
        const form = e.target

        const updatedData = {
            subject: form.subject.value,
            class: form.class.value,
            location: form.location.value,
            salary: form.salary.value,
            description: form.description.value
        }

        try {
            const res = await axiosSecure.patch(`/tuitions/${id}`, updatedData)
            if (res.data.modifiedCount > 0) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Tuition post updated successfully.',
                    icon: 'success',
                    confirmButtonColor: '#6B46F3'
                })
                navigate('/dashboard/my-posts')
            }
        } catch (error) {
            console.error(error)
            Swal.fire('Error', 'Something went wrong', 'error')
        }
    }

    if (loading) return (
        <div className="h-screen flex justify-center items-center">
            <span className="loading loading-spinner text-primary loading-lg"></span>
        </div>
    )

    return (
        <div className="w-full p-6 bg-base-200 min-h-screen font-body flex justify-center items-center">
            <div className="card w-full max-w-4xl bg-base-100 shadow-xl border border-base-200">
                <div className="card-body p-8">

                    <div className="border-b pb-4 mb-6">
                        <h2 className="text-3xl font-bold font-display text-base-content">Update Tuition</h2>
                        <p className="text-gray-500 mt-1 font-urbanist">Edit the details of your tuition requirement.</p>
                    </div>

                    <form onSubmit={handleUpdate}>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Subject */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-bold font-urbanist">Subject</span>
                                </label>
                                <div className="relative">
                                    <FaBook className="absolute left-3 top-3.5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="subject"
                                        defaultValue={tuitionData.subject}
                                        placeholder="e.g. Higher Math"
                                        className="input input-bordered w-full pl-10 focus:border-primary focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Class */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-bold font-urbanist">Class / Grade</span>
                                </label>
                                <div className="relative">
                                    <FaChalkboardTeacher className="absolute left-3 top-3.5 text-gray-400" />
                                    <select
                                        name="class"
                                        defaultValue={tuitionData.class || ""} // autofill the current value
                                        className="select select-bordered w-full pl-10 focus:border-primary focus:outline-none"
                                        required
                                    >
                                        <option value="" disabled>Select Class / Grade</option>
                                        <option value="Class 1">Class 1</option>
                                        <option value="Class 2">Class 2</option>
                                        <option value="Class 3">Class 3</option>
                                        <option value="Class 4">Class 4</option>
                                        <option value="Class 5">Class 5</option>
                                        <option value="Class 6">Class 6</option>
                                        <option value="Class 7">Class 7</option>
                                        <option value="Class 8">Class 8</option>
                                        <option value="Class 9">Class 9</option>
                                        <option value="Class 10">Class 10</option>
                                        <option value="HSC / 11">HSC / 11</option>
                                        <option value="HSC / 12">HSC / 12</option>
                                    </select>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-bold font-urbanist">Location</span>
                                </label>
                                <div className="relative">
                                    <FaMapMarkerAlt className="absolute left-3 top-3.5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="location"
                                        defaultValue={tuitionData.location}
                                        placeholder="e.g. Dhanmondi, Dhaka"
                                        className="input input-bordered w-full pl-10 focus:border-primary focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Salary */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-bold font-urbanist">Salary / Budget</span>
                                </label>
                                <div className="relative">
                                    <FaDollarSign className="absolute left-3 top-3.5 text-gray-400" />
                                    <input
                                        type="number"
                                        name="salary"
                                        defaultValue={tuitionData.salary}
                                        placeholder="e.g. 5000"
                                        className="input input-bordered w-full pl-10 focus:border-primary focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                        </div>

                        {/* Description */}
                        <div className="form-control mt-6">
                            <label className="label">
                                <span className="label-text font-bold font-urbanist">Description / Requirements</span>
                            </label>
                            <textarea
                                name="description"
                                defaultValue={tuitionData.description}
                                className="textarea textarea-bordered h-32 focus:border-primary focus:outline-none text-base"
                                placeholder="Describe your requirements (e.g. 3 days a week, prefer BUET student...)"
                            ></textarea>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 mt-8">
                            <button type="submit" className="btn btn-primary flex-1 font-urbanist text-white text-lg">
                                <FaSave /> Update Post
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="btn btn-ghost text-gray-500 font-urbanist"
                            >
                                Cancel
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    )
}

export default UpdateTuition
