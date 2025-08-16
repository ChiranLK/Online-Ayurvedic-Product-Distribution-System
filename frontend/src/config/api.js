import axios from 'axios';

// Create axios instance with base URL
// Use environment variable if available, otherwise fallback to localhost:5000
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include auth token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
