// frontend/src/pages/WelcomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

// Import React Bits Components
import LetterGlitch from '../../jsrepo_components/Backgrounds/LetterGlitch/LetterGlitch';
import SplitText from '../../jsrepo_components/TextAnimations/SplitText/SplitText';
import DecryptedText from '../../jsrepo_components/TextAnimations/DecryptedText/DecryptedText';
import Folder from '../../jsrepo_components/Components/Folder/Folder'; 

function WelcomePage() {
  const { isAuthenticated } = useAuth();

  // Define the feature boxes as an array of React nodes
  const featureItems = [
    <div key="feature1" className="bg-[#030B2E] bg-opacity-50 backdrop-blur-md p-6 rounded-lg border border-gray-700 h-full flex flex-col justify-between">
      <div className="w-12 h-12 mx-auto bg-blue-400 rounded-md flex items-center justify-center mb-3">
        {/* Icon Placeholder */}
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0-10V5a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2a2 2 0 002-2zm9 10v-3a2 2 0 00-2-2h-2a2 2 0 00-2 2v3a2 2 0 002 2h2a2 2 0 002-2zm0-10V9a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2z" /></svg>
      </div>
      <h3 className="text-xl font-semibold text-blue-300 mb-1">Codeforces Tracking</h3>
      <p className="text-sm text-gray-200 leading-tight">Monitor student progress and submissions on Codeforces.</p>
    </div>,

    <div key="feature2" className="bg-[#030B2E] bg-opacity-50 backdrop-blur-md p-6 rounded-lg border border-gray-700 h-full flex flex-col justify-between">
      <div className="w-12 h-12 mx-auto bg-green-400 rounded-md flex items-center justify-center mb-3">
        {/* Icon Placeholder */}
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012-2h4m0 0v4a2 2 0 01-2 2H15m0 0l-2-2m-2 2l2-2m-9-4a2 2 0 012-2h4m0 0v4a2 2 0 01-2 2H5m0 0l2-2m-2 2l-2-2" /></svg>
      </div>
      <h3 className="text-xl font-semibold text-green-300 mb-1">Automated Reminders</h3>
      <p className="text-sm text-gray-200 leading-tight">Automatically send inactivity reminders to students.</p>
    </div>,

    <div key="feature3" className="bg-[#030B2E] bg-opacity-50 backdrop-blur-md p-6 rounded-lg border border-gray-700 h-full flex flex-col justify-between">
      <div className="w-12 h-12 mx-auto bg-purple-400 rounded-md flex items-center justify-center mb-3">
        {/* Icon Placeholder */}
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </div>
      <h3 className="text-xl font-semibold text-purple-300 mb-1">Profile Management</h3>
      <p className="text-sm text-gray-200 leading-tight">Easily manage and update student profiles.</p>
    </div>,
  ];

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <div className="fixed inset-0 z-0 w-full h-full">
        <LetterGlitch
          glitchSpeed={40}
          centerVignette={true}
          outerVignette={false}
          smooth={true}
          backgroundColor="black"
          glitchColor="rgba(30, 200, 30, 0.08)" // Subtle green glitch
        />
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Hero Section */}
        <section className="text-center">
          {/* MODIFIED: Added flex container and align-items-end to align baselines */}
          <div className="mb-8 flex flex-col items-center"> 
            <SplitText
              text="Welcome to"
              // Removed mb-2 from here, as flex alignment will handle spacing
              className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight" 
              splitDelay={0.04}
              initialDelay={0.3}
              random={true}
            />
            {/* Added margin-top to create space between "Hi" and "It's TLE Eliminators" */}
            <SplitText
              text="Smart Student Management"
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mt-1" // Added mt-1
              splitDelay={0.04}
              initialDelay={0.7}
              random={true}
            />
          </div>
          <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-xl mx-auto mb-10">
            Your platform to manage student profiles, track Codeforces progress, and send automated inactivity reminders.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-block px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-full shadow-md hover:bg-blue-700 transition duration-200 ease-in-out"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-block px-8 py-4 bg-[#030B2E] text-white font-bold text-lg rounded-full shadow-md hover:bg-blue-700 transition duration-200 ease-in-out"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="inline-block px-8 py-4 bg-cyan-400 text-gray-900 font-bold text-lg rounded-full shadow-md hover:bg-cyan-500 transition duration-200 ease-in-out"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Platform Overview Section with Folder */}
        <section className="py-16 text-center w-full max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold text-white mb-8">Explore Our Features</h2>
          {/* Adjusted container to give more explicit space without relying on Folder's internal scaling */}
          <div className="relative w-full h-[550px] md:h-[450px] lg:h-[400px] flex items-center justify-center"> 
            {/* Removed 'size' prop from Folder; its visual size will now be controlled by parent container */}
            <div className="w-[300px] h-[250px] sm:w-[400px] sm:h-[300px] md:w-[600px] md:h-[400px] lg:w-[800px] lg:h-[400px] transform translate-x-40 translate-y-10">
              <Folder size={4} open={false} color="#030B2E" items={featureItems}>
                {/* No children here */}
              </Folder>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 py-8 text-center text-blue-300 bg-[#030B2E] bg-opacity-50 backdrop-blur-md">
        &copy; {new Date().getFullYear()} TLE Eliminators. All rights reserved.
      </footer>
    </div>
  );
}

export default WelcomePage;
