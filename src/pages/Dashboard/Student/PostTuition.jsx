import React from 'react';
import { BookOpen, MapPin, DollarSign, Calendar, ImagePlus, X, Info, LayoutList } from 'lucide-react';
import usePostTuition from '../../../hooks/usePostTuition';

const PostTuition = () => {
    const { 
        register, 
        errors, 
        isSubmitting, 
        handleFormSubmit, 
        previews, 
        handleImageChange, 
        removeImage 
    } = usePostTuition();

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-10 font-body">
            
            <div className="mb-10 text-center md:text-left">
                <h1 className="text-3xl md:text-5xl font-black font-display text-primary">Post New Tuition</h1>
                <p className="text-gray-500 mt-2">Fill out the sections below to attract the best tutors.</p>
            </div>

            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- LEFT SIDE: DESCRIPTION & MEDIA --- */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Section: Overview */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-base-200">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Info className="text-secondary"/> Description / Overview
                        </h2>
                        <div className="space-y-5">
                            <div className="form-control">
                                <label className="label font-bold text-xs uppercase text-gray-400">Listing Headline</label>
                                <input 
                                    {...register('title', { required: "A catchy title is required" })}
                                    className={`input input-bordered w-full focus:input-primary font-semibold ${errors.title ? 'border-error' : ''}`}
                                    placeholder="e.g. Need experienced Math tutor for Class 10 student"
                                />
                                {errors.title && <span className="text-error text-xs mt-1">{errors.title.message}</span>}
                            </div>
                            <div className="form-control">
                                <label className="label font-bold text-xs uppercase text-gray-400">Detailed Description</label>
                                <textarea 
                                    {...register('description', { 
                                        required: "Please provide specific details",
                                        minLength: { value: 20, message: "Description is too short" }
                                    })}
                                    className={`textarea textarea-bordered h-48 focus:textarea-primary text-base ${errors.description ? 'border-error' : ''}`}
                                    placeholder="Describe the student's needs, curriculum, and expectations..."
                                />
                                {errors.description && <span className="text-error text-xs mt-1">{errors.description.message}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Section: Media Gallery */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-base-200">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <ImagePlus className="text-secondary"/> Media / Attachments
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {previews.map((src, i) => (
                                <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden border">
                                    <img src={src} alt="preview" className="w-full h-full object-cover" />
                                    <button 
                                        type="button" 
                                        onClick={() => removeImage(i)} 
                                        className="absolute top-1 right-1 btn btn-circle btn-xs btn-error text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12}/>
                                    </button>
                                </div>
                            ))}
                            {previews.length < 4 && (
                                <label className="aspect-square rounded-2xl border-2 border-dashed border-base-300 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 hover:border-primary transition-all">
                                    <ImagePlus className="text-base-300" />
                                    <span className="text-[10px] uppercase font-bold text-gray-400 mt-2">Add Photo</span>
                                    <input type="file" hidden multiple accept="image/*" onChange={handleImageChange} />
                                </label>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-4 uppercase font-medium tracking-wider">
                            Max 4 images (Syllabus, past results, or textbook pages)
                        </p>
                    </div>
                </div>

                {/* --- RIGHT SIDE: SPECIFICATIONS --- */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-primary/5 p-6 md:p-8 rounded-3xl border border-primary/10 lg:sticky lg:top-24">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-primary">
                            <LayoutList size={20}/> Specifications
                        </h2>
                        
                        <div className="space-y-4">
                            {/* Subject */}
                            <div className="form-control">
                                <label className="label font-bold text-[10px] uppercase text-gray-500">Subject</label>
                                <div className={`flex items-center gap-3 bg-white p-3 rounded-xl border ${errors.subject ? 'border-error' : 'border-base-200'}`}>
                                    <BookOpen size={18} className="text-primary/60"/>
                                    <input 
                                        {...register('subject', { required: "Subject is required" })} 
                                        className="outline-none w-full text-sm font-semibold" 
                                        placeholder="Mathematics" 
                                    />
                                </div>
                            </div>

                            {/* Class */}
                            <div className="form-control">
                                <label className="label font-bold text-[10px] uppercase text-gray-500">Grade / Class</label>
                                <select 
                                    {...register('class', { required: "Select a class" })} 
                                    className="select select-bordered w-full rounded-xl bg-white border-base-200 text-sm"
                                >
                                    <option value="">Select Grade</option>
                                    <option value="Class 9">Class 9</option>
                                    <option value="SSC">SSC / Class 10</option>
                                    <option value="HSC">HSC</option>
                                    <option value="O Level">O Level</option>
                                    <option value="A Level">A Level</option>
                                </select>
                            </div>

                            {/* Budget */}
                            <div className="form-control">
                                <label className="label font-bold text-[10px] uppercase text-gray-500">Monthly Budget (৳)</label>
                                <div className={`flex items-center gap-3 bg-white p-3 rounded-xl border ${errors.budget ? 'border-error' : 'border-base-200'}`}>
                                    <DollarSign size={18} className="text-green-600"/>
                                    <input 
                                        type="number" 
                                        {...register('budget', { required: "Budget is required", min: 500 })} 
                                        className="outline-none w-full text-sm font-bold text-green-700" 
                                        placeholder="5000" 
                                    />
                                </div>
                            </div>

                            {/* Schedule */}
                            <div className="form-control">
                                <label className="label font-bold text-[10px] uppercase text-gray-500">Schedule</label>
                                <div className={`flex items-center gap-3 bg-white p-3 rounded-xl border ${errors.schedule ? 'border-error' : 'border-base-200'}`}>
                                    <Calendar size={18} className="text-primary/60"/>
                                    <input 
                                        {...register('schedule', { required: "e.g., 3 days/week" })} 
                                        className="outline-none w-full text-sm font-semibold" 
                                        placeholder="3 Days / Week" 
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div className="form-control">
                                <label className="label font-bold text-[10px] uppercase text-gray-500">Area / Location</label>
                                <div className={`flex items-center gap-3 bg-white p-3 rounded-xl border ${errors.location ? 'border-error' : 'border-base-200'}`}>
                                    <MapPin size={18} className="text-primary/60"/>
                                    <input 
                                        {...register('location', { required: "Location is required" })} 
                                        className="outline-none w-full text-sm font-semibold" 
                                        placeholder="Dhanmondi, Dhaka" 
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="btn btn-primary w-full mt-10 rounded-2xl text-white font-bold shadow-xl shadow-primary/20 disabled:bg-gray-400"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <span className="loading loading-spinner loading-sm"></span>
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                "Post Tuition Request"
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PostTuition;