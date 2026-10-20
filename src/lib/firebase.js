import { initializeApp } from 'firebase/app';

// Firebase web config is public by design; access is enforced by Firebase Auth
// rules and the API's token verification. Env vars override the defaults.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDR1lLw0VQZLWblkFirhukiOGQRhj0fQHU',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'react-zap-sift.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'react-zap-sift',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'react-zap-sift.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '208015414726',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:208015414726:web:a4009031fbae2aedbd8ec7',
};

export const app = initializeApp(firebaseConfig);
