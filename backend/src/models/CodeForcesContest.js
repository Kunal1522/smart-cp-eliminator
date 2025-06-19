// backend/src/models/CodeforcesContest.js
const mongoose = require('mongoose');
const CodeforcesContestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  contestId: {
    type: Number,
    required: true,
  },
  contestName: {
    type: String,
    required: true,
  },
  contestTime: { // Represents ratingUpdateTimeSeconds from CF API
    type: Date,
    required: true,
  },
  rank: {
    type: Number,
    required: true,
  },
  oldRating: {
    type: Number,
    required: true,
  },
  newRating: { // <--- ENSURE THIS FIELD EXISTS
    type: Number,
    required: true,
  },
  ratingChange: {
    type: Number,
    required: true,
  },
  problemsSolved: { // Number of problems solved in this contest
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Add a unique compound index to prevent duplicate contest entries for the same student
CodeforcesContestSchema.index({ studentId: 1, contestId: 1 }, { unique: true });
module.exports = mongoose.model('CodeforcesContest', CodeforcesContestSchema);
