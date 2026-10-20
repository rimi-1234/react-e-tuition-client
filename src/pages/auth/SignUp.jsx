import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, Briefcase, Camera, Check, Eye, EyeOff, GraduationCap, Lock, Mail, Phone, Trash2, UserRound } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Divider, GoogleButton } from '../../components/layout/SocialAuth';
import { Avatar, Button, Input, notify } from '../../components/ui';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { authMessage, useAuth } from '../../providers/AuthProvider';
import { cn } from '../../utils/cn';
import { uploadImage } from '../../utils/upload';

const ROLES = [
  { value: 'Student', icon: GraduationCap, tab: 'Join as student', text: 'Post tuitions for free and hire verified tutors.' },
  { value: 'Tutor', icon: Briefcase, tab: 'Join as tutor', text: 'Apply to real tuition requests and get paid securely.' },
];

/** 0–4 score from length and character variety. */
function strength(pw = '') {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) s++;
  return s;
}
const STRENGTH = [
  ['Too weak', 'bg-error'],
  ['Weak', 'bg-error'],
  ['Fair', 'bg-warning'],
  ['Good', 'bg-success'],
  ['Strong', 'bg-success'],
];

export default function SignUp() {
  useDocumentTitle('Create your account');
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [photo, setPhoto] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { role: 'Student', name: '', email: '', phone: '', password: '' } });

  const [role, pw, name] = useWatch({ control, name: ['role', 'password', 'name'] });
  const score = strength(pw);

  const onSubmit = async (values) => {
    try {
      let photoURL = '';
      if (photo) {
        try {
          photoURL = await uploadImage(photo.file, { maxWidth: 512 });
        } catch (err) {
          notify.error(`${err.message} You can add a photo later.`);
        }
      }
      await signUp({ email: values.email, password: values.password, displayName: values.name.trim(), phone: values.phone.trim(), photoURL, role: values.role });
      notify.success('Welcome to Edurock! 🎉');
      navigate(values.role === 'Tutor' ? '/dashboard/profile' : '/dashboard', { replace: true });
    } catch (err) {
      const field = err?.code === 'auth/email-already-in-use' ? 'email' : err?.code === 'auth/weak-password' ? 'password' : 'email';
      setError(field, { message: authMessage(err) });
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It’s free, and takes less than a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Controller
          name="role"
          control={control}
          render={({ field }) => {
            const index = ROLES.findIndex((r) => r.value === field.value);
            const current = ROLES[index];
            return (
              <div>
                {/* Segmented tabs with a sliding indicator */}
                <div className="relative grid grid-cols-2 rounded-2xl border border-soft bg-soft p-1" role="tablist" aria-label="Account type">
                  <span
                    aria-hidden
                    className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl bg-base-100 shadow-[var(--shadow-soft)] ring-1 ring-primary/20 transition-transform duration-500 ease-out-soft"
                    style={{ transform: `translateX(${index * 100}%)` }}
                  />
                  {ROLES.map((r) => {
                    const active = field.value === r.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => field.onChange(r.value)}
                        className={cn(
                          'relative z-10 flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors duration-300',
                          active ? 'text-primary' : 'text-base-content/60 hover:text-base-content',
                        )}
                      >
                        <r.icon className="size-4" aria-hidden />
                        {r.tab}
                      </button>
                    );
                  })}
                </div>
                <p key={current.value} className="mt-2.5 flex items-center gap-1.5 text-xs text-subtle animate-[dial-in_0.35s_var(--ease-out-soft)_both]">
                  <Check className="size-3.5 text-success" aria-hidden /> {current.text}
                </p>
              </div>
            );
          }}
        />

        <GoogleButton role={role} label="Sign up with Google" onDone={() => navigate('/dashboard', { replace: true })} />
        <Divider label="or with email" />

        {/* Profile photo (optional) */}
        <div>
          <p className="mb-1.5 text-sm font-medium text-base-content/90">
            Profile photo <span className="font-normal text-subtle">(optional)</span>
          </p>
          <div className="flex items-center gap-4 rounded-2xl border border-dashed border-soft p-3">
            <Avatar src={photo?.preview} name={name || 'You'} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl bg-primary/10 px-3.5 text-sm font-medium text-primary transition-colors hover:bg-primary/15 focus-within:outline-2 focus-within:outline-primary">
                  <Camera className="size-4" aria-hidden />
                  {photo ? 'Change photo' : 'Upload photo'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 8 * 1024 * 1024) return notify.error('Please choose an image under 8 MB.');
                      if (photo?.preview) URL.revokeObjectURL(photo.preview);
                      setPhoto({ file, preview: URL.createObjectURL(file) });
                      e.target.value = '';
                    }}
                  />
                </label>
                {photo && (
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(photo.preview);
                      setPhoto(null);
                    }}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm text-subtle transition-colors hover:bg-soft hover:text-error"
                  >
                    <Trash2 className="size-4" aria-hidden /> Remove
                  </button>
                )}
              </div>
              <p className="mt-1.5 truncate text-xs text-subtle">{photo ? photo.file.name : 'JPG, PNG or WebP · up to 8 MB'}</p>
            </div>
          </div>
        </div>

        <Input
          label="Full name"
          icon={UserRound}
          autoComplete="name"
          placeholder="e.g. Nusrat Jahan"
          error={errors.name?.message}
          {...register('name', { required: 'Please enter your name', minLength: { value: 2, message: 'Too short' } })}
        />
        <Input
          label="Email"
          type="email"
          icon={Mail}
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email', { required: 'Please enter your email', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })}
        />
        <Input
          label="Phone"
          type="tel"
          icon={Phone}
          autoComplete="tel"
          placeholder="01XXXXXXXXX"
          hint="Only shared with the person you hire or who hires you."
          error={errors.phone?.message}
          {...register('phone', { pattern: { value: /^\+?[\d\s-]{7,20}$/, message: 'Enter a valid phone number' } })}
        />
        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            icon={Lock}
            autoComplete="new-password"
            placeholder="At least 8 characters, letters & numbers"
            error={errors.password?.message}
            suffix={
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="rounded-lg p-2 text-subtle hover:bg-soft" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
            {...register('password', {
              required: 'Choose a password',
              minLength: { value: 8, message: 'Use at least 8 characters' },
              validate: (v) => (/[A-Za-z]/.test(v) && /\d/.test(v)) || 'Mix letters and numbers',
            })}
          />
          {pw && (
            <div className="mt-2 flex items-center gap-3" aria-live="polite">
              <div className="flex flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={cn('h-1 flex-1 rounded-full transition-colors duration-300', i < score ? STRENGTH[score][1] : 'bg-base-content/10')} />
                ))}
              </div>
              <span className="w-16 text-right text-xs text-subtle">{STRENGTH[score][0]}</span>
            </div>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting} rightIcon={ArrowRight}>
          Create {role === 'Tutor' ? 'tutor' : 'student'} account
        </Button>
        <p className="text-center text-xs text-subtle">By continuing you agree to our terms and privacy policy.</p>
      </form>
    </AuthLayout>
  );
}
