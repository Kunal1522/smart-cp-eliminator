// frontend/src/components/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
 // Import the toggle component
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

function Navbar() {
  const { isAuthenticated, logout } = useAuth(); // Get auth state and logout function

  return (
    // Navbar container with new background color, premium spacing, and z-index for layering
    <nav className="relative z-50 bg-[#030B2E] py-4 px-6 md:px-8 shadow-xl w-full h-18 flex items-center">
      <div className="container mx-auto flex justify-between items-center flex-wrap gap-4">
        {/* Brand/App Title - Increased font size and tracking for premium feel */}
        <NavLink to="/" className="text-white text-3xl font-extrabold tracking-widest hover:text-gray-300 transition-colors duration-200">
          TLE Eliminators
        </NavLink>

        {/* Navigation Links - Centered on smaller screens, spaced out */}
        <div className="flex flex-grow justify-center md:justify-start items-center space-x-6 md:space-x-8 text-lg font-medium">
  
          {isAuthenticated && ( // Show Dashboard/Students link only if authenticated
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `text-gray-300 hover:text-white transition-colors duration-200 py-1 border-b-2 border-transparent ${isActive ? 'active-link !border-white !text-white font-semibold' : ''}`
              }
            >
              Students
            </NavLink>
          )}
          {isAuthenticated && ( // Show Settings link only if authenticated
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `text-gray-300 hover:text-white transition-colors duration-200 py-1 border-b-2 border-transparent ${isActive ? 'active-link !border-white !text-white font-semibold' : ''}`
              }
            >
              Settings
            </NavLink>
          )}
        </div>

        {/* Auth Links and Theme Toggle - Aligned to the right */}
        <div className="flex items-center space-x-4">
         
          {isAuthenticated ? (
            <button
              onClick={logout} // Call logout function from AuthContext
              className="px-5 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition duration-200 ease-in-out transform hover:scale-105 font-semibold text-base"
            >
              Logout
            </button>
          ) : (
            // Removed Login/Sign Up buttons as they are on the Welcome page
            null
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
