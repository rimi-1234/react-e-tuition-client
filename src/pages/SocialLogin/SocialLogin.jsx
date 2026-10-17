import { useState } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';

const SocialLogin = () => {
    const { signInWithGoogle } = useAuth();
    const axiosSecure = useAxiosSecure();
    const navigate  = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        const toastId = toast.loading('Signing in with Google…');

        try {
            const result = await signInWithGoogle();

            // Save/update user in MongoDB — always send role: 'Student'
            // Backend will NOT overwrite role if the user already exists
            const userInfo = {
                email:       result.user.email,
                displayName: result.user.displayName,
                photoURL:    result.user.photoURL,
                role:        'Student',
            };

            await axiosSecure.post('/users', userInfo);

            toast.success('Signed in successfully!', { id: toastId });
            navigate('/dashboard', { replace: true });

        } catch (error) {
            const msg = error?.response?.data?.message || error?.message || 'Google sign-in failed';
            toast.error(msg, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="text-center max-w-sm pb-8 w-full">
            <p className="mb-2 text-base-content/60">OR</p>

            <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="btn bg-white text-black border border-base-300 w-full justify-center gap-2 py-3 rounded-lg hover:bg-gray-50 disabled:opacity-60"
            >
                {loading ? (
                    <span className="loading loading-spinner loading-sm" />
                ) : (
                    <svg
                        aria-label="Google logo"
                        width="18"
                        height="18"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                    >
                        <g>
                            <path d="m0 0H512V512H0" fill="#fff" />
                            <path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341" />
                            <path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57" />
                            <path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73" />
                            <path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55" />
                        </g>
                    </svg>
                )}
                {loading ? 'Signing in…' : 'Login with Google'}
            </button>
        </div>
    );
};

export default SocialLogin;
