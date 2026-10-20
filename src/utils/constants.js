/** Mirrors backend/src/config/constants.js (also served at /api/v1/meta/options). */
export const CLASS_LEVELS = ['Class 1-5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'SSC', 'HSC', 'O Level', 'A Level', 'University', 'Admission', 'Other'];
export const TEACHING_MODES = ['Home Visit', 'Online', 'Both'];
export const GENDERS = ['Male', 'Female', 'Other'];
export const TUTOR_PREFERENCES = [
  { value: 'Any', label: 'No preference' },
  { value: 'Male', label: 'Male tutor' },
  { value: 'Female', label: 'Female tutor' },
];
export const EXPERIENCE_LEVELS = [
  { value: 'Any', label: 'Any experience' },
  { value: 'Undergraduate', label: 'Undergraduate student' },
  { value: 'Graduate', label: 'Graduate' },
  { value: 'Professional', label: 'Professional tutor' },
];

export const POPULAR_SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Higher Math', 'ICT', 'Accounting', 'Bangla', 'IELTS'];

export const TUITION_SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'budget_desc', label: 'Highest budget' },
  { value: 'budget_asc', label: 'Lowest budget' },
  { value: 'popular', label: 'Most applied' },
  { value: 'oldest', label: 'Oldest first' },
];

export const TUTOR_SORTS = [
  { value: 'rating', label: 'Top rated' },
  { value: 'experience', label: 'Most experienced' },
  { value: 'newest', label: 'Newest' },
  { value: 'salary_asc', label: 'Lowest rate' },
  { value: 'salary_desc', label: 'Highest rate' },
];

export const ROLES = { STUDENT: 'Student', TUTOR: 'Tutor', ADMIN: 'Admin' };

export const IMAGE_HOST_KEY = import.meta.env.VITE_IMAGE_HOST_KEY;
