import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useAxiosSecure from './useAxiosSecure';
import useAuth from './useAuth';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { compressImage } from '../utils/compressImage';

const IMAGE_API_URL = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMAGE_HOST_KEY}`;

/**
 * usePostTuition — encapsulates the full Post Tuition form logic.
 *
 * Handles:
 *  - react-hook-form registration, validation, and reset
 *  - image preview + removal
 *  - browser-side image compression (max 1200px, 82% JPEG) before ImgBB upload
 *  - submit: upload images → POST /tuitions → toast feedback
 *
 * Replaces SweetAlert2 with react-hot-toast so notifications follow the
 * app's theme (light/dark) automatically.
 */
const usePostTuition = () => {
  const { user }       = useAuth();
  const axiosSecure    = useAxiosSecure();
  const [images,    setImages]    = useState([]);
  const [previews,  setPreviews]  = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title:            '',
      subject:          '',
      class:            '',
      location:         '',
      budget:           '',
      schedule:         '',
      description:      '',
      studentGender:    '',
      preferredTutor:   '',
      teachingMode:     '',
      experienceNeeded: '',
    },
  });

  // Pre-fill hidden recruiter fields from the auth context
  useEffect(() => {
    if (user) {
      setValue('name',  user.displayName || '');
      setValue('email', user.email       || '');
    }
  }, [user, setValue]);

  // Revoke object URLs when the component unmounts to avoid memory leaks
  useEffect(() => {
    return () => previews.forEach(url => URL.revokeObjectURL(url));
  }, [previews]);

  /* ── Image helpers ─────────────────────────────────────────────── */

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 4) {
      toast.error('Maximum 4 images allowed');
      return;
    }
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImages(prev  => [...prev,  ...files]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setImages(   images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  /* ── Upload images (compressed) to ImgBB ──────────────────────── */

  const uploadImagesToImgBB = async () => {
    if (images.length === 0) return [];

    const uploadPromises = images.map(async (image) => {
      // Compress in the browser: 5 MB → ~200 KB, no visible quality loss
      const compressed = await compressImage(image, 1200, 0.82);
      const formData   = new FormData();
      formData.append('image', compressed, image.name);
      const res = await axios.post(IMAGE_API_URL, formData);
      return res.data.data.url;
    });

    return Promise.all(uploadPromises);
  };

  /* ── Form submit handler ───────────────────────────────────────── */

  const onPostTuition = async (data) => {
    const toastId = toast.loading('Uploading images…');

    try {
      setIsUploading(true);

      // Step 1: upload images (returns [] if none selected)
      const mediaUrls = await uploadImagesToImgBB();
      toast.loading('Submitting your post…', { id: toastId });

      // Step 2: POST to backend
      const payload = {
        title:            data.title,
        subject:          data.subject,
        class:            data.class,
        location:         data.location,
        description:      data.description,
        budget:           Number(data.budget),
        schedule:         data.schedule,
        studentGender:    data.studentGender,
        preferredTutor:   data.preferredTutor,
        teachingMode:     data.teachingMode,
        experienceNeeded: data.experienceNeeded,
        media:            mediaUrls,
        recruiterName:    user?.displayName,
        recruiterEmail:   user?.email,
        recruiterImage:   user?.photoURL,
        recruiterId:      user?.uid,
      };
      // NOTE: status and studentEmail are set server-side by the backend —
      // never trust client-submitted values for these fields.

      const res = await axiosSecure.post('/tuitions', payload);

      if (res.data.insertedId) {
        toast.success('Tuition posted! It will go live after admin approval.', {
          id: toastId,
          duration: 4000,
        });
        reset();
        setImages([]);
        setPreviews([]);
      } else {
        toast.error('Unexpected response from server. Please try again.', { id: toastId });
      }
    } catch (error) {
      console.error('Post tuition error:', error);
      const message =
        error?.response?.data?.message ||
        (error?.message?.includes('imgbb')
          ? 'Image upload failed. Check your ImgBB API key.'
          : 'Failed to post tuition. Please try again.');
      toast.error(message, { id: toastId });
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
    handleFormSubmit: handleSubmit(onPostTuition),
  };
};

export default usePostTuition;
