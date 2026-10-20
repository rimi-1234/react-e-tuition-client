import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, Copy, Loader2, Receipt, ShieldCheck, UserRound } from 'lucide-react';
import { api } from '../../../api/endpoints';
import { Button, Card, EmptyState, ErrorState, IconButton, LoadingRegion, Skeleton, notify } from '../../../components/ui';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { animate, set } from '../../../lib/motion';
import { Presence, Reveal, useReducedMotion } from '../../../motion';
import { dateTime, money } from '../../../utils/format';

/** Everything a confirmed payment changes: applicants, tuition status, dashboard, history. */
const STALE_KEYS = [['applications'], ['tuitions'], ['dashboard'], ['payments']];

export default function PaymentSuccess() {
  useDocumentTitle('Payment');
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const qc = useQueryClient();
  const [state, setState] = useState({ status: sessionId ? 'verifying' : 'missing' });
  const started = useRef(false);

  /** Resolves to the next view state; never rejects. */
  const confirm = useCallback(
    () =>
      api.payments.confirm(sessionId).then(
        (res) => {
          STALE_KEYS.forEach((queryKey) => qc.invalidateQueries({ queryKey }));
          return { status: 'success', payment: res.data };
        },
        (error) => ({ status: 'error', error }),
      ),
    [sessionId, qc],
  );

  // Confirm exactly once, even under StrictMode's double effect (the API is idempotent anyway).
  useEffect(() => {
    if (!sessionId || started.current) return;
    started.current = true;
    confirm().then(setState);
  }, [sessionId, confirm]);

  const retry = () => {
    setState({ status: 'verifying' });
    confirm().then(setState);
  };

  return (
    <div className="mx-auto max-w-xl py-2 sm:py-6">
      {state.status === 'missing' && (
        <EmptyState
          icon={Receipt}
          title="No payment to confirm"
          description="This page opens after a Stripe checkout. If you just paid, check your payment history."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" to="/dashboard/applied-tutors">
                Applicants
              </Button>
              <Button to="/dashboard/payment-history">Payment history</Button>
            </div>
          }
        />
      )}

      {state.status === 'verifying' && <Verifying />}

      {state.status === 'error' && (
        <div className="space-y-4">
          <ErrorState title="We couldn’t confirm this payment" error={state.error} onRetry={retry} />
          <p className="text-center text-sm text-muted">
            If money was taken it will still be recorded automatically within a few minutes.
          </p>
          <div className="flex justify-center">
            <Button variant="ghost" leftIcon={ArrowLeft} to="/dashboard/applied-tutors">
              Back to applicants
            </Button>
          </div>
        </div>
      )}

      <Presence show={state.status === 'success'} enter={{ opacity: [0, 1], y: [16, 0] }} duration={0.5}>
        {state.payment && <SuccessReceipt payment={state.payment} />}
      </Presence>
    </div>
  );
}

function Verifying() {
  return (
    <LoadingRegion label="Confirming your payment">
      <Card className="text-center">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Loader2 className="size-7 animate-spin" aria-hidden />
        </div>
        <h1 className="text-2xl font-semibold">Confirming your payment…</h1>
        <p className="mt-1.5 text-sm text-muted">This only takes a moment. Please keep this tab open.</p>
        <div className="mt-8 space-y-4 border-t border-dashed border-soft pt-6 text-left">
          <Skeleton className="mx-auto h-9 w-32" />
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-36" />
            </div>
          ))}
        </div>
      </Card>
    </LoadingRegion>
  );
}

/** Check mark that pops in with a soft spring. */
function SuccessMark() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced) return undefined;
    set(el, { scale: 0.4, opacity: 0 });
    const c = animate(el, { scale: [0.4, 1], opacity: [0, 1] }, { spring: 'bouncy', delay: 0.15 });
    return () => c.stop();
  }, [reduced]);

  return (
    <div className="relative mx-auto mb-5 size-16">
      <div className="absolute inset-0 scale-150 rounded-full bg-success/15 blur-xl" aria-hidden />
      <div ref={ref} className="relative flex size-16 items-center justify-center rounded-full bg-success text-success-content pulse-ring">
        <Check className="size-8" strokeWidth={2.75} aria-hidden />
      </div>
    </div>
  );
}

function ReceiptRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="shrink-0 text-sm text-subtle">{label}</dt>
      <dd className="min-w-0 text-right text-sm font-medium">{children}</dd>
    </div>
  );
}

function SuccessReceipt({ payment }) {
  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(payment.transactionId);
      notify.success('Transaction ID copied');
    } catch {
      notify.error('Couldn’t copy the ID');
    }
  };

  return (
    <Card className="relative overflow-hidden text-center">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-success/10 to-transparent" aria-hidden />
      <div className="relative">
        <SuccessMark />
        <Reveal variant="up" delay={0.2} duration={0.6}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-success">Payment confirmed</p>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">You’ve hired {payment.tutorName || 'your tutor'}!</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            We’ve let them know. Their contact details are now unlocked, so reach out to agree a start date.
          </p>
        </Reveal>

        <Reveal variant="up" delay={0.35} duration={0.6} className="mt-8 rounded-2xl border border-dashed border-soft bg-soft/50 px-4 py-5 text-left sm:px-6">
          <p className="text-center text-xs text-subtle">Amount paid</p>
          <p className="text-center font-display text-4xl font-semibold tracking-tight">{money(payment.amount)}</p>
          <dl className="mt-4 divide-y divide-base-content/8">
            <ReceiptRow label="Tutor">{payment.tutorName || '—'}</ReceiptRow>
            <ReceiptRow label="Tuition">
              <span className="line-clamp-2">{payment.tuitionTitle || '—'}</span>
            </ReceiptRow>
            <ReceiptRow label="Transaction">
              <span className="inline-flex max-w-full items-center gap-1">
                <code className="truncate font-mono text-xs text-base-content/80" title={payment.transactionId}>
                  {payment.transactionId}
                </code>
                {payment.transactionId && <IconButton icon={Copy} label="Copy transaction ID" size="icon-sm" onClick={copyId} />}
              </span>
            </ReceiptRow>
            <ReceiptRow label="Paid on">{dateTime(payment.paidAt)}</ReceiptRow>
          </dl>
        </Reveal>

        <p className="mt-5 inline-flex items-center gap-1.5 text-xs text-subtle">
          <ShieldCheck className="size-3.5" aria-hidden /> Processed securely by Stripe
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button to="/dashboard/applied-tutors" leftIcon={UserRound}>
            View my tutor
          </Button>
          <Button variant="outline" to="/dashboard/payment-history" leftIcon={Receipt}>
            Payment history
          </Button>
        </div>
      </div>
    </Card>
  );
}
