// frontend/src/index.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// CORRECT: Import ThemeProvider and createTheme from Material-UI
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create a default theme instance. This is required by ThemeProvider.
const theme = createTheme();

// The '!' or 'as HTMLElement' tells TypeScript that we know this element exists.
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    {/* CORRECT: Wrap the entire App in ThemeProvider and pass the theme object */}
    <ThemeProvider theme={theme}>
      {/* CssBaseline fixes styling inconsistencies across browsers */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();