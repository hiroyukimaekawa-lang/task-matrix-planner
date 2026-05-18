import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCwkho2FI7eTPAMDe5WD0Q-XPxTRl15fEs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "task-matrix-38c69.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "task-matrix-38c69",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "task-matrix-38c69.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "750804213178",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:750804213178:web:a0d2fb83108f31522bd183",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-6SJPBDMG81",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Google Auth Scope for Calendar API integration
// We can ask for calendar scope during Google Sign-in to make the login & calendar permission fully seamless in one step!
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');
