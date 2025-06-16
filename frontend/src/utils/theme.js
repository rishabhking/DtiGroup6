import { createTheme } from '@mui/material/styles';

const getTheme = (darkMode) => createTheme({
  palette: {
    mode: darkMode ? 'dark' : 'light',
    primary: {
      main: '#3498db', // A nice blue for coding theme
      light: '#5dade2',
      dark: '#2980b9',
    },
    secondary: {
      main: '#2ecc71', // Green for success indicators
      light: '#58d68d',
      dark: '#27ae60',
    },
    error: {
      main: '#e74c3c',
    },
    background: {
      default: darkMode ? '#121212' : '#f8f9fa',
      paper: darkMode ? '#1e1e1e' : '#ffffff',
    },
    text: {
      primary: darkMode ? '#ffffff' : '#2c3e50',
      secondary: darkMode ? '#b0b0b0' : '#7f8c8d',
      disabled: darkMode ? '#666666' : '#bdc3c7',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
    code: {
      fontFamily: '"Fira Code", "Roboto Mono", monospace',
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
      padding: '2px 4px',
      borderRadius: 4,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        containedPrimary: {
          boxShadow: '0 4px 6px rgba(52, 152, 219, 0.25)',
        },
        containedSecondary: {
          boxShadow: '0 4px 6px rgba(46, 204, 113, 0.25)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 3px 5px 2px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          overflow: 'hidden',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
});

// Export the getTheme function for dynamic theming
export { getTheme };

// Export a default light theme for backwards compatibility
export default getTheme(false);
