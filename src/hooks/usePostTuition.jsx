import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import useAxiosSecure from './useAxiosSecure';
import useAuth from './useAuth';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const image_API_URL = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMAGE_HOST_KEY}`;

const usePostTuition = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const [images, setImages] = useState([]); 
    const [previews, setPreviews] = useState([]); 
    const [isUploading, setIsUploading] = useState(false);

    const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            name: user?.displayName || '',
            email: user?.email || '',
            title: '',
            subject: '',
            class: '',
            location: '',
            budget: '',
            schedule: '',
            description: '',
            // --- NEW KEY SPECIFICATIONS ---
            studentGender: '',     // e.g., Male/Female
            preferredTutor: '',    // e.g., Male/Female/Any
            teachingMode: '',      // e.g., Home Visit/Online/Group
            experienceNeeded: '',  // e.g., Undergraduate/Professional
        }
    });

    useEffect(() => {
        return () => previews.forEach(url => URL.revokeObjectURL(url));
    }, [previews]);

    useEffect(() => {
        if (user) {
            setValue('name', user.displayName);
            setValue('email', user.email);
        }
    }, [user, setValue]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 4) {
            return Swal.fire("Limit!", "Maximum 4 images allowed", "warning");
        }
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImages(prev => [...prev, ...files]);
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        URL.revokeObjectURL(previews[index]); 
        setImages(images.filter((_, i) => i !== index));
        setPreviews(previews.filter((_, i) => i !== index));
    };

    const uploadImagesToImgBB = async () => {
        if (images.length === 0) return [];
        const uploadPromises = images.map(async (image) => {
            const formData = new FormData();
            formData.append('image', image);
            const res = await axios.post(image_API_URL, formData);
            return res.data.data.url;
        });
        return Promise.all(uploadPromises);
    };

    const onPostTuition = async (data) => {
        const confirmResult = await Swal.fire({
            title: "Confirm Post?",
            text: "This tuition will be reviewed by admins.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#6B46F3",
            confirmButtonText: "Post Now"
        });

        if (!confirmResult.isConfirmed) return;

        try {
            setIsUploading(true);
            const finalImageUrls = await uploadImagesToImgBB();

            const payload = {
                title: data.title,
                subject: data.subject,
                class: data.class,
                location: data.location,
                description: data.description,
                budget: Number(data.budget),
                schedule: data.schedule,
                
                // --- NEW KEY SPECIFICATIONS IN PAYLOAD ---
                studentGender: data.studentGender,
                preferredTutor: data.preferredTutor,
                teachingMode: data.teachingMode,
                experienceNeeded: data.experienceNeeded,
                
                media: finalImageUrls, 
                status: 'Pending',
                postedDate: new Date().toISOString(),
                recruiterId: user?.uid,
                recruiterName: user?.displayName,
                recruiterEmail: user?.email,
                recruiterImage: user?.photoURL
            };

            const res = await axiosSecure.post('/tuitions', payload);
            
            if (res.data.insertedId) {
                reset();
                setImages([]);
                setPreviews([]);
                Swal.fire({
                    icon: "success",
                    title: "Submitted!",
                    text: "Your tuition job is pending approval.",
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Failed to upload images or post data.", "error");
        } finally {
            setIsUploading(false);
        }
    };

    return { 
        register, 
        errors, 
        isSubmitting: isSubmitting || isUploading, 
        previews, 
        handleImageChange, 
        removeImage, 
        handleFormSubmit: handleSubmit(onPostTuition) 
    };
};

export default usePostTuition;