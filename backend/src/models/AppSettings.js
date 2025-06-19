const mongoose = require('mongoose');

const AppSettingsSchema = new mongoose.Schema({
  singletonId: {
    type: String,
    required: true,
    default: 'app_settings',
    unique: true,
  },
  cronSchedule: {
    type: String,
    default: '0 2 * * *',
    required: true,
  },
  cronFrequencyUnit: {
    type: String,
    enum: ['minute', 'hour', 'day'],
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