// frontend/src/components/Auth/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Container, Typography, Box, CircularProgress, Button } from '@mui/material';

function Dashboard() {
  const { currentUser, getIdToken } = useAuth();
  const [message, setMessage] = useState('Loading protected message...');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProtectedData = async () => {
      if (!currentUser) {
        setMessage('Please log in to access the dashboard.');
        setLoading(false);
        return;
      }

      try {
        const token = await getIdToken();
        if (!token) {
          setError('No Firebase ID token found.');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:8000/api/protected/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch protected data: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        setMessage(data.message);
      } catch (err) {
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProtectedData();
  }, [currentUser, getIdToken]); // Re-run when currentUser or getIdToken changes

  if (loading) {
    return (
      <Container component="main" maxWidth="md" sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading Dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 8, mb: 4, p: 3, border: '1px solid #ccc', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Dashboard
        </Typography>
        {currentUser ? (
          <>
            <Typography variant="h6">Welcome, {currentUser.email || currentUser.uid}!</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              {message}
            </Typography>
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </>
        ) : (
          <Typography variant="h6" color="error">
            You are not logged in.
          </Typography>
        )}
      </Box>
    </Container>
  );
}

export default Dashboard;