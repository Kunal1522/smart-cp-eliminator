// backend/src/models/AppSettings.js
const mongoose = require('mongoose');

const AppSettingsSchema = new mongoose.Schema({
  // This schema is designed to store global application settings in a single document.
  // We'll use a fixed _id or ensure only one document exists.
  singletonId: { // A fixed identifier to ensure only one document for settings
    type: String,
    required: true,
    default: 'app_settings',
    unique: true,
  },
  cronSchedule: {
    type: String,
    default: '0 2 * * *', // Default to 2 AM daily (UTC timezone implied by node-cron)
    required: true,
  },
  cronFrequencyUnit: {
    type: String,
    enum: ['minute', 'hour', 'day'], // For UI display purposes
    default: 'day',
  },
  cronFrequencyValue: {
    type: Number,
    default: 1, // e.g., 1 day, 24 hours, 60 minutes
  },
  lastCronRun: {
    type: Date,
    default: null, // Timestamp of the last successful cron job execution
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
AppSettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('AppSettings', AppSettingsSchema);