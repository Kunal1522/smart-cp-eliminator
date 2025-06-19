const mongoose = require('mongoose');

const CodeforcesSubmissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  submissionId: {
    type: Number,
    required: true,
  },
  problemId: {
    type: String,
    required: true,
  },
  problemName: {
    type: String,
    required: true,
  },
  problemRating: {
    type: Number,
    default: null,
  },
  verdict: {
    type: String,
    required: true,
  },
  submissionTime: {
    type: Date,
    required: true,
  },
  contestId: {
    type: Number,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure uniqueness for each student's submission
CodeforcesSubmissionSchema.index({ studentId: 1, submissionId: 1 }, { unique: true });

module.exports = mongoose.model('CodeforcesSubmission', CodeforcesSubmissionSchema);