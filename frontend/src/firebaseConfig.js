// frontend/src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

// Make sure you have replaced these with your actual Firebase project keys
export const firebaseConfig = {
  apiKey: "AIzaSyD4OLp3L4N7ZUnGt6g7J6kiHOD-QDjMz_Q",
  authDomain: "dailytoolbox-5d842.firebaseapp.com",
  projectId: "dailytoolbox-5d842",
  storageBucket: "dailytoolbox-5d842.firebasestorage.app",
  messagingSenderId: "391083117371",
  appId: "1:391083117371:web:e259f8c7e09a01ae6a451e",
  measurementId: "G-B6T97GV0Q7"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
const auth = getAuth(app);
const messaging = getMessaging(app);

// Export everything for the rest of your app to use
export { app, auth, messaging };