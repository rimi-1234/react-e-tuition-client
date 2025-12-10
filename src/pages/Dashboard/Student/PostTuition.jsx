import React from 'react';

import { BookOpen, MapPin, DollarSign, Calendar, FileText, User } from 'lucide-react';
import usePostTuition from '../../../hooks/usePostTuition';

const PostTuition = () => {
    
    // Extract logic from the hook
    const { register, errors, isSubmitting, handleFormSubmit } = usePostTuition();

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 font-body">
            
            {/* Header Section */}
            <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold font-display text-primary">Post New Tuition</h2>
                <p className="text-base-content/70 mt-2">Fill in the details to find your perfect tutor.</p>
            </div>

            {/* The Form */}
            <form onSubmit={handleFormSubmit} className="bg-base-100 shadow-xl rounded-2xl p-6 md:p-10 border border-base-200">
                
                {/* 1. Read-Only User Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-base-200/50 rounded-lg">
                    <div className="form-control">
                        <label className="label text-xs uppercase tracking-wide font-bold text-base-content/50">Recruiter Name</label>
                        <div className="flex items-center gap-2 font-semibold opacity-70">
                            <User size={16} />
                            <input {...register('name')} readOnly className="bg-transparent outline-none w-full" />
                        </div>
                    </div>
                    <div className="form-control">
                        <label className="label text-xs uppercase tracking-wide font-bold text-base-content/50">Email</label>
                        <div className="flex items-center gap-2 font-semibold opacity-70">
                            <span className="w-4">@</span>
                            <input {...register('email')} readOnly className="bg-transparent outline-none w-full" />
                        </div>
                    </div>
                </div>

                <div className="divider">Tuition Details</div>

                {/* 2. Subject & Class */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                    <div className="form-control">
                        <label className="label font-semibold">Subject <span className="text-error">*</span></label>
                        <label className={`input input-bordered flex items-center gap-2 focus-within:input-primary ${errors.subject ? 'input-error' : ''}`}>
                            <BookOpen size={18} className="text-base-content/50" />
                            <input 
                                type="text" 
                                placeholder="e.g. Mathematics" 
                                {...register('subject', { required: "Subject is required" })} 
                                className="grow" 
                            />
                        </label>
                        {errors.subject && <span className="text-error text-xs mt-1">{errors.subject.message}</span>}
                    </div>

                    <div className="form-control">
                        <label className="label font-semibold">Class / Grade <span className="text-error">*</span></label>
                        <select 
                            {...register('class', { required: "Class is required" })} 
                            className={`select select-bordered w-full focus:select-primary ${errors.class ? 'select-error' : ''}`}
                        >
                            <option value="" disabled>Select Class</option>
                            <option>Class 6</option>
                            <option>Class 7</option>
                            <option>Class 8</option>
                            <option>Class 9</option>
                            <option>SSC / Class 10</option>
                            <option>HSC 1st Year</option>
                            <option>HSC 2nd Year</option>
                            <option>O Level</option>
                            <option>A Level</option>
                        </select>
                        {errors.class && <span className="text-error text-xs mt-1">{errors.class.message}</span>}
                    </div>
                </div>

                {/* 3. Location & Budget */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                    <div className="form-control">
                        <label className="label font-semibold">Location <span className="text-error">*</span></label>
                        <label className={`input input-bordered flex items-center gap-2 focus-within:input-primary ${errors.location ? 'input-error' : ''}`}>
                            <MapPin size={18} className="text-base-content/50" />
                            <input 
                                type="text" 
                                placeholder="e.g. Dhanmondi, Dhaka" 
                                {...register('location', { required: "Location is required" })} 
                                className="grow" 
                            />
                        </label>
                        {errors.location && <span className="text-error text-xs mt-1">{errors.location.message}</span>}
                    </div>

                    <div className="form-control">
                        <label className="label font-semibold">Budget (Tk) <span className="text-error">*</span></label>
                        <label className={`input input-bordered flex items-center gap-2 focus-within:input-primary ${errors.budget ? 'input-error' : ''}`}>
                            <DollarSign size={18} className="text-base-content/50" />
                            <input 
                                type="number" 
                                placeholder="5000" 
                                {...register('budget', { required: "Budget is required", min: { value: 500, message: "Min 500 Tk" } })} 
                                className="grow" 
                            />
                        </label>
                        {errors.budget && <span className="text-error text-xs mt-1">{errors.budget.message}</span>}
                    </div>
                </div>

                {/* 4. Schedule */}
                <div className="form-control mb-5">
                    <label className="label font-semibold">Preferred Schedule</label>
                    <label className={`input input-bordered flex items-center gap-2 focus-within:input-primary ${errors.schedule ? 'input-error' : ''}`}>
                        <Calendar size={18} className="text-base-content/50" />
                        <input 
                            type="text" 
                            placeholder="e.g. 3 days a week, After 6 PM" 
                            {...register('schedule', { required: "Schedule is required" })} 
                            className="grow" 
                        />
                    </label>
                    {errors.schedule && <span className="text-error text-xs mt-1">{errors.schedule.message}</span>}
                </div>

                {/* 5. Additional Notes */}
                <div className="form-control mb-8">
                    <label className="label font-semibold">Additional Notes</label>
                    <div className="relative">
                        <FileText size={18} className="absolute top-4 left-4 text-base-content/50" />
                        <textarea 
                            {...register('notes')} 
                            className="textarea textarea-bordered h-24 w-full pl-11 focus:textarea-primary" 
                            placeholder="Specific requirements (e.g., female tutor preferred, English medium background)..."
                        ></textarea>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="form-control">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="btn btn-primary text-white font-display text-lg uppercase tracking-wider disabled:bg-opacity-50"
                    >
                        {isSubmitting ? (
                            <span className="loading loading-spinner loading-md"> 'Posting...' </span>
                        ) : (
                            "Post Tuition Request"
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default PostTuition;