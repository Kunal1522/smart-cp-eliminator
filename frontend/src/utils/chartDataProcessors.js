// frontend/src/utils/chartDataProcessors.js
import { formatDate, unixSecondsToDate } from './dateUtils';

/**
 * @desc Processes contest history data for a rating graph.
 * @param {Array<Object>} contestHistory - Array of contest history objects from backend.
 * @returns {Array<Object>} Formatted data for Recharts LineChart.
 */
export const processRatingGraphData = (contestHistory) => {
  if (!contestHistory || contestHistory.length === 0) return [];

  // Sort contest history by contestTime to ensure the graph plots correctly
  const sortedHistory = [...contestHistory].sort((a, b) => new Date(a.contestTime) - new Date(b.contestTime));

  return sortedHistory.map(entry => ({
    // Ensure 'name' is consistently formatted for the X-axis
    name: formatDate(entry.contestTime),
    rating: entry.newRating,
    oldRating: entry.oldRating,
    ratingChange: entry.ratingChange,
    rank: entry.rank,
    contestName: entry.contestName,
    contestId: entry.contestId // Include contestId for direct linking in tooltip if needed
  }));
};

/**
 * @desc Processes submission data to count unique problems solved per individual rating.
 * @param {Array<Object>} submissions - Array of submission objects from backend.
 * @returns {Array<Object>} Formatted data for Recharts BarChart, showing count per exact rating.
 */
export const processProblemsPerRatingBucket = (submissions) => {
  if (!submissions || submissions.length === 0) return [];

  const ratingCounts = {}; // Will store { 'rating': count, ... }
  const solvedProblems = new Set(); // To count unique solved problems (problemId-contestId/problemset)

  submissions.forEach(submission => {
    // Only consider successful submissions with a valid problem rating
    if (submission.verdict === 'OK' && submission.problemRating !== null && submission.problemRating !== undefined) {
      // Create a unique identifier for the problem to avoid counting multiple successful submissions to the same problem
      const uniqueProblemIdentifier = `${submission.problemId}-${submission.contestId || 'problemset'}`;

      if (!solvedProblems.has(uniqueProblemIdentifier)) {
        solvedProblems.add(uniqueProblemIdentifier);

        const rating = submission.problemRating;
        // Increment the count for this specific rating
        ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
      }
    }
  });

  // Convert the object to an array for charting
  // Sort by rating ascending for better visualization
  return Object.keys(ratingCounts)
    .map(rating => ({
      name: String(rating), // X-axis label, ensure it's a string for Recharts
      problems: ratingCounts[rating], // Y-axis value
    }))
    .sort((a, b) => parseInt(a.name) - parseInt(b.name)); // Sort numerically by rating
};


/**
 * @desc Processes submission data to determine the most difficult problem solved.
 * @param {Array<Object>} submissions - Array of submission objects from backend.
 * @returns {Object|null} The most difficult solved problem or null.
 */
export const getMostDifficultSolvedProblem = (submissions) => {
  if (!submissions || submissions.length === 0) return null;

  let mostDifficult = null;
  const solvedProblems = new Set(); // To track unique solved problems

  submissions.forEach(submission => {
    if (submission.verdict === 'OK' && submission.problemRating !== null) {
      const uniqueProblemIdentifier = `${submission.problemId}-${submission.contestId || 'problemset'}`;
      if (!solvedProblems.has(uniqueProblemIdentifier)) {
        solvedProblems.add(uniqueProblemIdentifier);

        if (!mostDifficult || submission.problemRating > mostDifficult.problemRating) {
          mostDifficult = {
            problemName: submission.problemName,
            problemRating: submission.problemRating,
            link: `https://codeforces.com/problemset/problem/${submission.contestId || ''}/${submission.problemId.split('-')[1]}` // Basic problem link
          };
        }
      }
    }
  });

  return mostDifficult;
};


/**
 * @desc Calculates total problems solved and average rating from submissions.
 * @param {Array<Object>} submissions - Array of submission objects from backend.
 * @returns {Object} Object with totalProblemsSolved, averageRating, averageProblemsPerDay.
 */
