// frontend/src/components/PlagueCheckDashboardWidget.jsx
import React, { useState } from 'react';
import { getStudents } from '../services/studentService'; // Import the service to get all students
import api from '../services/api'; // <--- IMPORT THE AXIOS API INSTANCE

// This component will contain the Plague Check button and results display
const PlagueCheckDashboardWidget = () => {
  const [plaguedStudents, setPlaguedStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to fetch all student IDs from the backend
  const fetchAllStudentIds = async () => {
    try {
      // Use the getStudents service which already uses the 'api' (Axios) instance
      const students = await getStudents(); 
      return students.map(s => ({ _id: s._id, name: s.name })); // Return array of objects with ID and Name
    } catch (err) {
      console.error("Error fetching all student IDs for plague check:", err);
      throw new Error(err.message || "Failed to fetch student list for plague check.");
    }
  };

  const runPlagueCheck = async () => {
    setIsLoading(true);
    setError(null);
    setPlaguedStudents([]);
    try {
      // Fetch all student IDs along with their names/handles for display
      const allStudents = await fetchAllStudentIds(); 

      if (allStudents.length === 0) {
        setPlaguedStudents([]); // No students to check
        setIsModalOpen(true);
        setIsLoading(false);
        return;
      }

      const results = await Promise.all(
        allStudents.map(async (student) => {
          const studentId = student._id;
          const studentName = student.name || `Student ${studentId.substring(0, 6)}...`; // Fallback name
          try {
            // <--- IMPORTANT CHANGE: Use 'api.get' instead of 'fetch' ---
            const response = await api.get(`/students/${studentId}/plagued-contests`);
            
            // Axios automatically parses JSON and handles non-2xx status as errors in .catch
            // So, we can directly access response.data here for successful 2xx responses.
            const contests = response.data; // Axios response data is directly available here
            
            return { studentId, studentName, plaguedCount: contests.length };
          } catch (axiosError) {
            // Axios errors provide more detail in error.response
            const errorMessage = axiosError.response?.data?.message 
                                 || axiosError.message 
                                 || 'Unknown error';
            console.error(`Error for student ${studentName} (ID: ${studentId}):`, errorMessage, axiosError.response?.data);
            return { studentId, studentName, error: errorMessage };
          }
        })
      );

      // Filter out students with no plagued contests and sort
      const filteredResults = results.filter(
        (result) => (result && result.plaguedCount > 0) || result.error // Keep errors for display
      ).sort((a, b) => (b.plaguedCount || 0) - (a.plaguedCount || 0)); // Sort by count descending, errors appear first

      setPlaguedStudents(filteredResults);
      setIsModalOpen(true); // Open modal to show results
    } catch (err) {
      console.error("Overall Plague Check failed:", err);
      setError(err.message || "Failed to run plague check. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-900 rounded-lg shadow-xl border border-red-700">
      <h3 className="text-xl font-bold text-red-400 mb-4 text-center">Plague Check</h3>
      <p className="text-gray-300 text-center mb-6">
        Identify students with suspicious contest submission patterns.
      </p>
      
      <div className="flex justify-center">
        <button
          onClick={runPlagueCheck}
          disabled={isLoading}
          className="relative px-8 py-4 text-lg font-bold text-white uppercase overflow-hidden rounded-full 
                     bg-gradient-to-r from-red-600 to-red-800 border-2 border-red-900 shadow-lg 
                     hover:from-red-700 hover:to-red-900 active:scale-95 transition-all duration-300
                     focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50
                     animate-pulse-red-alert" // Apply the custom pulse animation
        >
          {isLoading ? 'Scanning...' : 'Run Plague Check'}
          {/* Custom liquid effect for the button */}
          <span className="absolute inset-0 bg-red-700 opacity-0 animate-liquid-effect"></span>
          <span className="absolute inset-0 bg-red-800 opacity-0 animate-liquid-effect animation-delay-200"></span>
        </button>
      </div>

      {error && <p className="text-red-500 text-center mt-4">{error}</p>}

      {/* Plague Check Results Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto border border-gray-700">
            <h2 className="text-2xl font-bold text-red-400 mb-6 text-center">Plagued Students</h2>
            {plaguedStudents.length === 0 ? (
              <p className="text-gray-300 text-center">No students found with plagued submissions.</p>
            ) : (
              <ul className="space-y-3">
                {plaguedStudents.map((student) => (
                  <li key={student.studentId} className="flex justify-between items-center bg-gray-700 p-3 rounded-md border border-gray-600">
                    <span className="text-white text-lg font-medium">
                      {student.studentName || `Student ID: ${student.studentId.substring(0, 6)}...`}
                    </span>
                    {student.error ? (
                      <span className="text-yellow-400 text-sm">Error: {student.error}</span>
                    ) : (
                      <span className="text-red-300 text-xl font-semibold">
                        {student.plaguedCount}
                        <span className="text-sm text-red-200 ml-1">Contests</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for Liquid Button Animation */}
      <style jsx>{`
        @keyframes pulse-red-alert {
          0% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); /* red-600 */
          }
          70% {
            box-shadow: 0 0 0 15px rgba(220, 38, 38, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
          }
        }

        @keyframes liquid-effect {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          25% {
            opacity: 0.2;
          }
          50% {
            transform: translateY(-50%);
            opacity: 0;
          }
          100% {
            transform: translateY(100%);
            opacity: 0;
          }
        }

        .animate-pulse-red-alert {
          animation: pulse-red-alert 2s infinite;
        }

        .animate-liquid-effect {
          animation: liquid-effect 2s infinite ease-out;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
};

export default PlagueCheckDashboardWidget;
