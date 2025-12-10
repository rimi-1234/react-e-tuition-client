import React from 'react';
import Swal from 'sweetalert2';

import useAxiosSecure from './useAxiosSecure';
import useAuth from './useAuth';
import { useForm } from 'react-hook-form';

const usePostTuition = () => {
    const { user } = useAuth();
    console.log(user);
    
    const axiosSecure = useAxiosSecure();
    console.log(axiosSecure);
    

    // 1. Initialize Form State
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm({
        defaultValues: {
            name: user?.displayName || '',
            email: user?.email || '',
            subject: '',
            class: '',
            location: '',
            budget: '',
            schedule: '',
            notes: ''
        }
    });

    // 2. The Submit Logic (API & Alerts)
    const onPostTuition = async (data) => {
        
        // A. Confirmation Alert
        const confirmResult = await Swal.fire({
            title: "Are you sure?",
            text: "This tuition request will be posted for tutors to see.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#6B46F3", // Edurock Primary
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Post It!"
        });

        if (!confirmResult.isConfirmed) return;

        // B. Data Formatting (Prepare Payload)
        const payload = {
            ...data,
            budget: Number(data.budget), // Ensure number for DB sorting
            status: 'Pending',           // HARDCODED REQUIREMENT
            postedDate: new Date().toISOString(),
            recruiterId: user?.uid,
            recruiterImage: user?.photoURL
        };

        // C. API Call
        try {
            const res = await axiosSecure.post('/tuitions', payload);

            if (res.data.insertedId) {
                reset(); // Clear form on success
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: "Your tuition request is pending review.",
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error("Post Error:", error);
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something went wrong. Please try again later.",
            });
        }
    };
    return {
        register,
        errors,
        isSubmitting,
        handleFormSubmit: handleSubmit(onPostTuition) // Pre-wrap the submit handler
    };
};

export default usePostTuition;