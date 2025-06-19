// frontend/src/pages/AddStudentPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addStudent } from '../services/studentService';
import StudentForm from '../components/StudentForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import LetterGlitch from '../../jsrepo_components/Backgrounds/LetterGlitch/LetterGlitch'; // Import LetterGlitch

function AddStudentPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // For errors that cause HTTP failure or throw in service
  const navigate = useNavigate();

  /**
   * @desc Handles the submission of the add student form.
   * @param {Object} formData - Data from the student form.
   */
  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      await addStudent(formData); // Now this promise should resolve quickly
      alert('Student added successfully! Codeforces data sync is happening in the background.');
      navigate('/dashboard'); // Navigate back to the dashboard
    } catch (err) {
      console.error('Failed to add student (frontend catch):', err);
      // This catch block will only be hit if the backend returns a non-2xx status code
      setError(err.message || 'Failed to add student due to an unexpected error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Main container for the page, transparent to show LetterGlitch
    <div className="relative min-h-[calc(100vh-64px)] bg-transparent text-white overflow-hidden flex flex-col items-center p-4 sm:p-6 lg:p-8">
      {/* LetterGlitch Background - Fixed to cover the entire viewport */}
      <div className="fixed inset-0 z-0 w-full h-full">
        <LetterGlitch
          glitchSpeed={40}
          centerVignette={true}
          outerVignette={false}
          smooth={true}
          backgroundColor="black"
          glitchColor="rgba(30, 200, 30, 0.12)"
        />
      </div>

      {/* StudentForm content area - sits on top of glitch, with translucent background */}
      <div className="relative z-10 p-4 w-full flex items-center justify-center">
        <StudentForm onSubmit={handleSubmit} submitText="Add Student" isLoading={loading} error={error} />
      </div>
    </div>
  );
}

export default AddStudentPage;
