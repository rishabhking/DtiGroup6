import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import './App.css';

// Theme
import { getTheme } from './utils/theme';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { ThemeModeProvider, useThemeMode } from './contexts/ThemeContext';

// Layout
import Layout from './components/layout/Layout';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Practice from './pages/Practice';
import Duel from './pages/Duel';
import Play from './pages/Play';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';

// App Content Component (needs to be inside ThemeModeProvider)
const AppContent = () => {
  const { darkMode } = useThemeMode();
  const theme = getTheme(darkMode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              
              {/* Authentication routes */}
              <Route 
                path="/login" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Login />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/signup" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Signup />
                  </ProtectedRoute>
                } 
              />
              
              {/* Public routes */}
              <Route path="/practice" element={<Practice />} />
              
              {/* Protected routes */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/duel" 
                element={
                  <ProtectedRoute>
                    <Duel />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/play" 
                element={
                  <ProtectedRoute>
                    <Play />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/play/:duelId" 
                element={
                  <ProtectedRoute>
                    <Play />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all route */}
              <Route path="*" element={<Home />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

function App() {
  return (
    <ThemeModeProvider>
      <AppContent />
    </ThemeModeProvider>
  );
}

export default App;
