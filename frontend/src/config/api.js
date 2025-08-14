import axios from 'axios';

// Create axios instance with base URL
const API_BASE_URL = 'http://localhost:5000'; // Updated to match backend port from .env file

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
