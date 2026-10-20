import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { Briefcase, GraduationCap, ShieldCheck } from 'lucide-react';
import { authMessage, useAuth } from '../../providers/AuthProvider';
import { Button, notify } from '../ui';

export function Divider({ label = 'or' }) {
  return (
    <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-wider text-subtle">
      <span className="h-px flex-1 bg-base-content/10" />
      {label}
      <span className="h-px flex-1 bg-base-content/10" />
    </div>
  );
}

export function GoogleButton({ role, label = 'Continue with Google', onDone }) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const go = async () => {
    setLoading(true);
    try {
      await signInWithGoogle(role);
      onDone?.();
    } catch (err) {
      if (err?.code !== 'auth/popup-closed-by-user') notify.error(authMessage(err));
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button variant="outline" size="lg" className="w-full" onClick={go} loading={loading} leftIcon={FcGoogle}>
      {label}
    </Button>
  );
}

const DEMOS = [
  { role: 'Student', icon: GraduationCap },
  { role: 'Tutor', icon: Briefcase },
  { role: 'Admin', icon: ShieldCheck },
];

/** One-click demo accounts (backend issues a short-lived Firebase custom token). */
export function DemoLogin({ onDone }) {
  const { signInDemo } = useAuth();
  const [loading, setLoading] = useState(null);
  const go = async (role) => {
    setLoading(role);
    try {
      await signInDemo(role);
      notify.success(`Signed in as the demo ${role.toLowerCase()}`);
      onDone?.();
    } catch (err) {
      notify.error(err?.message || 'Demo sign-in failed');
    } finally {
      setLoading(null);
    }
  };
  return (
    <div className="rounded-2xl border border-dashed border-soft p-4">
      <p className="mb-3 text-center text-xs font-medium text-subtle">Just looking? Try a demo account</p>
      <div className="grid grid-cols-3 gap-2">
        {DEMOS.map(({ role, icon }) => (
          <Button key={role} variant="secondary" size="sm" leftIcon={icon} loading={loading === role} disabled={Boolean(loading)} onClick={() => go(role)}>
            {role}
          </Button>
        ))}
      </div>
    </div>
  );
}
