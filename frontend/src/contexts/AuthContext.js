import React, { useContext, useState, useEffect } from 'react';
// CORRECT: Import the provider classes directly from "firebase/auth"
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,     // <-- ADDED
    FacebookAuthProvider    // <-- ADDED
} from "firebase/auth";
import { auth } from '../firebaseConfig'; // Your firebase config

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState();
    const [loading, setLoading] = useState(true);

    function signup(email, password) {
        // This was already correct
        return createUserWithEmailAndPassword(auth, email, password);
    }

    function login(email, password) {
        // This was already correct
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        // This was already correct
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        signup,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

// --- THIS IS THE CORRECTED PART ---
// Use the imported classes directly instead of the old namespaced way
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();