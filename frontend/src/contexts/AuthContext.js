import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/ApiService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Check if user is authenticated on app load
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            setLoading(true);
            const response = await ApiService.getCurrentUser();
            if (response.success) {
                setUser(response.user);
            }
        } catch (error) {
            console.log('Not authenticated or token expired');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (identifier, password) => {
        try {
            setError('');
            setLoading(true);
            
            const response = await ApiService.login(identifier, password);
            
            if (response.success) {
                setUser(response.user);
                // Store handle in localStorage for backward compatibility
                if (response.user.codeforceHandle) {
                    localStorage.setItem('userHandle', response.user.codeforceHandle);
                }
                return { success: true, user: response.user };
            } else {
                setError(response.error || 'Login failed');
                return { success: false, error: response.error };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Login failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const signup = async (userData) => {
        try {
            setError('');
            setLoading(true);
            
            const response = await ApiService.signup(userData);
            
            if (response.success) {
                setUser(response.user);
                // Store handle in localStorage for backward compatibility
                if (response.user.codeforceHandle) {
                    localStorage.setItem('userHandle', response.user.codeforceHandle);
                }
                return { success: true, user: response.user };
            } else {
                setError(response.error || 'Signup failed');
                return { success: false, error: response.error };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Signup failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            await ApiService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('userHandle');
            setLoading(false);
        }
    };

    const updateProfile = async (updates) => {
        try {
            setError('');
            const response = await ApiService.updateProfile(updates);
            
            if (response.success) {
                setUser(response.user);
                // Update handle in localStorage if changed
                if (response.user.codeforceHandle) {
                    localStorage.setItem('userHandle', response.user.codeforceHandle);
                } else {
                    localStorage.removeItem('userHandle');
                }
                return { success: true, user: response.user };
            } else {
                setError(response.error || 'Profile update failed');
                return { success: false, error: response.error };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Profile update failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const clearError = () => {
        setError('');
    };

    const value = {
        user,
        loading,
        error,
        login,
        signup,
        logout,
        updateProfile,
        checkAuthStatus,
        clearError,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
