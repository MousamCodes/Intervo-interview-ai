import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC-KlEoKpeUpNHf7mfUvDAOLxTEkqfmS7Q",
  authDomain: "intervo-1ca84.firebaseapp.com",
  projectId: "intervo-1ca84",
  storageBucket: "intervo-1ca84.firebasestorage.app",
  messagingSenderId: "947270443712",
  appId: "1:947270443712:web:3bcb00c0f4161d6d738325",
  measurementId: "G-QEQ0Z2DW1V"
};
//initialize firebase app
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);