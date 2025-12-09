// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDR1lLw0VQZLWblkFirhukiOGQRhj0fQHU",
  authDomain: "react-zap-sift.firebaseapp.com",
  projectId: "react-zap-sift",
  storageBucket: "react-zap-sift.firebasestorage.app",
  messagingSenderId: "208015414726",
  appId: "1:208015414726:web:a4009031fbae2aedbd8ec7"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig)