import { useQuery } from '@tanstack/react-query';
import { FaDownload, FaReceipt } from 'react-icons/fa';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';

/**
 * Download a plain-text receipt for a single payment as a .txt file.
 * A PDF library is not needed for a simple receipt — the browser can
 * write a formatted text string to a Blob and trigger a download.
 */
function downloadReceipt(payment, userEmail) {
  const role = payment.studentEmail === userEmail ? 'Student (payer)' : 'Tutor (receiver)';
  const counterpart =
    payment.studentEmail === userEmail ? payment.tutorEmail : payment.studentEmail;
  const direction =
    payment.studentEmail === userEmail
      ? `Paid to: ${payment.tutorEmail}`
      : `Received from: ${payment.studentEmail}`;

  const lines = [
    '═══════════════════════════════════════════',
    '          EDUROCK  –  PAYMENT RECEIPT      ',
    '═══════════════════════════════════════════',
    '',
    `Date        : ${new Date(payment.date).toLocaleString()}`,
    `Transaction : ${payment.transactionId}`,
    `Currency    : ${(payment.currency || 'BDT').toUpperCase()}`,
    `Amount      : ${payment.amount}`,
    `Status      : ${(payment.status || 'paid').toUpperCase()}`,
    '',
    '───────────────────────────────────────────',
    `Your Role   : ${role}`,
    direction,
    `Tuition ID  : ${payment.tuitionId}`,
    '───────────────────────────────────────────',
    '',
    'Thank you for using Edurock.',
    '═══════════════════════════════════════════',
  ].join('\n');

  const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `edurock-receipt-${payment.transactionId.slice(-8)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const PaymentHistory = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get('/payments');
      return res.data;
    }
  });

  if (isLoading) return <LoadingSpinner />;

  const totalSpent = payments
    .filter(p => p.studentEmail === user?.email)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalEarned = payments
    .filter(p => p.tutorEmail === user?.email)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="min-h-screen bg-base-200 p-4 text-base-content font-body md:p-8">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold">Payment History</h2>
          <p className="mt-1 text-sm text-base-content/60">
            All transactions are secured via Stripe.
          </p>
        </div>
        <span className="rounded-xl bg-primary/10 px-4 py-2 font-semibold text-primary">
          {payments.length} records
        </span>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {totalSpent > 0 && (
          <div className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase text-base-content/50">Total Spent</p>
            <p className="mt-1 text-3xl font-black text-error">৳{totalSpent.toLocaleString()}</p>
          </div>
        )}
        {totalEarned > 0 && (
          <div className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase text-base-content/50">Total Earned</p>
            <p className="mt-1 text-3xl font-black text-success">৳{totalEarned.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-base-200 text-[11px] uppercase text-base-content/60">
              <tr>
                <th>#</th>
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>Details</th>
                <th>Date</th>
                <th>Status</th>
                <th className="text-center">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <FaReceipt className="mx-auto mb-3 text-4xl text-base-content/20" />
                    <p className="font-bold text-base-content/40">No payment history yet.</p>
                  </td>
                </tr>
              ) : (
                payments.map((payment, index) => (
                  <tr key={payment._id} className="border-base-300 transition hover:bg-base-200/50">
                    <td className="font-bold text-primary">{index + 1}</td>

                    <td className="font-mono text-xs text-base-content/60">
                      {payment.transactionId?.slice(0, 18)}…
                    </td>

                    <td className="font-bold text-base-content">
                      {(payment.currency || 'BDT').toUpperCase()} {payment.amount}
                    </td>

                    <td>
                      {user?.email === payment.studentEmail ? (
                        <span className="text-sm font-medium text-error">
                          Paid to:{' '}
                          <span className="font-normal text-base-content/70">{payment.tutorEmail}</span>
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-success">
                          Received from:{' '}
                          <span className="font-normal text-base-content/70">{payment.studentEmail}</span>
                        </span>
                      )}
                    </td>

                    <td className="text-sm">
                      <div>
                        {new Date(payment.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-base-content/40">
                        {new Date(payment.date).toLocaleTimeString()}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          payment.status === 'paid'
                            ? 'bg-success/10 text-success'
                            : 'bg-warning/10 text-warning'
                        }`}
                      >
                        {(payment.status || 'paid').toUpperCase()}
                      </span>
                    </td>

                    {/* Receipt download — the key resume feature here */}
                    <td className="text-center">
                      <button
                        onClick={() => downloadReceipt(payment, user?.email)}
                        title="Download receipt"
                        aria-label="Download receipt"
                        className="btn btn-ghost btn-xs gap-1 text-primary hover:bg-primary/10"
                      >
                        <FaDownload size={12} /> Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
