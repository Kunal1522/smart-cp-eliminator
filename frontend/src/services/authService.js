// frontend/src/services/authService.js
import api from './api'; // Import the configured Axios instance

/**
 * @desc Sends a login request to the backend.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @returns {Object} Data including user info and JWT token.
 * @throws {Error} If the login request fails.
 */
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Login API call failed:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

/**
 * @desc Sends a registration request to the backend.
 * @param {Object} userData - Object containing username, email, and password.
 * @returns {Object} Data including new user info and JWT token.
 * @throws {Error} If the registration request fails.
 */
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Register API call failed:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

/**
 * @desc Fetches current authenticated user's profile from the backend.
 * This function is used by AuthContext to verify token and get user data.
 * @param {string} token - The JWT token.
 * @returns {Object} User's profile data.
 * @throws {Error} If fetching user profile fails (e.g., invalid token).
 */
export const getMe = async (token) => {
  try {
    // Axios instance already handles attaching the token from localStorage
    // If you explicitly pass a token here, make sure the interceptor doesn't double-add
    // or modify the request configuration directly. For simplicity, we assume
    // the interceptor handles it, or you pass the token through the config
    const response = await api.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}` // Ensure token is sent
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get user profile API call failed:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
  }
};

/**
 * @desc Performs client-side logout by removing the token.
 * No backend call needed for stateless JWT logout.
 */
export const logout = () => {
  localStorage.removeItem('token');
  // You might want to clear any other relevant cached data here
};
