// frontend/src/App.js
/* global __firebase_config, __initial_auth_token */
import React, { useState, useEffect, createContext, useContext } from 'react';
// import './App.css'; // You can keep this for custom global CSS, or remove if using only MUI
import { createTheme, ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material'; // Import GlobalStyles

// Import your newly created/updated components
import Signup from './components/Auth/Signup';
import Login from './components/Auth/Login';
import Dashboard from './components/Auth/Dashboard';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import CardsSection from './components/Content/CardsSection';

import { Container, Box, Typography, Button, CircularProgress } from '@mui/material';

// Mock Firebase config for Canvas demo. In real app, this comes from firebaseConfig.js
// If you are running locally, ensure frontend/src/firebaseConfig.js exists with your actual config.
const firebaseConfigMock = {
  apiKey: "MOCK_API_KEY",
  authDomain: "MOCK_AUTH_DOMAIN",
  projectId: "MOCK_PROJECT_ID",
  storageBucket: "MOCK_STORAGE_BUCKET",
  messagingSenderId: "MOCK_MESSAGING_SENDER_ID",
  appId: "MOCK_APP_ID",
  measurementId: "MOCK_MEASUREMENT_ID"
};

// Global access for Firebase (for Canvas execution and local setup)
let auth;
let db;

// Function to initialize Firebase dynamically based on __firebase_config (for Canvas)
const initializeFirebase = async () => {
    // __firebase_config and __initial_auth_token are global variables provided by the Canvas environment.
    // ESLint might flag them as 'no-undef', but they are expected to be available at runtime.
    // For local development, it will fall back to the imported firebaseConfig.
    let firebaseConfig;
    try {
      // Attempt to import firebaseConfig if running locally
      const firebaseConfigModule = await import('./firebaseConfig'); // Path is correct for App.js
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

// Global CSS styles (for App.js)
const GlobalCss = () => (
  <GlobalStyles styles={{
    body: {
      margin: 0,
      padding: 0,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
    },
    'body.dark-mode': {
      backgroundColor: '#121212',
      color: '#ffffff',
    },
    'a': {
      textDecoration: 'none',
      color: 'inherit',
    },
    'code': {
      fontFamily: 'source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace',
    },
    // Add any other global styles you need here
  }} />
);


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