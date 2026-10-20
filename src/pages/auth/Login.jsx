import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { DemoLogin, Divider, GoogleButton } from '../../components/layout/SocialAuth';
import { Button, Input, confirmAction, notify } from '../../components/ui';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { authMessage, useAuth } from '../../providers/AuthProvider';

export default function Login() {
  useDocumentTitle('Sign in');
  const { signIn, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const from = location.state?.from?.pathname || '/dashboard';
  const done = () => navigate(from, { replace: true });

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' } });

  const onSubmit = async ({ email, password }) => {
    try {
      await signIn(email, password);
      notify.success('Welcome back!');
      done();
    } catch (err) {
      setError('password', { message: authMessage(err) });
    }
  };

  const onForgot = async () => {
    const email = await confirmAction({
      title: 'Reset your password',
      text: 'We’ll email you a secure link to choose a new password.',
      confirmText: 'Send link',
      input: 'email',
      inputPlaceholder: 'you@example.com',
      inputValidator: (v) => (!v ? 'Please enter your email' : undefined),
    });
    if (!email) return;
    try {
      await resetPassword(email || getValues('email'));
      notify.success('Check your inbox for the reset link');
    } catch (err) {
      notify.error(authMessage(err));
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your tuitions, applications and payments."
      footer={
        <>
          New to Edurock?{' '}
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <GoogleButton onDone={done} />
      <Divider label="or with email" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
          label="Password"
          type={showPassword ? 'text' : 'password'}
          icon={Lock}
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="rounded-lg p-2 text-subtle hover:bg-soft hover:text-base-content"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
          {...register('password', { required: 'Please enter your password' })}
        />
        <div className="flex justify-end">
          <button type="button" onClick={onForgot} className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </button>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting} rightIcon={ArrowRight}>
          Sign in
        </Button>
      </form>
      <div className="mt-6">
        <DemoLogin onDone={done} />
      </div>
    </AuthLayout>
  );
}
