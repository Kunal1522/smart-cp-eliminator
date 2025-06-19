// backend/src/services/codeforcesService.js
const axios = require('axios');
const Student = require('../models/Student');
const CodeforcesContest = require('../models/CodeforcesContest');
const CodeforcesSubmission = require('../models/CodeforcesSubmission');

const CODEFORCES_API_BASE = 'https://codeforces.com/api';

/**
 * @desc Fetches contest rating history and submissions for a given Codeforces handle.
 * @param {string} handle - The Codeforces handle.
 * @returns {Object} An object containing contest history and submissions.
 * @throws {Error} If API call fails or handle is invalid.
 */
const fetchCodeforcesData = async (handle) => {
  try {
    // Fetch user rating history
    const ratingHistoryResponse = await axios.get(`${CODEFORCES_API_BASE}/user.rating?handle=${handle}`);
    if (ratingHistoryResponse.data.status !== 'OK') {
      throw new Error(`Codeforces API Error (user.rating): ${ratingHistoryResponse.data.comment}`);
    }
    const contestHistory = ratingHistoryResponse.data.result;

    // Fetch user submissions
    const submissionsResponse = await axios.get(`${CODEFORCES_API_BASE}/user.status?handle=${handle}`);
    if (submissionsResponse.data.status !== 'OK') {
      throw new Error(`Codeforces API Error (user.status): ${submissionsResponse.data.comment}`);
    }
    const submissions = submissionsResponse.data.result;

    return { contestHistory, submissions };
  } catch (error) {
    if (error.response && error.response.status === 400 && error.response.data.comment === `handles not found: ${handle}`) {
      throw new Error(`Codeforces handle '${handle}' not found.`);
    }
    console.error(`Error fetching Codeforces data for ${handle}:`, error.message);
    throw new Error(`Failed to fetch Codeforces data for ${handle}: ${error.message}`);
  }
};

/**
 * @desc Fetches data from Codeforces and saves it to the database for a specific student.
 * Also updates student's currentRating and maxRating.
 * @param {string} studentId - The ID of the student in your database.
 * @param {string} handle - The Codeforces handle.
 * @returns {Object} Updated student document.
 */
exports.fetchAndSaveCFData = async (studentId, handle) => {
  let student;
  try {
    student = await Student.findById(studentId);
    if (!student) {
      throw new Error(`Student with ID ${studentId} not found.`);
    }

    const { contestHistory, submissions } = await fetchCodeforcesData(handle);

    // --- IMPORTANT CHANGE FOR OLD DATA CLEANUP (Issue 2) ---
    // Delete existing Codeforces data for this student before saving new data.
    // This ensures that when a handle is updated, old data is cleared.
    await CodeforcesContest.deleteMany({ studentId });
    await CodeforcesSubmission.deleteMany({ studentId });
    console.log(`Cleared old Codeforces data for student ${student.name} (ID: ${studentId}).`);


    // Save Contest History
    if (contestHistory && contestHistory.length > 0) {
      let currentRating = student.currentRating || 0; // Initialize with current or 0
      let maxRating = student.maxRating || 0; // Initialize with max or 0

      const bulkOpsContests = contestHistory.map(entry => {
        // --- FIX FOR NEW RATING (Issue 1) ---
        // Codeforces API provides 'newRating'. Ensure it's correctly mapped.
        // It's usually the 'newRating' of the current contest entry.
        const newRatingAfterContest = entry.newRating !== undefined ? entry.newRating : entry.oldRating + entry.ratingChange;

        // Update current and max rating based on the latest contest
        if (newRatingAfterContest > maxRating) {
            maxRating = newRatingAfterContest;
        }
        currentRating = newRatingAfterContest; // Current rating is the latest contest's newRating

        return {
          insertOne: {
            document: {
              studentId: student._id,
              contestId: entry.contestId,
              contestName: entry.contestName,
              contestTime: new Date(entry.ratingUpdateTimeSeconds * 1000), // Convert seconds to ms
              rank: entry.rank,
              oldRating: entry.oldRating,
              newRating: newRatingAfterContest, // Ensure this is explicitly saved
              ratingChange: entry.newRating - entry.oldRating, // Re-calculate based on new/old
              problemsSolved: entry.problems || 0, // Codeforces API provides 'problems' if available, otherwise 0
            }
          }
        };
      });
      if (bulkOpsContests.length > 0) {
        await CodeforcesContest.bulkWrite(bulkOpsContests);
        console.log(`Synced ${contestHistory.length} contest entries for ${handle}.`);
      }

      // Update student's rating fields after processing all contests
      student.currentRating = currentRating;
      student.maxRating = maxRating;
    } else {
      // If no contest history, reset ratings
      student.currentRating = 0;
      student.maxRating = 0;
      console.log(`No contest history found for ${handle}. Ratings reset to 0.`);
    }

    // Save Submissions
    if (submissions && submissions.length > 0) {
      const uniqueSolvedProblems = new Set();
      const bulkOpsSubmissions = submissions.map(entry => {
        // Create a unique identifier for solved problems to count only once
        if (entry.verdict === 'OK') {
          uniqueSolvedProblems.add(`${entry.problem.contestId || 'problemset'}-${entry.problem.index}`);
        }

        return {
          insertOne: {
            document: {
              studentId: student._id,
              submissionId: entry.id,
              contestId: entry.contestId,
              submissionTime: new Date(entry.creationTimeSeconds * 1000), // Convert seconds to ms
              problemName: entry.problem.name,
              problemId: `${entry.problem.contestId || 'problemset'}-${entry.problem.index}`, // Composite ID
              problemRating: entry.problem.rating || null, // Can be null for unrated problems
              verdict: entry.verdict,
              programmingLanguage: entry.programmingLanguage,
            }
          }
        };
      });

      if (bulkOpsSubmissions.length > 0) {
        await CodeforcesSubmission.bulkWrite(bulkOpsSubmissions);
        console.log(`Synced ${submissions.length} submissions for ${handle}. Total unique problems solved: ${uniqueSolvedProblems.size}.`);
      }
    } else {
      console.log(`No submissions found for ${handle}.`);
    }

    student.lastUpdatedCFData = Date.now();
    await student.save(); // Save updated student document (ratings, last updated timestamp)

    return student; // Return the updated student document
  } catch (error) {
    console.error(`Error in fetchAndSaveCFData for student ${handle} (ID: ${studentId}):`, error.message);
    // Re-throw the error so calling functions (like cron job) can catch it
    throw error;
  }
};
