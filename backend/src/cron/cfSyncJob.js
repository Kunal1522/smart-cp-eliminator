// backend/src/cron/cfSyncJob.js
const cron = require('node-cron');
const Student = require('../models/Student');
const CodeforcesSubmission = require('../models/CodeforcesSubmission');
const AppSettings = require('../models/AppSettings');
const { fetchAndSaveCFData } = require('../services/codeforcesService');
const { sendReminderEmail } = require('../services/emailService');

// This variable will hold the cron job instance
let cfSyncTask = null;
const SETTINGS_SINGLETON_ID = 'app_settings'; // Matches the singleton ID in AppSettings model

/**
 * @desc Starts the Codeforces data synchronization cron job.
 * The schedule is fetched from the AppSettings document in the database.
 */
const startCronJob = async () => {
  // Stop any existing cron job before starting a new one
  if (cfSyncTask) {
    cfSyncTask.stop();
    console.log('[Cron Job] Existing Codeforces sync cron job stopped.');
  }

  try {
    // Fetch the current cron schedule from AppSettings
    const appSettings = await AppSettings.findOneAndUpdate(
      { singletonId: SETTINGS_SINGLETON_ID },
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const schedule = appSettings.cronSchedule;

    // Schedule the cron job
    cfSyncTask = cron.schedule(schedule, async () => {
      console.log(`[Cron Job] Starting daily Codeforces data sync at ${new Date().toLocaleString()} (schedule: ${schedule})...`);

      // Update lastCronRun timestamp in AppSettings
      appSettings.lastCronRun = Date.now();
      await appSettings.save();
      console.log(`[Cron Job] AppSettings lastCronRun updated to ${new Date(appSettings.lastCronRun).toLocaleString()}.`);


      try {
        // Fetch only basic info needed to loop through students
        const studentIdsAndHandles = await Student.find({}).select('_id name email codeforcesHandle autoEmailEnabled');
        console.log(`[Cron Job] Found ${studentIdsAndHandles.length} students to process.`);

        if (studentIdsAndHandles.length === 0) {
            console.log('[Cron Job] No students found to sync. Exiting this run.');
            return; // Exit if no students
        }

        for (const studentPartial of studentIdsAndHandles) { // Loop through basic student objects
          if (!studentPartial.codeforcesHandle) {
            console.log(`[Cron Job] Skipping student ${studentPartial.name}: No Codeforces handle found.`);
            continue;
          }

          // --- CRITICAL CHANGE: Re-fetch the full student document by ID inside the loop ---
          // This ensures we always get the absolute latest reminderEmailCount from the DB
          // and any other fields that might have been updated by other processes (like frontend updates).
          const student = await Student.findById(studentPartial._id);

          if (!student) {
              console.warn(`[Cron Job] Student with ID ${studentPartial._id} not found during current sync iteration. Skipping.`);
              continue; // Skip if student disappeared
          }

          console.log(`[Cron Job] --- Processing student: ${student.name} (${student.codeforcesHandle}) ---`);
          console.log(`[Cron Job] Current reminderEmailCount for ${student.name} (from DB fetch): ${student.reminderEmailCount}`);
          console.log(`[Cron Job] autoEmailEnabled for ${student.name}: ${student.autoEmailEnabled}`);

          let syncSuccess = false;
          try {
            console.log(`[Cron Job] Calling fetchAndSaveCFData for ${student.name}...`);
            // fetchAndSaveCFData should return true on success, false on known non-critical failure
            // or throw error on critical failure.
            syncSuccess = await fetchAndSaveCFData(student._id, student.codeforcesHandle);
            console.log(`[Cron Job] fetchAndSaveCFData for ${student.name} completed. Success: ${syncSuccess}`);
          } catch (error) {
            console.error(`[Cron Job] ERROR: Failed to sync CF data for ${student.name} (${student.codeforcesHandle}):`, error.message);
            // Continue to next student even if one fails to avoid blocking the whole job
            // syncSuccess remains false here.
            continue; // Move to the next student if this one fails to sync CF data
          }

          // --- Inactivity Detection & Email Reminder ---
          if (syncSuccess && student.autoEmailEnabled) {
            console.log(`[Cron Job] Sync successful and autoEmailEnabled for ${student.name}. Checking for inactivity...`);
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            console.log(`[Cron Job] Checking for successful submissions since: ${sevenDaysAgo.toLocaleString()}`);

            const latestSubmission = await CodeforcesSubmission.findOne({
              studentId: student._id,
              submissionTime: { $gte: sevenDaysAgo },
              verdict: 'OK' // Only consider successful submissions
            });

            if (!latestSubmission) {
              console.log(`[Cron Job] No recent successful submissions found for ${student.name}. Sending reminder...`);
              student.reminderEmailCount = (student.reminderEmailCount || 0) + 1;
              await student.save(); // Save updated count to DB
              console.log(`[Cron Job] DB reminderEmailCount updated for ${student.name} to: ${student.reminderEmailCount}`);

              try {
                await sendReminderEmail(student.email, student.name, student.reminderEmailCount);
                console.log(`[Cron Job] Successfully SENT inactivity reminder to ${student.email}. Count: ${student.reminderEmailCount}`);
              } catch (emailError) {
                console.error(`[Cron Job] ERROR: Failed to send reminder email to ${student.email}:`, emailError.message);
              }
            } else {
              console.log(`[Cron Job] Recent successful submission found for ${student.name} (ID: ${latestSubmission._id}).`);
              if (student.reminderEmailCount > 0) {
                student.reminderEmailCount = 0;
                await student.save(); // Save reset count to DB
                console.log(`[Cron Job] Student ${student.name} was active. Reminder count reset to 0.`);
              } else {
                console.log(`[Cron Job] Student ${student.name} was active and reminder count already 0.`);
              }
            }
          } else if (!syncSuccess) {
            console.log(`[Cron Job] Sync was NOT successful for ${student.name}. Skipping email reminder.`);
          } else if (!student.autoEmailEnabled) {
            console.log(`[Cron Job] autoEmailEnabled is FALSE for ${student.name}. Skipping email reminder.`);
          }
        }
        console.log('[Cron Job] Codeforces data sync and inactivity check complete for all students.');
      } catch (err) {
        console.error('[Cron Job] FATAL ERROR during student iteration for sync:', err.message, err.stack);
      }
    }, {
      scheduled: true, // Automatically start the job
      timezone: "UTC" // Use UTC to avoid timezone issues, or specify your server's timezone
    });

    console.log(`Codeforces sync cron job scheduled to run at: ${schedule} (UTC)`);

  } catch (error) {
    console.error('FATAL ERROR: Failed to start Codeforces sync cron job:', error.message, error.stack);
  }
};

/**
 * @desc Stops the active Codeforces data synchronization cron job.
 */
const stopCronJob = () => {
  if (cfSyncTask) {
    cfSyncTask.stop();
    console.log('Codeforces sync cron job manually stopped.');
  } else {
    console.log('No active Codeforces sync cron job to stop.');
  }
};

module.exports = {
  startCronJob,
  stopCronJob
};
