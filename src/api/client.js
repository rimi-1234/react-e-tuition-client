import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { app } from '../lib/firebase';

const API_ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

/**
 * Single HTTP client for the Edurock API.
 *  - attaches a fresh Firebase ID token (auto-refreshed by the SDK)
 *  - unwraps the { success, data, meta } envelope
 *  - normalises every failure into an ApiError with a human message
 */
export const http = axios.create({
  baseURL: `${API_ROOT}/api/v1`,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use(async (config) => {
  const user = getAuth(app).currentUser;
  if (user) config.headers.Authorization = `Bearer ${await user.getIdToken()}`;
  return config;
});

export class ApiError extends Error {
  constructor({ message, status, code, details }) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
  /** Field → message map for react-hook-form's setError. */
  get fieldErrors() {
    return Object.fromEntries((this.details || []).map((d) => [d.field, d.message]));
  }
}

let onUnauthorized = null;
/** Registered once by the auth provider: signs the user out on a 401. */
export const setUnauthorizedHandler = (fn) => (onUnauthorized = fn);

http.interceptors.response.use(
  (res) => res,
  (error) => {
    const res = error.response;
    // Chat endpoints use their own token; an expired chat must not sign the user out.
    if (res?.status === 401 && !error.config?.url?.startsWith('/chat/')) onUnauthorized?.();

    const message =
      res?.data?.message ||
      (error.code === 'ECONNABORTED'
        ? 'The server took too long to respond. It may be waking up — please try again.'
        : !res
          ? 'Can’t reach the server. Check your connection and try again.'
          : 'Something went wrong. Please try again.');

    return Promise.reject(new ApiError({ message, status: res?.status, code: res?.data?.code, details: res?.data?.details }));
  },
);

/** GET returning just `data` (for most queries). */
export const get = (url, params) => http.get(url, { params: clean(params) }).then((r) => r.data.data);
/** GET returning { items, meta } (for paginated lists). */
export const list = (url, params) =>
  http.get(url, { params: clean(params) }).then((r) => ({ items: r.data.data, meta: r.data.meta }));
export const post = (url, body) => http.post(url, body).then((r) => r.data);
export const patch = (url, body) => http.patch(url, body).then((r) => r.data);
export const del = (url) => http.delete(url).then((r) => r.data);

/** Drop empty filter values so URLs (and cache keys) stay tidy. */
function clean(params) {
  if (!params) return undefined;
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null && v !== 'all'));
}
