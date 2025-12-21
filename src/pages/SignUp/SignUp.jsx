import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';
import axios from 'axios';
import Swal from 'sweetalert2';
import { TbFidgetSpinner } from 'react-icons/tb';

import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import SocialLogin from '../SocialLogin/SocialLogin';

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { createUser, updateUserProfile } = useAuth();
  
  const location = useLocation();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  // Local state for loading spinner
  const [loading, setLoading] = useState(false);

  const handleRegistration = async (data) => {
    setLoading(true);
    const profileImg = data.photo[0];
    const image_API_URL = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMAGE_HOST_KEY}`;

    try {
      // 1. Upload image to ImgBB (Do this first or parallel to save time, but usually sequential is safer)
      const formData = new FormData();
      formData.append('image', profileImg);
      
      const res = await axios.post(image_API_URL, formData);
      const photoURL = res.data.data.url;

      // 2. Register user in Firebase
      await createUser(data.email, data.password);

      // 3. Update Firebase Profile (Display Name & Photo)
      await updateUserProfile(data.name, photoURL);

      // 4. Save user to MongoDB
      const userInfo = {
        email: data.email,
        displayName: data.name,
        photoURL: photoURL || "",
        role: data.role || "Student",
        phone: data.phone || "",
      };

      const dbRes = await axiosSecure.post('/users', userInfo);

      if (dbRes.data.insertedId || dbRes.data.upsertedId || dbRes.data.userId) {
        Swal.fire({
          title: "Welcome!",
          text: "Registration successful.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
        navigate(location.state || '/');
      }

    } catch (error) {
      console.error(error);
      let errorMsg = error.message || "Something went wrong.";
      if (error.code === "auth/email-already-in-use") {
        errorMsg = "This email is already registered.";
      }
      Swal.fire({
        title: "Registration Failed",
        text: errorMsg,
        icon: "error",
        confirmButtonColor: "#EF4444" // red-500
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex justify-center items-center min-h-screen bg-base-100 font-body text-base-content py-10'>
      <div className='w-full max-w-2xl p-6 sm:p-10 bg-white rounded-2xl shadow-xl border border-primary/10'>
        
        {/* Header */}
        <div className='mb-8 text-center'>
          <h1 className='text-4xl font-bold font-display text-gray-900'>
            Create Account
          </h1>
          <p className='text-sm text-gray-500 mt-2'>
            Join Zap Shift to start your journey
          </p>
        </div>

        <form onSubmit={handleSubmit(handleRegistration)} className='space-y-6'>
          
          {/* Grid Layout for Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-gray-600">Full Name</span>
              </label>
              <input 
                type="text" 
                placeholder="John Doe" 
                className="input input-bordered w-full focus:input-primary bg-gray-50" 
                {...register('name', { required: true })} 
              />
              {errors.name && <span className='text-red-500 text-xs mt-1'>Name is required.</span>}
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-gray-600">Email Address</span>
              </label>
              <input 
                type="email" 
                placeholder="email@example.com" 
                className="input input-bordered w-full focus:input-primary bg-gray-50" 
                {...register('email', { required: true })} 
              />
              {errors.email && <span className='text-red-500 text-xs mt-1'>Email is required.</span>}
            </div>

            {/* Phone */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-gray-600">Phone Number</span>
              </label>
              <input 
                type="tel" 
                placeholder="+880..." 
                className="input input-bordered w-full focus:input-primary bg-gray-50" 
                {...register('phone', { required: true })} 
              />
              {errors.phone && <span className='text-red-500 text-xs mt-1'>Phone is required.</span>}
            </div>

            {/* Role */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-gray-600">I am a...</span>
              </label>
              <select 
                className="select select-bordered w-full focus:select-primary bg-gray-50"
                defaultValue=""
                {...register('role', { required: true })}
              >
                <option value="" disabled>Select Role</option>
                <option value="Student">Student</option>
                <option value="Tutor">Tutor</option>
              </select>
              {errors.role && <span className='text-red-500 text-xs mt-1'>Role is required.</span>}
            </div>

            {/* Photo Upload - Spans full width on mobile, half on desktop */}
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text font-medium text-gray-600">Profile Picture</span>
              </label>
              <input 
                type="file" 
                className="file-input file-input-bordered file-input-primary w-full bg-gray-50" 
                {...register('photo', { required: true })} 
              />
              {errors.photo && <span className='text-red-500 text-xs mt-1'>Photo is required.</span>}
            </div>

            {/* Password - Spans full width */}
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text font-medium text-gray-600">Password</span>
              </label>
              <input 
                type="password" 
                placeholder="Create a strong password" 
                className="input input-bordered w-full focus:input-primary bg-gray-50" 
                {...register('password', {
                  required: "Password is required",
                  minLength: { value: 6, message: "Must be 6+ characters" },
                  pattern: {
                    value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
                    message: "Must contain Uppercase, Lowercase, Number, and Special Char"
                  }
                })} 
              />
              {errors.password && <span className='text-red-500 text-xs mt-1'>{errors.password.message}</span>}
            </div>

          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full btn btn-primary text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all ${loading ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              {loading ? (
                 <TbFidgetSpinner className="animate-spin text-2xl" />
              ) : (
                "Register"
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className='flex items-center pt-6 space-x-1'>
          <div className='flex-1 h-px bg-gray-200'></div>
          <p className='px-3 text-sm text-gray-400 font-urbanist'>
            Or register with
          </p>
          <div className='flex-1 h-px bg-gray-200'></div>
        </div>

        {/* Social Login */}
        <div className="mt-4">
          <SocialLogin />
        </div>

        {/* Footer Link */}
        <p className='mt-6 text-sm text-center text-gray-500'>
          Already have an account?{' '}
          <Link 
            to="/login" 
            className='font-bold text-primary hover:text-secondary hover:underline transition-colors'
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;