// frontend/src/pages/SignupPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import LetterGlitch from '../../jsrepo_components/Backgrounds/LetterGlitch/LetterGlitch'; // Import LetterGlitch

function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [localError, setLocalError] = useState(null); // For validation errors
  const navigate = useNavigate();
  const { register, isAuthenticated, loading } = useAuth(); // Get register function and auth state

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null); // Clear previous errors

    const { username, email, password, confirmPassword } = formData;

    // Basic client-side validation
    if (!username || !email || !password || !confirmPassword) {
      setLocalError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    try {
      await register({ username, email, password }); // Call register function from context
      // Registration successful, useEffect will handle navigation
    } catch (error) {
      setLocalError(error.message || 'Registration failed. Please try again.');
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

      {/* Signup Form Container - styled for translucent effect */}
      <div className="relative z-10 bg-[#030B2E] bg-opacity-20 backdrop-blur-lg p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-800 text-white">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Sign Up</h2>


        {localError && <ErrorMessage message={localError} />}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-200 text-sm font-bold mb-2">
              Username:
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-900 bg-gray-200 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              placeholder="Choose a username"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-200 text-sm font-bold mb-2">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-900 bg-gray-200 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-200 text-sm font-bold mb-2">
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-900 bg-gray-200 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              placeholder="Create a password"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-200 text-sm font-bold mb-2">
              Confirm Password:
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-900 bg-gray-200 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-400 to-cyan-500 text-white font-bold py-2 px-4 rounded-lg shadow-xl hover:from-cyan-500 hover:to-cyan-400 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? <LoadingSpinner /> : 'Sign Up'}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-300">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
