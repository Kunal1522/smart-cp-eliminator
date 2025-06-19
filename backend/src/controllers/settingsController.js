// backend/src/controllers/settingsController.js
const AppSettings = require('../models/AppSettings');
const { startCronJob, stopCronJob } = require('../cron/cfSyncJob'); // Import cron control functions

// We use a singleton document for app settings.
const SETTINGS_SINGLETON_ID = 'app_settings';

/**
 * @desc Get application settings (e.g., cron schedule).
 * @route GET /api/settings
 * @access Private (Admin only)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getAppSettings = async (req, res) => {
  try {
    // Find the single AppSettings document or create if it doesn't exist
    const settings = await AppSettings.findOneAndUpdate(
      { singletonId: SETTINGS_SINGLETON_ID },
      {}, // No updates, just find or create
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(settings);
  } catch (error) {
    console.error('Error fetching app settings:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc Update application settings (e.g., cron schedule).
 * If cron schedule is updated, the existing cron job is stopped and a new one is started.
 * @route PUT /api/settings
 * @access Private (Admin only)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.updateAppSettings = async (req, res) => {
  const { cronSchedule, cronFrequencyUnit, cronFrequencyValue } = req.body;

  try {
    const settings = await AppSettings.findOne({ singletonId: SETTINGS_SINGLETON_ID });

    if (!settings) {
      // This should ideally not happen if getAppSettings creates it, but as a fallback
      return res.status(404).json({ message: 'App settings not found.' });
    }

    const oldCronSchedule = settings.cronSchedule;

    // Update fields if provided
    if (cronSchedule !== undefined) settings.cronSchedule = cronSchedule;
    if (cronFrequencyUnit !== undefined) settings.cronFrequencyUnit = cronFrequencyUnit;
    if (cronFrequencyValue !== undefined) settings.cronFrequencyValue = cronFrequencyValue;

    const updatedSettings = await settings.save();

    // If the cron schedule was changed, re-register the cron job
    if (oldCronSchedule !== updatedSettings.cronSchedule) {
      console.log('Cron schedule updated. Restarting cron job...');
      stopCronJob(); // Stop the old job
      startCronJob(); // Start a new job with the updated schedule
      console.log(`Cron job rescheduled to: ${updatedSettings.cronSchedule}`);
    }

    res.json(updatedSettings);

  } catch (error) {
    console.error('Error updating app settings:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};
