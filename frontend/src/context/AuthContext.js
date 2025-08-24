import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from '../config/api';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configure axios to use token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user on initial load
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Try to get the user from localStorage first for immediate UI response
        const userFromStorage = JSON.parse(localStorage.getItem('user'));
        if (userFromStorage?.id) {
          setCurrentUser(userFromStorage);
        }
        
        // Then verify with the server
        const res = await api.get('/api/auth/me');
        setCurrentUser(res.data.data);
      } catch (err) {
        console.error('Error loading user:', err);
        // If token is invalid or expired, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Register user
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Registering user with data:', userData);
      const res = await api.post('/api/auth/register', userData);
      console.log('Registration response:', res.data);
      
      // Check if the response contains token and user
      if (!res.data.token || !res.data.user) {
        console.error('Invalid response format:', res.data);
        setError('Registration failed: Invalid server response');
        throw new Error('Invalid response format');
      }
      
      const { token, user } = res.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      setToken(token);
      setCurrentUser(user);
      
      return user;
    } catch (err) {
      console.error('Registration error:', err);
      // More detailed error handling
      if (err.response) {
        console.error('Error response:', err.response.data);
        setError(err.response.data.message || 'Registration failed: Server error');
      } else if (err.request) {
        console.error('No response received:', err.request);
        setError('Registration failed: No response from server. Please check if the backend is running.');
      } else {
        console.error('Error setting up request:', err.message);
        setError(`Registration failed: ${err.message}`);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setToken, setCurrentUser]);

  // Login user
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.post('/api/auth/login', { email, password });
      
      const { token, user } = res.data;
      
      // Save token and user info to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setCurrentUser(user);
      
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setToken, setCurrentUser]);

  // Logout user
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    localStorage.removeItem('customerId'); // Remove legacy storage
    setToken(null);
    setCurrentUser(null);
  }, [setToken, setCurrentUser]);

  // Check if user has a specific role
  const hasRole = useCallback((roles) => {
    if (!currentUser?.role) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(currentUser.role);
    }
    
    return currentUser.role === roles;
  }, [currentUser]);

  // Check if current user is admin
  const isAdmin = useCallback(() => hasRole('admin'), [hasRole]);
  
  // Check if current user is seller
  const isSeller = useCallback(() => hasRole('seller'), [hasRole]);
  
  // Check if current user is customer
  const isCustomer = useCallback(() => hasRole('customer'), [hasRole]);

  // Update user profile
  const updateProfile = useCallback(async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.put('/api/profile', profileData);
      
      if (!res.data.success || !res.data.data) {
        throw new Error('Failed to update profile');
      }
      
      // Update current user in context
      setCurrentUser(res.data.data);
      
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setCurrentUser]);

  // Update user password
  const updatePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.put('/api/profile/password', { 
        currentPassword, 
        newPassword 
      });
      
      if (!res.data.success) {
        throw new Error('Failed to update password');
      }
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Computed property to determine authentication status
  const authenticated = !!token && (!!currentUser || !!localStorage.getItem('user'));

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    currentUser,
    token,
    loading,
    error,
    isAuthenticated: authenticated,
    register,
    login,
    logout,
    updateProfile,
    updatePassword,
    hasRole,
    isAdmin,
    isSeller,
    isCustomer,
    setError
  }), [currentUser, token, loading, error, authenticated, register, login, logout, updateProfile, updatePassword, hasRole, isAdmin, isSeller, isCustomer, setError]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
