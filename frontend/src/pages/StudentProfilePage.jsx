// frontend/src/pages/StudentProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStudentProfile } from '../services/studentService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import DateFilter from '../components/DateFilter';
import ContestHistoryTable from '../components/ContestHistoryTable'; // Keeping ContestHistoryTable as requested
import RatingGraph from '../components/RatingGraph';
import ProblemsSolvedBarChart from '../components/ProblemsSolvedBarChart';
import SubmissionHeatmap from '../components/SubmissionHeatmap';
import LetterGlitch from '../../jsrepo_components/Backgrounds/LetterGlitch/LetterGlitch'; // Import LetterGlitch
import {
  processRatingGraphData,
  processProblemsPerRatingBucket,
  getMostDifficultSolvedProblem,
  getProblemSolvingStats,
  processSubmissionHeatmapData,
} from '../utils/chartDataProcessors';
import { isDateWithinLastXDays, formatDateTime } from '../utils/dateUtils';


function StudentProfilePage() {
  const { id } = useParams(); // Get student ID from URL
  const [student, setStudent] = useState(null);
  const [contestHistory, setContestHistory] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [contestFilterDays, setContestFilterDays] = useState(365); // Default to last 365 days
  const [problemFilterDays, setProblemFilterDays] = useState(90); // Default to last 90 days

  useEffect(() => {
    /**
     * @desc Fetches student profile data from the backend.
     */
    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getStudentProfile(id);
        setStudent(data.student);
        setContestHistory(data.contestHistory);
        setSubmissions(data.submissions);
      } catch (err) {
        console.error(`Failed to fetch student profile for ID ${id}:`, err);
        setError(err.message || 'Failed to load student profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [id]);

  // Filtered data based on selected periods
  const filteredContestHistory = contestHistory.filter(contest =>
    isDateWithinLastXDays(contest.contestTime, contestFilterDays)
  );

  const filteredSubmissions = submissions.filter(submission =>
    isDateWithinLastXDays(submission.submissionTime, problemFilterDays)
  );

  // Processed data for charts and stats
  const ratingGraphData = processRatingGraphData(filteredContestHistory);
  const problemsPerRatingBucketData = processProblemsPerRatingBucket(filteredSubmissions);
  const mostDifficultProblem = getMostDifficultSolvedProblem(filteredSubmissions);
  const problemSolvingStats = getProblemSolvingStats(filteredSubmissions, problemFilterDays);
  const submissionHeatmapData = processSubmissionHeatmapData(filteredSubmissions, problemFilterDays);


  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <ErrorMessage message={error || 'Student not found.'} />
      </div>
    );
  }

  return (
    // Main container for the page, transparent to show LetterGlitch
    // min-h-[calc(100vh-64px)] is important for main content area to clear Navbar
    <div className="relative min-h-[calc(100vh-64px)] bg-transparent text-white overflow-hidden flex flex-col items-center p-4 sm:p-6 lg:p-8">
      {/* LetterGlitch Background - Fixed to cover the entire viewport */}
      <div className="fixed inset-0 z-0 w-full h-full">
        <LetterGlitch
          glitchSpeed={40}
          centerVignette={true}
          outerVignette={false}
          smooth={true}
          backgroundColor="black"
          glitchColor="rgba(30, 200, 30, 0.12)" // Slightly increased from 0.08
        />
      </div>

      {/* Main Content Area - Wider and translucent, sits on top of glitch */}
      <div className="relative z-10 bg-[#030B2E] bg-opacity-20 backdrop-blur-lg p-6 rounded-xl shadow-2xl w-full max-w-6xl border border-gray-800 text-white">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {student.name}'s Profile
          </h1>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-cyan-400 text-white rounded-lg shadow-md hover:bg-cyan-500 transition"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Student Basic Info - Improved Styling */}
        <div className="mb-8 p-6 bg-gradient-to-br from-[#0A184D] to-[#060D2D] rounded-xl shadow-lg border border-blue-900 text-gray-100">
            <h2 className="text-2xl font-bold text-white mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                <p className="text-lg"><strong>Email:</strong> <span className="text-blue-300">{student.email}</span></p>
                <p className="text-lg"><strong>Phone:</strong> <span className="text-blue-300">{student.phoneNumber || 'N/A'}</span></p>
                <p className="text-lg"><strong>Codeforces Handle:</strong> <span className="text-blue-300">{student.codeforcesHandle}</span></p>
                <p className="text-lg"><strong>Current Rating:</strong> <span className="text-blue-300">{student.currentRating}</span></p>
                <p className="text-lg"><strong>Max Rating:</strong> <span className="text-blue-300">{student.maxRating}</span></p>
                <p className="text-lg col-span-1 md:col-span-2">
                    <strong>Last CF Data Update:</strong>{' '}
                    <span className="text-blue-300">{student.lastUpdatedCFData ? formatDateTime(student.lastUpdatedCFData) : 'Never'}</span>
                </p>
                <p className="text-lg col-span-1 md:col-span-2">
                    <strong>Inactivity Reminders Sent:</strong> <span className="text-blue-300">{student.reminderEmailCount}</span> (Auto-email:{' '}
                    <span className="text-blue-300">{student.autoEmailEnabled ? 'Enabled' : 'Disabled'}</span>)
                </p>
            </div>
        </div>

        {/* Contest History Section */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Contest History</h2>
        <DateFilter
          filters={[
            { label: 'Last 30 Days', value: 30 },
            { label: 'Last 90 Days', value: 90 },
            { label: 'Last 365 Days', value: 365 },
          ]}
          currentFilter={contestFilterDays}
          onSelectFilter={setContestFilterDays}
          title="Filter Contest History:"
          // Use bg-cyan-400 for active state, and a very dark text color on it.
          // For inactive, use a suitable dark background and light text.
          activeClass="bg-gradient-to-r from-cyan-400 to-cyan-500 text-gray-900 shadow-md hover:from-cyan-500 hover:to-cyan-400"
          inactiveClass="bg-gray-700 text-white hover:bg-gray-600"
        />
        <RatingGraph data={ratingGraphData} />
        <ContestHistoryTable contestHistory={filteredContestHistory} /> {/* Retained as ContestHistoryTable */}

        {/* Problem Solving Data Section */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 mt-8">Problem Solving Data</h2>
        <DateFilter
          filters={[
            { label: 'Last 7 Days', value: 7 },
            { label: 'Last 30 Days', value: 30 },
            { label: 'Last 90 Days', value: 90 },
          ]}
          currentFilter={problemFilterDays}
          onSelectFilter={setProblemFilterDays}
          title="Filter Problem Data:"
          // Use bg-cyan-400 for active state here too
          activeClass="bg-gradient-to-r from-cyan-400 to-cyan-500 text-gray-900 shadow-md hover:from-cyan-500 hover:to-cyan-400"
          inactiveClass="bg-gray-700 text-white hover:bg-gray-600"
        />

        {/* Problem Solving Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-center">
          <div className="bg-[#030B2E] bg-opacity-30 p-4 rounded-lg shadow-sm">
            <h3 className="text-md font-semibold text-blue-300">Total Problems Solved</h3>
            <p className="text-2xl font-bold text-blue-100">{problemSolvingStats.totalProblemsSolved}</p>
          </div>
          <div className="bg-[#030B2E] bg-opacity-30 p-4 rounded-lg shadow-sm">
            <h3 className="text-md font-semibold text-purple-300">Average Rating</h3>
            <p className="text-2xl font-bold text-purple-100">{problemSolvingStats.averageRating}</p>
          </div>
          <div className="bg-[#030B2E] bg-opacity-30 p-4 rounded-lg shadow-sm">
            <h3 className="text-md font-semibold text-green-300">Avg. Problems/Day</h3>
            <p className="text-2xl font-bold text-green-100">{problemSolvingStats.averageProblemsPerDay}</p>
          </div>
        </div>

        {/* Most Difficult Problem */}
        <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-[#030B2E] bg-opacity-30 text-gray-200">
            <h3 className="text-md font-semibold text-yellow-300 mb-2">Most Difficult Problem Solved:</h3>
            {mostDifficultProblem ? (
                <p className="text-lg">
                    <a
                        href={mostDifficultProblem.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline font-medium"
                    >
                        {mostDifficultProblem.problemName}
                    </a>{' '}
                    (Rating: {mostDifficultProblem.problemRating})
                </p>
            ) : (
                <p>N/A (No rated problems solved in this period)</p>
            )}
        </div>


        <ProblemsSolvedBarChart data={problemsPerRatingBucketData} />
        <SubmissionHeatmap data={submissionHeatmapData} days={problemFilterDays} />
      </div>
    </div>
  );
}

export default StudentProfilePage;
