// frontend/src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import LetterGlitch from '../../jsrepo_components/Backgrounds/LetterGlitch/LetterGlitch'; // Import LetterGlitch

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null); // For validation errors
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth(); // Get login function and auth state from context

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null); // Clear previous errors

    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    try {
      await login(email, password); // Call login function from context
      // Login successful, useEffect will handle navigation
    } catch (error) {
      setLocalError(error.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    // Main container for the page, transparent to show LetterGlitch
    <div className="relative min-h-screen bg-transparent text-white overflow-hidden flex items-center justify-center p-4">
      {/* LetterGlitch Background - Fixed to cover the entire viewport */}
      <div className="fixed inset-0 z-0 w-full h-full">
        <LetterGlitch
          glitchSpeed={40}
          centerVignette={true}
          outerVignette={false}
          smooth={true}
          backgroundColor="black"
          glitchColor="rgba(30, 200, 30, 0.08)" // Consistent subtle green glitch
        />
      </div>

      {/* Login Form Container - styled for translucent effect */}
      <div className="relative z-10 bg-[#030B2E] bg-opacity-20 backdrop-blur-lg p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-800 text-white">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Login</h2>

        {localError && <ErrorMessage message={localError} />}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-200 text-sm font-bold mb-2">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-900 bg-gray-200 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-200 text-sm font-bold mb-2">
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-900 bg-gray-200 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-400 to-cyan-500 text-white font-bold py-2 px-4 rounded-lg shadow-xl hover:from-blue-400 hover:to-cyan-500 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? <LoadingSpinner /> : 'Login'}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-300">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
