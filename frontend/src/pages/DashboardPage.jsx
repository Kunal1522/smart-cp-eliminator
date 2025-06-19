// frontend/src/pages/DashboardPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getStudents,
  deleteStudent,
  downloadStudentsCsv,
} from "../services/studentService";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import ConfirmationModal from "../components/ConfirmationModal";
import LetterGlitch from "../../jsrepo_components/Backgrounds/LetterGlitch/LetterGlitch"; // Import LetterGlitch
import AnimatedList from "../../jsrepo_components/Components/AnimatedList/AnimatedList"; // Import AnimatedList
import { formatDateTime } from "../utils/dateUtils";
import { downloadBlobAsFile } from "../utils/csvDownloadUtils";
import PlagueCheckDashboardWidget from "../components/PlagueCheckDashboardWidget";

function DashboardPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  /**
   * @desc Fetches all student data from the backend.
   */
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudents();
      console.log("Fetched student data for Dashboard:", data);
      setStudents(data);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      setError(err.message || "Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * @desc Handles opening the confirmation modal for student deletion.
   * @param {Object} student - The student object to be deleted.
   */
  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setIsModalOpen(true);
  };

  /**
   * @desc Confirms and executes the student deletion.
   */
  const confirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      setLoading(true);
      await deleteStudent(studentToDelete._id);
      setStudents(students.filter((s) => s._id !== studentToDelete._id)); // Remove from local state
      console.log(`Student ${studentToDelete.name} deleted successfully.`);
    } catch (err) {
      console.error("Error deleting student:", err);
      setError(err.message || "Failed to delete student.");
    } finally {
      setLoading(false);
      setIsModalOpen(false); // Close modal
      setStudentToDelete(null); // Clear student to delete
    }
  };

  /**
   * @desc Handles downloading the student data as CSV.
   */
  const handleDownloadCsv = async () => {
    setDownloading(true);
    setError(null);
    try {
      const csvBlob = await downloadStudentsCsv();
      downloadBlobAsFile(csvBlob, "students_data.csv");
      console.log("CSV download initiated.");
    } catch (err) {
      console.error("Error downloading CSV:", err);
      setError(err.message || "Failed to download CSV.");
    } finally {
      setDownloading(false);
    }
  };

  /**
   * @desc Handles sorting requests for student list.
   * @param {string} key - The data key to sort by ('currentRating', 'averageProblemsPerDay', etc.)
   */
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Memoize the sorted students array to avoid re-sorting on every render
  const sortedStudents = useMemo(() => {
    let sortableStudents = [...students];
    if (sortConfig.key !== null) {
      sortableStudents.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle undefined/null values for numerical sorting, treating them as very small numbers
        if (
          typeof aValue !== "number" &&
          typeof aValue !== "string" &&
          (aValue === null || aValue === undefined)
        )
          aValue = -Infinity;
        if (
          typeof bValue !== "number" &&
          typeof bValue !== "string" &&
          (bValue === null || bValue === undefined)
        )
          bValue = -Infinity;

        // Convert to number for proper numerical sort, if they are number-like strings
        if (typeof aValue === "string" && !isNaN(parseFloat(aValue)))
          aValue = parseFloat(aValue);
        if (typeof bValue === "string" && !isNaN(parseFloat(bValue)))
          bValue = parseFloat(bValue);

        // Explicitly handle string comparison for 'name'
        if (
          sortConfig.key === "name" &&
          typeof aValue === "string" &&
          typeof bValue === "string"
        ) {
          return sortConfig.direction === "ascending"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Default numerical comparison
        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableStudents;
  }, [students, sortConfig]);

  // Function to render each student item for AnimatedList
  const renderStudentItem = (student) => (
    <div
      key={student._id} // AnimatedList requires a unique key for each item
      onClick={() => navigate(`/student-profile/${student._id}`)}
      className="relative z-10 bg-[#030B2E] bg-opacity-30 backdrop-blur-md p-4 rounded-lg shadow-lg mb-4 cursor-pointer hover:bg-opacity-40 transition duration-200 ease-in-out transform hover:scale-[1.01] border border-gray-700
                   flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
    >
      {/* Student Name and Email */}
      <div className="flex-1 text-left min-w-[150px]">
        <p className="text-xl font-semibold text-white truncate">
          {student.name || "N/A"}
        </p>
        <p className="text-gray-300 text-sm truncate">
          {student.email || "N/A"}
        </p>
      </div>

      {/* Codeforces Details */}
      <div className="flex-1 text-left min-w-[150px]">
        <p className="text-gray-300 text-sm">
          Handle:{" "}
          <span className="font-medium text-white">
            {student.codeforcesHandle || "N/A"}
          </span>
        </p>
        <p className="text-gray-300 text-sm">
          Rating:{" "}
          <span className="font-medium text-white">
            {student.currentRating !== undefined &&
            student.currentRating !== null
              ? student.currentRating
              : "N/A"}
          </span>
        </p>
        <p className="text-gray-300 text-sm">
          Max Rating:{" "}
          <span className="font-medium text-white">
            {student.maxRating !== undefined && student.maxRating !== null
              ? student.maxRating
              : "N/A"}
          </span>
        </p>
      </div>

      {/* Stats and Reminders */}
      <div className="flex-1 text-left min-w-[150px]">
        <p className="text-gray-300 text-sm">
          Avg. Prob/Day:{" "}
          <span className="font-medium text-white">
            {student.averageProblemsPerDay !== undefined &&
            student.averageProblemsPerDay !== null
              ? student.averageProblemsPerDay.toFixed(1)
              : "N/A"}
          </span>
        </p>
        <p className="text-gray-300 text-sm">
          Reminders Sent:{" "}
          <span className="font-medium text-white">
            {student.reminderEmailCount || 0}
          </span>
        </p>
        <p className="text-gray-300 text-sm">
          Last Update:{" "}
          <span className="font-medium text-white">
            {student.lastUpdatedCFData
              ? formatDateTime(student.lastUpdatedCFData)
              : "N/A"}
          </span>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 mt-2 md:mt-0 ml-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/edit-student/${student._id}`);
          }}
          className="px-3 py-1.5 bg-yellow-600 text-white rounded-md text-xs hover:bg-yellow-700 transition duration-200 shadow-md"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(student);
          }}
          className="px-3 py-1.5 bg-red-600 text-white rounded-md text-xs hover:bg-red-700 transition duration-200 shadow-md"
        >
          Delete
        </button>
      </div>
    </div>
  );

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

      {/* Main Content Area - Wider and translucent, sits on top of glitch */}
      {/* Added 'flex flex-col' here to enable flexbox for vertical layout */}
      <div className="relative z-10 bg-[#030B2E] bg-opacity-20 backdrop-blur-lg p-6 rounded-xl shadow-2xl w-full max-w-6xl border border-gray-800 text-white flex flex-col">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Student Dashboard
        </h1>

        {/* Action Buttons and Sort Options */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/add-student")}
              // Smaller padding and text size for main action buttons
              className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white font-semibold rounded-lg shadow-md hover:from-cyan-500 hover:to-cyan-400 transition duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              disabled={loading}
            >
              Add New Student
            </button>
            <button
              onClick={handleDownloadCsv}
              // Smaller padding and text size for main action buttons
              className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-cyan-400 text-white-600s font-semibold rounded-lg shadow-md hover:from-cyan-500 hover:to-cyan-400 transition duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              disabled={loading || downloading}
            >
              {downloading ? "Downloading..." : "Download CSV"}
            </button>
          </div>

          {/* Sorting Dropdowns */}
          <div className="flex gap-3 items-center">
            <span className="text-gray-300 font-medium text-sm">Sort by:</span>{" "}
            {/* Smaller text for "Sort by:" */}
            <select
              value={sortConfig.key || ""}
              onChange={(e) => requestSort(e.target.value)}
              // Smaller padding for select dropdown
              className="bg-gray-700 bg-opacity-50 text-white rounded-lg px-2 py-1.5 border border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">None</option>
              <option value="currentRating">Rating</option>
              <option value="averageProblemsPerDay">Avg. Prob/Day</option>
              <option value="name">Name</option>
            </select>
            <button
              onClick={() =>
                setSortConfig({
                  ...sortConfig,
                  direction:
                    sortConfig.direction === "ascending"
                      ? "descending"
                      : "ascending",
                })
              }
              // Smaller padding for sort direction button
              className="px-2.5 py-1.5 bg-gray-700 bg-opacity-50 text-white rounded-lg border border-gray-600 hover:bg-opacity-70 transition duration-200 text-sm"
              title={`Sort ${
                sortConfig.direction === "ascending"
                  ? "Descending"
                  : "Ascending"
              }`}
            >
              {sortConfig.direction === "ascending" ? "▲" : "▼"}
            </button>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* This container will now handle its own scrolling */}
        {/* 'flex-grow' allows it to take available vertical space, 'overflow-y-auto' adds scrollbar */}
        <div className="flex-grow overflow-y-auto pr-2 mt-4"> {/* Added pr-2 for scrollbar spacing, and mt-4 for margin */}
          {loading ? (
            <LoadingSpinner />
          ) : (
            <AnimatedList data={sortedStudents} renderItem={renderStudentItem} />
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete student "${studentToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}

export default DashboardPage;
