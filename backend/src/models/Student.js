const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, 'Please fill a valid email address'],
  },
  phoneNumber: {
    type: String,
    trim: true,
    // Optional: Add regex validation for phone numbers
  },
  codeforcesHandle: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true, // Codeforces handles are case-insensitive for uniqueness
  },
  currentRating: {
    type: Number,
    default: 0, // Default for new students, updated by sync
  },
  maxRating: {
    type: Number,
    default: 0, // Default for new students, updated by sync
  },
  lastUpdatedCFData: {
    type: Date,
    default: null, // Will be updated after successful Codeforces data sync
  },
  reminderEmailCount: {
    type: Number,
    default: 0, // Counts how many inactivity reminder emails sent
  },
  autoEmailEnabled: {
    type: Boolean,
    default: true, // Option to enable/disable automated emails for this student
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update `updatedAt` field on save
StudentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Student', StudentSchema);

