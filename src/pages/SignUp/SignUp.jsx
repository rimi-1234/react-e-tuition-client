import React from 'react';
import { useForm } from 'react-hook-form';

import { Link, useLocation, useNavigate } from 'react-router';

import axios from 'axios';

import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';
import SocialLogin from '../SocialLogin/SocialLogin';


const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { createUser, updateUserProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

const handleRegistration = async (data) => {
  const profileImg = data.photo[0];
  const image_API_URL = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMAGE_HOST_KEY}`;

  try {
    // 1️⃣ Register user in Firebase
    await createUser(data.email, data.password);

    // 2️⃣ Upload image to ImgBB
    const formData = new FormData();
    formData.append('image', profileImg);
    const res = await axios.post(image_API_URL, formData);
    const photoURL = res.data.data.url;

    // 3️⃣ Save user to MongoDB
    const userInfo = {
      email: data.email,
      displayName: data.name,
      photoURL: photoURL || "",
      role: data.role || "Student",
      phone: data.phone || "",
    };

    const dbRes = await axiosSecure.post('/users', userInfo);
    console.log(dbRes);
    
    if (dbRes.data.userId) {
      Swal.fire({
        title: "Registration Successful!",
        text: "Your account has been created successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });
    }

    // 4️⃣ Update Firebase Profile
    await updateUserProfile(data.name, photoURL);

    // 5️⃣ Navigate
    navigate(location.state || '/');

  } catch (error) {
    let errorMsg = error.message || "Something went wrong.";

    if (error.code === "auth/email-already-in-use") {
      errorMsg = "This email is already registered.";
    }

    Swal.fire({
      title: "Registration Failed!",
      text: errorMsg,
      icon: "error",
      confirmButtonText: "Try Again",
    });
  }
};


  return (
    <div className="card bg-base-100 w-full mx-auto max-w-sm shrink-0 shadow-2xl">
      <h3 className="text-3xl text-center">Welcome to Zap Shift</h3>
      <p className='text-center'>Please Register</p>

      <form className="card-body" onSubmit={handleSubmit(handleRegistration)}>
        <fieldset className="fieldset">

          {/* Name */}
          <label className="label">Name</label>
          <input type="text" {...register('name', { required: true })} className="input" placeholder="Your Name" />
          {errors.name && <p className='text-red-500'>Name is required.</p>}

          {/* Photo */}
          <label className="label">Photo</label>
          <input type="file" {...register('photo', { required: true })} className="file-input" />
          {errors.photo && <p className='text-red-500'>Photo is required.</p>}

          {/* Email */}
          <label className="label">Email</label>
          <input type="email" {...register('email', { required: true })} className="input" placeholder="Email" />
          {errors.email && <p className='text-red-500'>Email is required.</p>}

          {/* Password */}
          <label className="label">Password</label>
          <input type="password" {...register('password', {
            required: true,
            minLength: 6,
            pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/
          })} className="input" placeholder="Password" />
          {errors.password?.type === 'required' && <p className='text-red-500'>Password is required.</p>}
          {errors.password?.type === 'minLength' && <p className='text-red-500'>Password must be 6 characters or longer</p>}
          {errors.password?.type === 'pattern' && <p className='text-red-500'>Password must include uppercase, lowercase, number, and special character</p>}

          {/* Role */}
          <label className="label">Role</label>
          <select {...register('role', { required: true })} className="select select-bordered w-full">
            <option value="">Select Role</option>
            <option value="Student">Student</option>
            <option value="Tutor">Tutor</option>
          </select>
          {errors.role && <p className='text-red-500'>Role is required.</p>}

          {/* Phone */}
          <label className="label">Phone</label>
          <input type="tel" {...register('phone', { required: true })} className="input" placeholder="Phone Number" />
          {errors.phone && <p className='text-red-500'>Phone number is required.</p>}

          <div><a className="link link-hover">Forgot password?</a></div>
          <button className="btn btn-neutral mt-4">Register</button>
        </fieldset>

        <p>Already have an account? <Link state={location.state} className='text-blue-400 underline' to="/login">Login</Link></p>
      </form>
     

      <SocialLogin></SocialLogin>
  
    </div>
  );
};

export default Register;
