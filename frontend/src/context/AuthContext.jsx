// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
// We'll create authService.js later to handle actual API calls
// For now, these functions are just placeholders or simple localStorage ops
import { login, register, logout, getMe } from '../services/authService'; // Will be created soon

// Create the Auth Context
export const AuthContext = createContext(null);

/**
 * @desc Provides authentication state and functions to its children components.
 * Manages user token, user data, and authentication status.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores user data (id, username, email)
  const [token, setToken] = useState(localStorage.getItem('token') || null); // JWT token
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token')); // Derived state
  const [loading, setLoading] = useState(true); // To indicate if auth check is in progress

  // Effect to check token validity and fetch user data on app load
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          // Attempt to get user info using the token
          const userData = await getMe(token);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to load user from token:', error);
          // If token is invalid or expired, clear it
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false); // Authentication check is complete
    };
    loadUser();
  }, [token]); // Rerun if token changes (e.g., after login/logout)

  /**
   * @desc Handles user login.
   * @param {string} email - User's email.
   * @param {string} password - User's password.
   * @returns {Object} User data and token on success.
   * @throws {Error} If login fails.
   */
  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      const data = await login(email, password); // Call auth service login
      localStorage.setItem('token', data.token); // Store token
      setToken(data.token);
      setUser({ _id: data._id, username: data.username, email: data.email }); // Set user data
      setIsAuthenticated(true);
      setLoading(false);
      return data; // Return full data for pages
    } catch (error) {
      setLoading(false);
      console.error('Login failed:', error);
      throw error; // Re-throw for component to handle
    }
  };

  /**
   * @desc Handles user registration.
   * @param {Object} userData - Object containing username, email, and password.
   * @returns {Object} User data and token on success.
   * @throws {Error} If registration fails.
   */
  const handleRegister = async (userData) => {
    try {
      setLoading(true);
      const data = await register(userData); // Call auth service register
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser({ _id: data._id, username: data.username, email: data.email });
      setIsAuthenticated(true);
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      console.error('Registration failed:', error);
      throw error;
    }
  };

  /**
   * @desc Handles user logout.
   * Clears token and user data from state and localStorage.
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    // No backend API call for logout in JWT stateless auth, just clear client state.
  };

  const authContextValue = {
    user,
    token,
    isAuthenticated,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * @desc Custom hook to use the AuthContext.
 * @returns {Object} Current authentication context value.
 */
export const useAuth = () => {
  return useContext(AuthContext);
};
