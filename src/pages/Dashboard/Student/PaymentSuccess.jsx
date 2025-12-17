import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import useAxiosSecure from '../../../hooks/useAxiosSecure'; // Or your axios instance

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('processing'); // processing, success, fail

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const sessionId = query.get('session_id');

        if (sessionId) {
            // Send the session ID to backend to verify and save
            axiosSecure.post('/payment-success', { sessionId })
                .then(res => {
                    if (res.data.success) {
                        setStatus('success');
                    } else {
                        setStatus('fail');
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Payment Confirmation Error:", err);
                    setStatus('fail');
                    setLoading(false);
                });
        } else {
            setLoading(false);
            setStatus('fail');
        }
    }, [location.search, axiosSecure]);

    if (loading) return <div className="text-center mt-10">Verifying Payment...</div>;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full">
                
                {status === 'success' ? (
                    <>
                        <div className="text-green-500 text-6xl mb-4">✓</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
                        <p className="text-gray-600 mb-6">
                            Your tutor has been booked successfully. You can now contact them.
                        </p>
                        <button 
                            onClick={() => navigate('/dashboard/applied-tutors')}
                            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
                        >
                            Go to My Tutors
                        </button>
                    </>
                ) : (
                    <>
                        <div className="text-red-500 text-6xl mb-4">✕</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Verification Failed</h2>
                        <p className="text-gray-600 mb-6">
                            We couldn't verify your payment. Please contact support if you were charged.
                        </p>
                        <button 
                            onClick={() => navigate('/dashboard/applied-tutors')}
                            className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-900 transition"
                        >
                            Go Back
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;