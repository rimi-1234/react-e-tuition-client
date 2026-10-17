import {
  BookOpen, MapPin, Calendar,
  ImagePlus, X, Info, LayoutList, User, Star
} from 'lucide-react';
import usePostTuition from '../../../hooks/usePostTuition';

/**
 * PostTuition – student form to post a new tuition request.
 *
 * Fields:
 *   Basic     : title, description, subject, class, budget, schedule, location
 *   Advanced  : studentGender, preferredTutor, teachingMode, experienceNeeded
 *   Media     : up to 4 images (compressed before upload)
 *
 * Validation is handled by react-hook-form.
 * Notifications use react-hot-toast (no SweetAlert2 dependency).
 */
const PostTuition = () => {
  const {
    register,
    errors,
    isSubmitting,
    handleFormSubmit,
    previews,
    handleImageChange,
    removeImage,
  } = usePostTuition();

  return (
    <div className="min-h-screen bg-base-200 text-base-content font-body">
      <div className="mx-auto max-w-6xl p-4 md:p-10">

        {/* ── Page Header ─────────────────────────────────────────── */}
        <div className="mb-10">
          <h1 className="font-display text-3xl font-black text-primary md:text-5xl">
            Post New Tuition
          </h1>
          <p className="mt-2 text-sm text-base-content/60">
            Fill out the sections below to attract the best tutors for your student.
          </p>
        </div>

        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* ════════════════════════════════════════════════════════
              LEFT COLUMN — Description & Media
              ════════════════════════════════════════════════════════ */}
          <div className="space-y-8 lg:col-span-2">

            {/* ── Section: Overview ──────────────────────────────── */}
            <Section icon={<Info className="text-secondary" />} title="Description / Overview">
              <Field label="Listing Headline" error={errors.title?.message}>
                <input
                  {...register('title', { required: 'A catchy title is required' })}
                  className={`input input-bordered w-full bg-base-100 focus:input-primary font-semibold ${errors.title ? 'input-error' : ''}`}
                  placeholder="e.g. Need experienced Math tutor for Class 10 student"
                />
              </Field>

              <Field label="Detailed Description" error={errors.description?.message}>
                <textarea
                  {...register('description', {
                    required: 'Please provide specific details',
                    minLength: { value: 20, message: 'Description is too short (min 20 characters)' },
                  })}
                  rows={6}
                  className={`textarea textarea-bordered w-full bg-base-100 text-base focus:textarea-primary ${errors.description ? 'textarea-error' : ''}`}
                  placeholder="Describe the student's needs, curriculum, preferred days and any other expectations…"
                />
              </Field>
            </Section>

            {/* ── Section: Extra Preferences ─────────────────────── */}
            <Section icon={<User className="text-secondary" />} title="Extra Preferences">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <Field label="Student Gender" error={errors.studentGender?.message}>
                  <select
                    {...register('studentGender', { required: 'Please select student gender' })}
                    className={`select select-bordered w-full bg-base-100 ${errors.studentGender ? 'select-error' : ''}`}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>

                <Field label="Preferred Tutor Gender" error={errors.preferredTutor?.message}>
                  <select
                    {...register('preferredTutor', { required: 'Please select tutor preference' })}
                    className={`select select-bordered w-full bg-base-100 ${errors.preferredTutor ? 'select-error' : ''}`}
                  >
                    <option value="">Select preference</option>
                    <option value="Male">Male Tutor</option>
                    <option value="Female">Female Tutor</option>
                    <option value="Any">No Preference</option>
                  </select>
                </Field>

                <Field label="Teaching Mode" error={errors.teachingMode?.message}>
                  <select
                    {...register('teachingMode', { required: 'Select a teaching mode' })}
                    className={`select select-bordered w-full bg-base-100 ${errors.teachingMode ? 'select-error' : ''}`}
                  >
                    <option value="">Select mode</option>
                    <option value="Home Visit">Home Visit</option>
                    <option value="Online">Online</option>
                    <option value="Both">Both (Flexible)</option>
                  </select>
                </Field>

                <Field label="Experience Needed" error={errors.experienceNeeded?.message}>
                  <select
                    {...register('experienceNeeded', { required: 'Select required experience' })}
                    className={`select select-bordered w-full bg-base-100 ${errors.experienceNeeded ? 'select-error' : ''}`}
                  >
                    <option value="">Select level</option>
                    <option value="Undergraduate">Undergraduate Student</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Professional">Professional Tutor</option>
                    <option value="Any">Any Experience</option>
                  </select>
                </Field>
              </div>
            </Section>

            {/* ── Section: Media ─────────────────────────────────── */}
            <Section icon={<ImagePlus className="text-secondary" />} title="Media / Attachments (optional)">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {previews.map((src, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-2xl border border-base-300">
                    <img src={src} alt="preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute right-1 top-1 btn btn-circle btn-xs btn-error text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {previews.length < 4 && (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-base-300 transition-all hover:border-primary hover:bg-primary/5">
                    <ImagePlus className="text-base-content/30" />
                    <span className="mt-2 text-[10px] font-bold uppercase text-base-content/40">
                      Add Photo
                    </span>
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
              <p className="mt-4 text-[10px] font-medium uppercase tracking-wider text-base-content/40">
                Max 4 images · Syllabus, past results, or textbook pages · Images are compressed automatically
              </p>
            </Section>
          </div>

          {/* ════════════════════════════════════════════════════════
              RIGHT COLUMN — Specifications (sticky sidebar)
              ════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4 rounded-3xl border border-primary/10 bg-primary/5 p-6 md:p-8">
              <h2 className="flex items-center gap-2 text-xl font-bold text-primary">
                <LayoutList size={20} /> Specifications
              </h2>

              {/* Subject */}
              <SpecField icon={<BookOpen size={18} className="shrink-0 text-primary/60" />} error={errors.subject?.message}>
                <input
                  {...register('subject', { required: 'Subject is required' })}
                  className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-base-content/30"
                  placeholder="Subject (e.g. Mathematics)"
                />
              </SpecField>

              {/* Class */}
              <Field label="Grade / Class" error={errors.class?.message}>
                <select
                  {...register('class', { required: 'Select a class' })}
                  className={`select select-bordered w-full bg-base-100 text-sm ${errors.class ? 'select-error' : ''}`}
                >
                  <option value="">Select Grade</option>
                  <option value="Class 6">Class 6</option>
                  <option value="Class 7">Class 7</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="SSC">SSC / Class 10</option>
                  <option value="HSC">HSC / Class 11–12</option>
                  <option value="O Level">O Level</option>
                  <option value="A Level">A Level</option>
                  <option value="University">University</option>
                </select>
              </Field>

              {/* Budget */}
              <SpecField
                icon={
                  <span className="shrink-0 text-base font-black text-success">৳</span>
                }
                error={errors.budget?.message}
              >
                <input
                  type="number"
                  {...register('budget', {
                    required: 'Budget is required',
                    min: { value: 500, message: 'Minimum budget is ৳500' },
                  })}
                  className="w-full bg-transparent text-sm font-bold text-success outline-none placeholder:text-base-content/30"
                  placeholder="Monthly budget in Taka"
                />
              </SpecField>

              {/* Schedule */}
              <SpecField icon={<Calendar size={18} className="shrink-0 text-primary/60" />} error={errors.schedule?.message}>
                <input
                  {...register('schedule', { required: 'e.g. 3 days/week, weekends only' })}
                  className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-base-content/30"
                  placeholder="Schedule (e.g. 3 Days / Week)"
                />
              </SpecField>

              {/* Location */}
              <SpecField icon={<MapPin size={18} className="shrink-0 text-rose-500" />} error={errors.location?.message}>
                <input
                  {...register('location', { required: 'Location is required' })}
                  className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-base-content/30"
                  placeholder="Area / Location (e.g. Dhanmondi, Dhaka)"
                />
              </SpecField>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary mt-4 w-full rounded-2xl font-bold text-white shadow-xl shadow-primary/20"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="loading loading-spinner loading-sm" />
                    Posting…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Star size={16} /> Post Tuition Request
                  </span>
                )}
              </button>

              <p className="text-center text-[10px] text-base-content/40">
                Your post will be reviewed by an admin before going live.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Reusable layout helpers ──────────────────────────────────────── */

const Section = ({ icon, title, children }) => (
  <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm md:p-8">
    <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-base-content">
      {icon} {title}
    </h2>
    <div className="space-y-5">{children}</div>
  </div>
);

const Field = ({ label, error, children }) => (
  <div className="form-control">
    {label && (
      <label className="label pb-1 text-[11px] font-bold uppercase tracking-wide text-base-content/50">
        {label}
      </label>
    )}
    {children}
    {error && <span className="mt-1 text-xs text-error">{error}</span>}
  </div>
);

// Used for the sticky sidebar spec fields (icon + input in a bordered row)
const SpecField = ({ icon, error, children }) => (
  <div>
    <div className={`flex items-center gap-3 rounded-xl border bg-base-100 p-3 ${error ? 'border-error' : 'border-base-300'}`}>
      {icon}
      {children}
    </div>
    {error && <span className="mt-1 text-xs text-error">{error}</span>}
  </div>
);

export default PostTuition;
