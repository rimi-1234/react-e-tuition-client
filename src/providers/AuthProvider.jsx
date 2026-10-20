import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { setUnauthorizedHandler } from '../api/client';
import { api, qk } from '../api/endpoints';
import { app } from '../lib/firebase';

const auth = getAuth(app);
const google = new GoogleAuthProvider();
const AuthContext = createContext(null);

/** Firebase error codes → messages a person can act on. */
const FRIENDLY = {
  'auth/invalid-credential': 'That email and password don’t match. Please try again.',
  'auth/wrong-password': 'That email and password don’t match. Please try again.',
  'auth/user-not-found': 'No account uses that email yet.',
  'auth/email-already-in-use': 'An account with this email already exists. Try signing in.',
  'auth/weak-password': 'Choose a stronger password (at least 6 characters).',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/popup-closed-by-user': 'The sign-in window was closed before finishing.',
  'auth/network-request-failed': 'Network error. Check your connection.',
};
export const authMessage = (error) => FRIENDLY[error?.code] || error?.message || 'Authentication failed';

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [firebaseUser, setFirebaseUser] = useState(auth.currentUser);
  const [ready, setReady] = useState(false);
  // Profile details captured at sign-up, used for the first /auth/sync.
  const pending = useRef(null);

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setFirebaseUser(u);
        setReady(true);
        if (!u) queryClient.removeQueries({ queryKey: qk.me });
      }),
    [queryClient],
  );

  const logOut = useCallback(async () => {
    await signOut(auth);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => setUnauthorizedHandler(() => auth.currentUser && logOut()), [logOut]);

  /**
   * The Mongo profile. If the account exists in Firebase but not yet in the
   * API (first sign-in, Google sign-up), it is created on the fly via /auth/sync.
   */
  const me = useQuery({
    queryKey: [...qk.me, firebaseUser?.uid],
    enabled: Boolean(firebaseUser),
    staleTime: 5 * 60_000,
    retry: 1,
    queryFn: async () => {
      try {
        return await api.auth.me();
      } catch (error) {
        if (error.status !== 403 || error.code !== 'FORBIDDEN' || !/finish creating/i.test(error.message)) throw error;
        const extra = pending.current || {};
        const { data } = await api.auth.sync({
          displayName: extra.displayName || firebaseUser.displayName || undefined,
          photoURL: extra.photoURL || firebaseUser.photoURL || undefined,
          phone: extra.phone || undefined,
          role: extra.role,
        });
        pending.current = null;
        return data;
      }
    },
  });

  const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const signUp = async ({ email, password, displayName, photoURL, phone, role }) => {
    pending.current = { displayName, photoURL, phone, role };
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName, photoURL: photoURL || null });
    return cred;
  };

  const signInWithGoogle = (role) => {
    pending.current = role ? { role } : null;
    return signInWithPopup(auth, google);
  };

  const signInDemo = async (role) => {
    const { token } = await api.auth.demo(role);
    return signInWithCustomToken(auth, token);
  };

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  const user = me.data || null;
  const value = useMemo(
    () => ({
      firebaseUser,
      user,
      role: user?.role || null,
      isAuthenticated: Boolean(firebaseUser),
      // Loading until we know both "is someone signed in" and "who are they".
      loading: !ready || (Boolean(firebaseUser) && me.isPending),
      profileError: me.error,
      signIn,
      signUp,
      signInWithGoogle,
      signInDemo,
      resetPassword,
      logOut,
      refreshUser: () => queryClient.invalidateQueries({ queryKey: qk.me }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [firebaseUser, user, ready, me.isPending, me.error, logOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
