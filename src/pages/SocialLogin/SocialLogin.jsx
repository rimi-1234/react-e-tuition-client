import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';
import Swal from 'sweetalert2';


const SocialLogin = () => {
    const { signInWithGoogle } = useAuth();
    const axiosSecure = useAxiosSecure();
    const location = useLocation();
    const navigate = useNavigate();

    console.log();
    
    const handleGoogleSignIn = () => {
        signInWithGoogle()
            .then(result => {
                console.log(result.user.photoURL);
                

                // create user in the database
                const userInfo = {
                    email: result.user.email,
                    displayName: result.user.displayName,
                    photoURL: result.user.photoURL
                }

                axiosSecure.post('/users', userInfo)
                    .then(res => {
                          if (res.data.userId) {
                              Swal.fire({
                                title: "LogIn Successful!",
                                text: "Your account has been created successfully.",
                                icon: "success",
                                confirmButtonText: "OK",
                              });
                            }
                        
                            navigate(location.state || '/');
                        })
                              navigate(location.state || '/');

            })
            .catch(error => {
                console.log(error)
            })
    }

    return (
       <div className="text-center max-w-sm pb-8 w-full">
    <p className="mb-2">OR</p>

    <button
        onClick={handleGoogleSignIn}
        className="btn bg-white text-black border-[#e5e5e5] w-full justify-center gap-2 py-3 rounded-lg"
    >
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

        Login with Google
    </button>
</div>

    );
};

export default SocialLogin;