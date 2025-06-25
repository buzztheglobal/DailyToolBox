// frontend/src/firebaseConfig.js
// THIS IS YOUR ACTUAL FIREBASE CLIENT CONFIGURATION
// Replace with your real Firebase Web App config from Firebase Console -> Project settings -> Your apps -> Web app
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// 1. Import the messaging service
import { getMessaging } from "firebase/messaging";


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

// Initialize and export Firebase Authentication
const auth = getAuth(app);

// 2. Initialize and export Firebase Cloud Messaging
const messaging = getMessaging(app);

// 3. Export everything for the rest of your app to use
export { app, auth, messaging };

// This export is likely for a different purpose and can be kept or removed
export const initialAuthToken = null;
