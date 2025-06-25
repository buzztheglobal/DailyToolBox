// frontend/src/firebaseConfig.js
// THIS IS YOUR ACTUAL FIREBASE CLIENT CONFIGURATION
// Replace with your real Firebase Web App config from Firebase Console -> Project settings -> Your apps -> Web app
import { initializeApp } from "firebase/app";
// 1. Import the getAuth function
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyD4OLp3L4N7ZUnGt6g7J6kiHOD-QDjMz_Q",
  authDomain: "dailytoolbox-5d842.firebaseapp.com",
  projectId: "dailytoolbox-5d842",
  storageBucket: "dailytoolbox-5d842.firebasestorage.app",
  messagingSenderId: "391083117371",
  appId: "1:391083117371:web:e259f8c7e09a01ae6a451e",
  measurementId: "G-B6T97GV0Q7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. Initialize the Firebase Authentication service and get a reference to it
const auth = getAuth(app);

// 3. Export the auth service so other files can import and use it
export { auth };

// This export is likely for a different purpose and can be kept or removed
export const initialAuthToken = null;
