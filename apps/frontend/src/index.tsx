import React from 'react';
import { createRoot } from 'react-dom/client';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import App from './App';
import { ContextProvider } from './components/Context/Context';
import reportWebVitals from './reportWebVitals';
import './i18n';
import './index.css';
import '@fullcalendar/react/skeleton.css';

const theme = createTheme({
  palette: {
    primary: { main: '#1f6b45' },
    secondary: { main: '#d97706' },
    background: { default: '#f6f7fb' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiTextField: { defaultProps: { variant: 'outlined' } },
  },
});

const container = document.getElementById('root');

if (!container) throw new Error("L'élément racine #root est introuvable.");

createRoot(container).render(
  <ThemeProvider theme={theme}>
    <ContextProvider>
      <React.StrictMode><App /></React.StrictMode>
    </ContextProvider>
  </ThemeProvider>,
);

reportWebVitals();