export const getProblemSolvingStats = (submissions, filterDays) => {
  if (!submissions || submissions.length === 0) {
    return {
      totalProblemsSolved: 0,
      averageRating: 0,
      averageProblemsPerDay: 0,
      minDate: null,
      maxDate: null
    };
  }

  const solvedProblems = new Set();
  let totalRating = 0;
  let ratedProblemsCount = 0;
  let minSubmissionDate = null;
  let maxSubmissionDate = null;

  submissions.forEach(submission => {
    if (submission.verdict === 'OK') {
      const uniqueProblemIdentifier = `${submission.problemId}-${submission.contestId || 'problemset'}`;
      if (!solvedProblems.has(uniqueProblemIdentifier)) {
        solvedProblems.add(uniqueProblemIdentifier);
          
        if (submission.problemRating !== null) {
          totalRating += submission.problemRating;
          ratedProblemsCount++;
        }
        
        const submissionDate = new Date(submission.submissionTime);
        if (!minSubmissionDate || submissionDate < minSubmissionDate) {
          minSubmissionDate = submissionDate;
        }
        if (!maxSubmissionDate || submissionDate > maxSubmissionDate) {
          maxSubmissionDate = submissionDate;
        }
      }
    }
  });

  const totalProblemsSolved = solvedProblems.size;
  const averageRating = ratedProblemsCount > 0 ? (totalRating / ratedProblemsCount).toFixed(0) : 0;

  let daysActive = 0;
  if (minSubmissionDate && maxSubmissionDate) {
    // Calculate days between the first and last submission within the filtered range
    daysActive = (maxSubmissionDate.getTime() - minSubmissionDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Ensure at least 1 day if there's any activity

    daysActive = Math.max(1, Math.ceil(daysActive));
  } else if (totalProblemsSolved > 0) {
    // If only one submission, count as 1 day active
    daysActive = 1;
  }
   
  // If a filterDays is provided, use that for average problems per day calculation
  // Otherwise, use the calculated daysActive based on actual submission range

  const daysForAverage = filterDays ? Math.min(filterDays, daysActive || 1) : Math.max(1, daysActive);
   console.log(`Days for average calculation: ${daysForAverage}`);

  const averageProblemsPerDay = totalProblemsSolved > 0 ? (totalProblemsSolved / daysForAverage).toFixed(1) : 0;

  return {
    totalProblemsSolved,
    averageRating: parseFloat(averageRating),
    averageProblemsPerDay: parseFloat(averageProblemsPerDay),
  };
};

/**
 * @desc Processes submission data for a heatmap.
 * Counts ALL submissions (not just AC) per day for the last 'days' days.
 * @param {Array<Object>} submissions - Array of submission objects from backend.
 * @param {number} days - Number of days for the heatmap (e.g., 90, 365).
 * @returns {Array<Object>} Array of objects with date and count, suitable for a heatmap.
 */
export const processSubmissionHeatmapData = (submissions, days) => {
  if (!submissions || submissions.length === 0) return [];

  const submissionCounts = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of today

  // Initialize counts for the last 'days' days
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
    submissionCounts[dateString] = 0;
  }

  // Count all submissions per day
  submissions.forEach(submission => {
    const submissionDate = new Date(submission.submissionTime);
    submissionDate.setHours(0, 0, 0, 0); // Normalize to start of the day
    const dateString = submissionDate.toISOString().split('T')[0];

    // Check if this date is within the desired range
    const diffTime = Math.abs(today.getTime() - submissionDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= days && submissionCounts[dateString] !== undefined) {
      submissionCounts[dateString]++; // Increment count for any submission
    }
  });

  // Convert to array format for charting, ensuring dates are ordered
  const chartData = Object.keys(submissionCounts)
    .sort() // Sort dates ascending
    .map(dateString => ({
      date: dateString,
      count: submissionCounts[dateString],
    }));

  return chartData;
};
