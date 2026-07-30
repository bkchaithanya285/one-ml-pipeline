import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDgTBpcIidwF0FOIAlczoeFz6kS4GUA4wU",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "one-ml-pipe.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "one-ml-pipe",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "one-ml-pipe.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "856858577928",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:856858577928:web:c5d88e07a847808fe495bd",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-CRVXBT8WSY",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Enforce Google Account Chooser (List saved accounts + 'Use another account' option)
googleProvider.setCustomParameters({
  prompt: "select_account",
  hd: "klu.ac.in",
});

export { app, auth, db, googleProvider };
