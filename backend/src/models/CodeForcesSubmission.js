// backend/src/models/CodeforcesSubmission.js
const mongoose = require('mongoose');

const CodeforcesSubmissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student', // Reference to the Student model
    required: true,
  },
  submissionId: {
    type: Number,
    required: true,
  },
  problemId: { // Codeforces unique problem identifier (e.g., "123A")
    type: String, // Storing as string as it can be "contestId + index"
    required: true,
  },
  problemName: {
    type: String,
    required: true,
  },
  problemRating: { // Difficulty rating of the problem
    type: Number,
    default: null, // Can be null if problem rating is not available
  },
  verdict: {
    type: String,
    required: true,
  },
  submissionTime: {
    type: Date, // Time when the submission was made
    required: true,
  },
  contestId: {
    type: Number, // Contest ID if it was a contest submission
    default: null, // Can be null for problemset submissions
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure uniqueness for each student's submission
CodeforcesSubmissionSchema.index({ studentId: 1, submissionId: 1 }, { unique: true });

module.exports = mongoose.model('CodeforcesSubmission', CodeforcesSubmissionSchema);