// frontend/src/pages/EditStudentPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStudentById, updateStudent } from '../services/studentService';
import StudentForm from '../components/StudentForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import LetterGlitch from '../../jsrepo_components/Backgrounds/LetterGlitch/LetterGlitch'; // Import LetterGlitch

function EditStudentPage() {
  const { id } = useParams(); // Get student ID from URL parameters
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // For errors that cause HTTP failure or throw in service
  const navigate = useNavigate();

  useEffect(() => {
    /**
     * @desc Fetches the student's current data for editing.
     */
    const fetchStudent = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getStudentById(id);
        setStudent(data);
      } catch (err) {
        console.error(`Failed to fetch student with ID ${id}:`, err);
        setError(err.message || 'Failed to load student data for editing.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]); // Re-fetch if ID changes

  /**
   * @desc Handles the submission of the edit student form.
   * @param {Object} formData - Updated data from the student form.
   */
  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      await updateStudent(id, formData); // This promise should now resolve quickly
      alert('Student updated successfully! Codeforces data sync is happening in the background if the handle changed.');
      navigate('/dashboard'); // Navigate back to the dashboard
    } catch (err) {
      console.error(`Failed to update student with ID ${id} (frontend catch):`, err);
      // This catch block will only be hit if the backend returns a non-2xx status code
      setError(err.message || 'Failed to update student due to an unexpected error.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !student) { // If there's an error and no student data loaded
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <ErrorMessage message={error} />
      </div>
    );
  }

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
        {student && ( // Only render form if student data is loaded
          <StudentForm
            initialData={student}
            onSubmit={handleSubmit}
            submitText="Update Student"
            isLoading={loading}
            error={error}
          />
        )}
      </div>
    </div>
  );
}

export default EditStudentPage;
