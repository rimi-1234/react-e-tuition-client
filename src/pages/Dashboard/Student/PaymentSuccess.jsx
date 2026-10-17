import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router';
import { FaCheckCircle, FaTimesCircle, FaReceipt, FaArrowRight, FaSpinner } from 'react-icons/fa';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

/**
 * PaymentSuccess – landing page after Stripe checkout.
 *
 * URL: /dashboard/payment/success?session_id=cs_test_XXXXXXXX
 *
 * Flow:
 *  1. Read session_id from the URL
 *  2. POST /payment-success → backend verifies with Stripe, saves record,
 *     updates application status to Approved, sends notifications
 *  3. Show success or failure card
 *  4. Auto-redirect to /dashboard/applied-tutors after 8 s
 */
const PaymentSuccess = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const axiosSecure = useAxiosSecure();

  // 'processing' | 'success' | 'fail' | 'already'
  const [status,  setStatus]  = useState('processing');
  const [payment, setPayment] = useState(null);   // payment record returned by the backend
  const [countdown, setCountdown] = useState(8);  // seconds until auto-redirect

  /* ── Step 1: verify the session ─────────────────────────────────── */
  useEffect(() => {
    const sessionId = new URLSearchParams(location.search).get('session_id');

    if (!sessionId) {
      setStatus('fail');
      return;
    }

    axiosSecure
      .post('/payment-success', { sessionId })
      .then(res => {
        if (res.data.success) {
          setStatus(res.data.message === 'Already processed' ? 'already' : 'success');
          setPayment(res.data.payment || null);
        } else {
          setStatus('fail');
        }
      })
      .catch(() => setStatus('fail'));
  }, [location.search, axiosSecure]);

  /* ── Step 2: countdown auto-redirect ────────────────────────────── */
  useEffect(() => {
    if (status !== 'success' && status !== 'already') return;

    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(interval);
          navigate('/dashboard/applied-tutors');
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, navigate]);

  /* ── Loading ────────────────────────────────────────────────────── */
  if (status === 'processing') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-base-200 text-base-content">
        <FaSpinner className="animate-spin text-5xl text-primary" />
        <p className="text-lg font-semibold">Verifying your payment…</p>
        <p className="text-sm text-base-content/50">Please do not close this tab.</p>
      </div>
    );
  }

  /* ── Success ────────────────────────────────────────────────────── */
  if (status === 'success' || status === 'already') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-200 p-4 text-base-content">
        <div className="w-full max-w-md rounded-3xl border border-base-300 bg-base-100 p-8 shadow-2xl text-center">

          {/* Icon */}
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-success/10 p-5">
              <FaCheckCircle className="text-5xl text-success" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="mb-2 font-display text-3xl font-black text-base-content">
            {status === 'already' ? 'Already Confirmed!' : 'Payment Successful!'}
          </h1>
          <p className="mb-6 text-sm text-base-content/60">
            {status === 'already'
              ? 'This payment was already processed. Your tutor is confirmed.'
              : 'Your tutor has been hired and notified. Check your dashboard to get started.'}
          </p>

          {/* Payment summary card */}
          {payment && (
            <div className="mb-6 rounded-2xl border border-base-300 bg-base-200 p-4 text-left text-sm">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-base-content/50">
                Payment Summary
              </p>
              <div className="flex justify-between py-1 border-b border-base-300">
                <span className="text-base-content/60">Amount Paid</span>
                <span className="font-bold text-base-content">৳{payment.amount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-base-300">
                <span className="text-base-content/60">Transaction ID</span>
                <span className="font-mono text-[11px] text-base-content/60 truncate max-w-[160px]">
                  {payment.transactionId}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-base-content/60">Status</span>
                <span className="font-bold text-success uppercase">Paid ✓</span>
              </div>
            </div>
          )}

          {/* Countdown */}
          <p className="mb-5 text-xs text-base-content/40">
            Redirecting to your tutors in{' '}
            <span className="font-bold text-primary">{countdown}s</span>…
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link
              to="/dashboard/applied-tutors"
              className="btn btn-primary w-full gap-2 rounded-xl"
            >
              <FaArrowRight /> Go to My Tutors Now
            </Link>
            <Link
              to="/dashboard/payment-history"
              className="btn btn-outline btn-sm w-full gap-2 rounded-xl"
            >
              <FaReceipt size={12} /> View Payment History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Failure ────────────────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 p-4 text-base-content">
      <div className="w-full max-w-md rounded-3xl border border-base-300 bg-base-100 p-8 shadow-2xl text-center">

        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-error/10 p-5">
            <FaTimesCircle className="text-5xl text-error" />
          </div>
        </div>

        <h1 className="mb-2 font-display text-3xl font-black text-base-content">
          Verification Failed
        </h1>
        <p className="mb-6 text-sm text-base-content/60">
          We could not confirm your payment. If you were charged, please contact support with your
          Stripe receipt. Your card may not have been billed.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            to="/dashboard/applied-tutors"
            className="btn btn-error btn-outline w-full rounded-xl"
          >
            Go Back to Applications
          </Link>
          <Link
            to="/"
            className="btn btn-ghost btn-sm w-full rounded-xl"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
