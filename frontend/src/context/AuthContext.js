import React, { createContext, useState, useEffect } from 'react';
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
        const res = await api.get('/api/auth/me');
        setCurrentUser(res.data.data);
      } catch (err) {
        console.error('Error loading user:', err);
        // If token is invalid or expired, clear it
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Register user
  const register = async (userData) => {
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
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.post('/api/auth/login', { email, password });
      
      const { token, user } = res.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      setToken(token);
      setCurrentUser(user);
      
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
  };

  // Check if user has a specific role
  const hasRole = (roles) => {
    if (!currentUser || !currentUser.role) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(currentUser.role);
    }
    
    return currentUser.role === roles;
  };

  // Check if current user is admin
  const isAdmin = () => hasRole('admin');
  
  // Check if current user is seller
  const isSeller = () => hasRole('seller');
  
  // Check if current user is customer
  const isCustomer = () => hasRole('customer');

  // Update user profile
  const updateProfile = async (profileData) => {
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
  };

  // Update user password
  const updatePassword = async (currentPassword, newPassword) => {
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
  };

  // Computed property to determine authentication status
  const authenticated = !!token && !!currentUser;

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
