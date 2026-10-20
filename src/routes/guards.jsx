import { Navigate, useLocation } from 'react-router';
import { ShieldAlert } from 'lucide-react';
import { Button, EmptyState, ErrorState } from '../components/ui';
import { useAuth } from '../providers/AuthProvider';
import { DashboardFallback } from './fallbacks';

/** Requires a signed-in user with a profile; remembers where they were going. */
export function RequireAuth({ children }) {
  const { isAuthenticated, user, loading, profileError, refreshUser } = useAuth();
  const location = useLocation();

  if (loading) return <DashboardFallback />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  if (profileError && !user) {
    return (
      <div className="container-page py-24">
        <ErrorState title="We couldn’t load your account" error={profileError} onRetry={refreshUser} />
      </div>
    );
  }
  return children;
}

/** Restricts a route to one or more roles. */
export function RequireRole({ roles, children }) {
  const { role } = useAuth();
  if (!roles.includes(role)) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="This page isn’t available for your account"
        description={`It’s only for ${roles.join(' or ').toLowerCase()} accounts. Head back to your dashboard to continue.`}
        action={<Button to="/dashboard">Back to dashboard</Button>}
      />
    );
  }
  return children;
}

/** Sends signed-in users away from login/sign-up. */
export function GuestOnly({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  if (!loading && isAuthenticated && user) return <Navigate to={location.state?.from?.pathname || '/dashboard'} replace />;
  return children;
}
