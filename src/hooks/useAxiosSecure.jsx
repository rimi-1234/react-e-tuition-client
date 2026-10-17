import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import useAuth from './useAuth';

/**
 * axiosSecure – a shared Axios instance pre-configured with:
 *   • baseURL from VITE_API_URL
 *   • A request interceptor that attaches a fresh Firebase ID token
 *     (obtained via currentUser.getIdToken()) to every request.
 *   • A response interceptor that logs out + redirects on 401 only.
 *
 * The interceptors are attached at module load time (NOT inside useEffect)
 * so there is never a race condition between the first query firing and
 * the interceptor being registered.
 *
 * Why getIdToken() instead of user.accessToken?
 *   user.accessToken is the Google OAuth access token for Google-signed-in
 *   users, NOT the Firebase ID token. Firebase Admin's verifyIdToken() only
 *   accepts the Firebase ID token. getIdToken() always returns the correct
 *   token and auto-refreshes it when it expires.
 */

const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// ── Request interceptor (module-level, runs once) ─────────────────────
axiosSecure.interceptors.request.use(
  async (config) => {
    // Read the current user directly from the Firebase auth singleton.
    // This is synchronous and always up-to-date — no React state needed.
    const currentUser = getAuth().currentUser;
    if (currentUser) {
      // getIdToken() auto-refreshes the token if it is within 5 min of expiry.
      const idToken = await currentUser.getIdToken();
      config.headers.authorization = `Bearer ${idToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor placeholder (hook fills in the navigate fn) ──
// We store the logout + navigate callback here so the module-level
// interceptor can call it without a React hook dependency.
let _onAuthError = null;

axiosSecure.interceptors.response.use(
  (res) => res,
  async (err) => {
    // 401 = token missing / expired → log out and redirect to login.
    // 403 = authenticated but wrong role → do NOT log out; let the
    //       component handle it gracefully (show error, not login page).
    if (err?.response?.status === 401) {
      if (_onAuthError) await _onAuthError();
    }
    return Promise.reject(err);
  }
);

// ── Hook ──────────────────────────────────────────────────────────────
const useAxiosSecure = () => {
  const { logOut } = useAuth();
  const navigate   = useNavigate();

  // Register the auth-error handler once per mount.
  // Using useEffect with stable references means this only runs once.
  useEffect(() => {
    _onAuthError = async () => {
      try {
        await logOut();
      } catch {
        // ignore logout errors
      }
      navigate('/login');
    };
    // On unmount reset so a stale closure doesn't fire after logout
    return () => { _onAuthError = null; };
  }, [logOut, navigate]);

  return axiosSecure;
};

export default useAxiosSecure;
