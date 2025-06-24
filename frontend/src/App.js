// frontend/src/App.js
/* global __firebase_config, __initial_auth_token */
import React, { useState, useEffect, createContext, useContext } => 'react';
import './App.css'; // Your main app CSS
// Material-UI imports for global theme/styling if needed
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

import Signup from './components/Auth/Signup';
import Login from './components/Auth/Login';
import Dashboard from './components/Auth/Dashboard';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import CardsSection from './components/Content/CardsSection';

import { Container, Box, Typography, Button, CircularProgress } from '@mui/material';

// Mock Firebase config for Canvas demo. In real app, this comes from firebaseConfig.js
// Removed firebaseAppMock as it was unused and causing linting warnings.
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

// Function to initialize Firebase dynamically based on __firebase_config (for Canvas)
const initializeFirebase = async () => {
    // __firebase_config and __initial_auth_token are global variables provided by the Canvas environment.
    // ESLint might flag them as 'no-undef', but they are expected to be available at runtime.
    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : firebaseConfigMock;

    const firebaseApp = (await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js')).initializeApp(firebaseConfig);
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

// AuthContext.js (Copied for self-contained example)
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

// MainAppContent Component (extracted to use AuthContext correctly)
function MainAppContent() {
  const { isAuthReady } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [currentCategory, setCurrentCategory] = useState('home');

  // Updated handleNavigation to parse URLs from Navbar
  const handleNavigation = (linkOrPageName, category = 'home') => {
    if (linkOrPageName.startsWith('/tools/')) {
      setCurrentPage('cards');
      setCurrentCategory('tools'); // Or dynamically extract from URL if needed
    } else if (linkOrPageName.startsWith('/convertors/')) {
      setCurrentPage('cards');
      setCurrentCategory('convertors'); // Or dynamically extract from URL if needed
    } else if (linkOrPageName === '/' || linkOrPageName === 'home') {
      setCurrentPage('home');
      setCurrentCategory('home');
    } else if (linkOrPageName === 'login') {
      setCurrentPage('login');
    } else if (linkOrPageName === 'signup') {
      setCurrentPage('signup');
    } else if (linkOrPageName === 'dashboard') {
      setCurrentPage('dashboard');
    } else {
      // Fallback for unexpected links
      setCurrentPage('home');
      setCurrentCategory('home');
      console.warn(`Unhandled navigation link: ${linkOrPageName}`);
    }
  };

  if (!isAuthReady) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Initializing Authentication...</Typography>
      </Box>
    );
  }

  const renderPageContent = () => {
    switch (currentPage) {
      case 'signup':
        return <Signup />;
      case 'login':
        return <Login />;
      case 'dashboard':
        return <Dashboard />;
      case 'cards':
        return <CardsSection selectedCategory={currentCategory} />;
      case 'home':
      default:
        return (
          <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
            <Typography variant="h3" gutterBottom>Welcome to DailyToolbox!</Typography>
            <Typography variant="h6" paragraph>Your one-stop solution for various online tools and convertors.</Typography>
            <Box sx={{ mt: 4 }}>
              <Button variant="contained" sx={{ mr: 2, borderRadius: '8px' }} onClick={() => handleNavigation('login')}>Login</Button>
              <Button variant="outlined" sx={{ borderRadius: '8px' }} onClick={() => handleNavigation('signup')}>Sign Up</Button>
              <Button variant="text" sx={{ ml: 2, borderRadius: '8px' }} onClick={() => handleNavigation('dashboard')}>Dashboard</Button>
            </Box>
            <CardsSection selectedCategory="home" />
          </Container>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar setCurrentPage={handleNavigation} />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {renderPageContent()}
      </Box>
      <Footer />
    </Box>
  );
}

// App Component (main entry point)
function App() {
  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: '#f0f2f5',
        paper: '#ffffff',
      },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    borderRadius: '0 0 12px 12px',
                },
            },
        },
        MuiInputBase: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                },
            },
        },
    }
  });

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#90caf9',
      },
      secondary: {
        main: '#f48fb1',
      },
      background: {
        default: '#121212',
        paper: '#1d1d1d',
      },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    borderRadius: '0 0 12px 12px',
                },
            },
        },
        MuiInputBase: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                },
            },
        },
    }
  });

  const [currentTheme, setCurrentTheme] = useState(lightTheme);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (document.body.classList.contains('dark-mode')) {
        setCurrentTheme(darkTheme);
      } else {
        setCurrentTheme(lightTheme);
      }
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, [lightTheme, darkTheme]);

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <GlobalCss />
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

// Global CSS for body background and font (for basic styling, could be in index.css)
// This is added here to ensure it's part of the single immersive.
// For a production React app, these would typically be in an external CSS file.
const GlobalCss = () => (
    <style>{`
        body {
            margin: 0;
            font-family: 'Inter', sans-serif; /* Using Inter font */
            -webkit-font-smoothing: antialiased;
            -moz-osx-moz-smoothing: grayscale;
            transition: background-color 0.3s ease-in-out;
        }

        body.dark-mode {
            background-color: #121212;
            color: #e0e0e0;
        }

        #root {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }
        .App {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
        }
        main {
            flex-grow: 1;
        }
        /* Basic Bootstrap-like styling if not using full Bootstrap JS */
        .container {
            width: 100%;
            padding-right: var(--bs-gutter-x,.75rem);
            padding-left: var(--bs-gutter-x,.75rem);
            margin-right: auto;
            margin-left: auto;
        }
        @media (min-width: 576px) { .container { max-width: 540px; } }
        @media (min-width: 768px) { .container { max-width: 720px; } }
        @media (min-width: 992px) { .container { max-width: 960px; } }
        @media (min-width: 1200px) { .container { max-width: 1140px; } }
        @media (min-width: 1400px) { .container { max-width: 1320px; } }

        /* Bootstrap grid system (basic) for responsiveness */
        .row {
            --bs-gutter-x: 1.5rem;
            --bs-gutter-y: 0;
            display: flex;
            flex-wrap: wrap;
            margin-top: calc(var(--bs-gutter-y) * -1);
            margin-right: calc(var(--bs-gutter-x) * -.5);
            margin-left: calc(var(--bs-gutter-x) * -.5);
        }
        .col-md-4 {
            flex: 0 0 auto;
            width: 33.33333333%;
        }
        .col-12 {
            flex: 0 0 auto;
            width: 100%;
        }
        .col-sm-6 {
            flex: 0 0 auto;
            width: 50%;
        }
    `}</style>
);