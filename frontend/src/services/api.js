import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

        // Request interceptor to attach JWT token to outgoing requests
        api.interceptors.request.use(
          (config) => {
            const token = localStorage.getItem('token'); // Get token from localStorage
            if (token) {
              config.headers.Authorization = `Bearer ${token}`; // Add token to Authorization header
            }
            return config;
          },
          (error) => {
            return Promise.reject(error);
          }
        );

        // Response interceptor to handle common errors (e.g., 401 Unauthorized)
        api.interceptors.response.use(
          (response) => {
            return response;
          },
          (error) => {
            if (error.response && error.response.status === 401) {
              // Optionally, redirect to login page or clear token
              console.warn('Unauthorized request. Token might be invalid or expired.');
              localStorage.removeItem('token'); // Clear invalid token
              // window.location.href = '/login'; // Redirect to login (handle in App.jsx or context)
            }
            return Promise.reject(error);
          }
        );

        export default api;
        