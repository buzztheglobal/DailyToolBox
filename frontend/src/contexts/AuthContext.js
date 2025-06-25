// frontend/src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { firebaseConfig, initialAuthToken } from "../firebase/firebaseConfig";
// Mock Firebase config for Canvas demo. In real app, this comes from firebaseConfig.js
const firebaseConfigMock = {
  apiKey: "MOCK_API_KEY",
  authDomain: "MOCK_AUTH_DOMAIN",
  projectId: "MOCK_PROJECT_ID",
  storageBucket: "MOCK_STORAGE_BUCKET",
  messagingSenderId: "MOCK_MESSAGING_SENDER_ID",
  appId: "MOCK_APP_ID",
  measurementId: "MOCK_MEASUREMENT_ID"
};

// Global access for Firebase (for Canvas execution)
let auth;
let db;

firebase.initializeApp(firebaseConfig);
const token = initialAuthToken;

// Function to initialize Firebase dynamically based on __firebase_config (for Canvas)
const initializeFirebase = async () => {
    // __firebase_config and __initial_auth_token are global variables provided by the Canvas environment.
    // ESLint might flag them as 'no-undef', but they are expected to be available at runtime.
    let firebaseConfig;
    try {
      // Attempt to import firebaseConfig if running locally
      const firebaseConfigModule = await import('../firebase/firebaseConfig'); // Adjust path
      firebaseConfig = firebaseConfigModule.default;
    } catch (e) {
      console.warn("firebaseConfig.js not found or failed to import. Using mock config. This is expected in Canvas environment.");
      firebaseConfig = firebaseConfigMock;
    }

    const config = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : firebaseConfig;

    const firebaseApp = (await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js')).initializeApp(config);
    auth = (await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js')).getAuth(firebaseApp);
    db = (await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js')).getFirestore(firebaseApp);

    // Sign in with custom token if available, otherwise anonymously
    const signInWithCustomToken = (await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js')).signInWithCustomToken;
    const signInAnonymously = (await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js')).signInAnonymously;

    if (typeof __initial_auth_token !== 'undefined') {
        await signInWithCustomToken(auth, __initial_auth_token);
    } else {
        await signInAnonymously(auth);
    }
    return { auth, db };
};

const defaultAuthContextValue = {
  currentUser: null,
  loading: true, // Should be true initially as auth is not ready
  isAuthReady: false,
  signup: () => Promise.reject('Auth not initialized'),
  login: () => Promise.reject('Auth not initialized'),
  logout: () => Promise.reject('Auth not initialized'),
  getIdToken: () => Promise.resolve(null),
};

const AuthContext = createContext(defaultAuthContextValue);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const initAndListen = async () => {
      const firebaseServices = await initializeFirebase();
      auth = firebaseServices.auth;
      db = firebaseServices.db;

      const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js');


      const unsubscribe = onAuthStateChanged(auth, user => {
        setCurrentUser(user);
        setLoading(false);
        setIsAuthReady(true);
      });

      return unsubscribe;
    };

    initAndListen();
  }, []);

  const signup = async (email, password) => {
    const { createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js');
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = async (email, password) => {
    const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js');
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    const { signOut } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js');
    return signOut(auth);
  };

  const getIdToken = async () => {
    if (currentUser) {
      try {
        const token = await currentUser.getIdToken();
        return token;
      } catch (error) {
        console.error("Error getting Firebase ID token:", error);
        return null;
      }
    }
    return null;
  };

  const value = {
    currentUser,
    signup,
    login,
    logout,
    getIdToken,
    isAuthReady
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* Conditionally render children only when loading is false */}
    </AuthContext.Provider>
  );
};