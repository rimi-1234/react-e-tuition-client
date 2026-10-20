import toast, { Toaster } from 'react-hot-toast';
import { CheckCircle2, Info, XCircle } from 'lucide-react';

/**
 * Promise-based confirmation dialog (SweetAlert2, themed in index.css).
 *   if (await confirmAction({ title: 'Delete tuition?', danger: true })) …
 */
export async function confirmAction({
  title = 'Are you sure?',
  text = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
  input,
  inputPlaceholder,
  inputValidator,
}) {
  // Loaded on first use: keeps ~80 kB out of the initial bundle.
  const { default: Swal } = await import('sweetalert2');
  const result = await Swal.fire({
    title,
    text,
    icon: danger ? 'warning' : 'question',
    iconColor: danger ? 'var(--color-error)' : 'var(--color-primary)',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    focusCancel: danger,
    buttonsStyling: false,
    input,
    inputPlaceholder,
    inputValidator,
    customClass: {
      confirmButton: `inline-flex h-11 items-center rounded-xl px-5 text-sm font-medium ${danger ? 'bg-error text-error-content' : 'bg-primary text-primary-content'}`,
      cancelButton: 'inline-flex h-11 items-center rounded-xl border border-soft bg-base-100 px-5 text-sm font-medium text-base-content',
      input: 'mx-6! rounded-xl! border-soft! bg-base-100! text-base-content! text-sm!',
    },
  });
  if (!result.isConfirmed) return input ? null : false;
  return input ? result.value : true;
}

/** Toast helpers with consistent icons. */
export const notify = {
  success: (msg, opts) => toast.success(msg, opts),
  error: (msgOrError, opts) => toast.error(typeof msgOrError === 'string' ? msgOrError : msgOrError?.message || 'Something went wrong', opts),
  info: (msg, opts) => toast(msg, { icon: <Info className="size-5 text-info" />, ...opts }),
  loading: (msg, opts) => toast.loading(msg, opts),
  promise: toast.promise,
  dismiss: toast.dismiss,
};

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      containerStyle={{ top: 84 }}
      gutter={10}
      toastOptions={{
        duration: 3500,
        className: '!bg-base-100 !text-base-content !border !border-soft !shadow-[var(--shadow-lift)] !rounded-2xl !text-sm !px-4 !py-3 !max-w-sm',
        success: { icon: <CheckCircle2 className="size-5 shrink-0 text-success" /> },
        error: { icon: <XCircle className="size-5 shrink-0 text-error" />, duration: 5000 },
      }}
    />
  );
}
