// frontend/src/pages/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { getAppSettings, updateAppSettings } from '../services/settingsService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDateTime } from '../utils/dateUtils';
import LetterGlitch from '../../jsrepo_components/Backgrounds/LetterGlitch/LetterGlitch'; // Import LetterGlitch

function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false); // To show success message

  // Form states for cron schedule
  const [cronValue, setCronValue] = useState('1'); // Default to 1 (for 1 hour/minute)
  const [cronUnit, setCronUnit] = useState('day'); // Default to 'day'
  const [cronTime, setCronTime] = useState('02:00'); // Default to 02:00 for daily job

  useEffect(() => {
    /**
     * @desc Fetches application settings from the backend.
     */
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAppSettings();
        setSettings(data);
        // Set initial form values based on fetched settings
        setCronValue(data.cronFrequencyValue.toString());
        setCronUnit(data.cronFrequencyUnit);
        // If daily, extract time for HH:MM format
        if (data.cronFrequencyUnit === 'day') {
          const parts = data.cronSchedule.split(' '); // e.g., '0 2 * * *'
          const hour = String(parts[1]).padStart(2, '0');
          const minute = String(parts[0]).padStart(2, '0');
          setCronTime(`${hour}:${minute}`);
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
        setError(err.message || 'Failed to load settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  /**
   * @desc Generates the cron string based on selected frequency.
   * @returns {string} The cron schedule string.
   */
  const generateCronString = () => {
    // Declare minute and hour with 'let' so they can be reassigned
    let minute = '0';
    let hour = '*';
    let dayOfMonth = '*';
    let month = '*';
    let dayOfWeek = '*';

    if (cronUnit === 'day') {
      const [h, m] = cronTime.split(':');
      hour = h;
      minute = m;
    } else if (cronUnit === 'hour') {
      hour = `*/${cronValue}`; // Every X hours
      minute = '0'; // Ensure minutes are 0 when running hourly
    } else if (cronUnit === 'minute') {
      minute = `*/${cronValue}`; // Every X minutes
      hour = '*'; // Ensure hour is wildcard for minute-based
    }
    return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
  };

  /**
   * @desc Handles the submission of the settings form.
   * @param {Object} e - Form event object.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    const newCronSchedule = generateCronString();

    try {
      const updatedSettings = await updateAppSettings({
        cronSchedule: newCronSchedule,
        cronFrequencyUnit: cronUnit,
        cronFrequencyValue: parseInt(cronValue),
      });
      setSettings(updatedSettings);
      setSaveSuccess(true);
      console.log('Settings updated successfully:', updatedSettings);
      // Automatically hide success message after a few seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update settings:', err);
      setError(err.message || 'Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    // Main container for the page, transparent to show LetterGlitch
    <div className="relative min-h-[calc(100vh-64px)] bg-transparent text-white overflow-hidden flex flex-col items-center p-4 sm:p-6 lg:p-8">
      {/* LetterGlitch Background - Fixed to cover the entire viewport */}
      <div className="fixed inset-0 z-0 w-full h-full">
        <LetterGlitch
          glitchSpeed={40}
          centerVignette={true}
          outerVignette={false}
          smooth={true}
          backgroundColor="black"
          glitchColor="rgba(30, 200, 30, 0.12)" // Slightly increased from 0.08
        />
      </div>

      {/* Main Content Area - Wider and translucent, sits on top of glitch */}
      <div className="relative z-10 bg-[#030B2E] bg-opacity-20 backdrop-blur-lg p-6 rounded-xl shadow-2xl w-full max-w-xl border border-gray-800 text-white">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">App Settings</h1>

        {error && <ErrorMessage message={error} />}
        {saveSuccess && (
          <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-md relative mb-4 shadow-sm">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline ml-2">Settings updated. Cron job re-scheduled.</span>
          </div>
        )}

        {settings && (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="cronFrequencyUnit" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Sync Frequency:
              </label>
              <select
                id="cronFrequencyUnit"
                name="cronFrequencyUnit"
                value={cronUnit}
                onChange={(e) => setCronUnit(e.target.value)}
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                disabled={isSaving}
              >
                <option value="day">Daily</option>
                <option value="hour">Hourly</option>
                <option value="minute">Every X Minutes</option>
              </select>
            </div>

            {(cronUnit === 'hour' || cronUnit === 'minute') && (
              <div className="mb-4">
                <label htmlFor="cronValue" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                  Every:
                </label>
                <input
                  type="number"
                  id="cronValue"
                  name="cronValue"
                  min={cronUnit === 'minute' ? 1 : 1} // Min 1 minute/hour
                  max={cronUnit === 'minute' ? 59 : 23} // Max 59 minutes/23 hours
                  value={cronValue}
                  onChange={(e) => setCronValue(e.target.value)}
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  disabled={isSaving}
                />
                <span className="ml-2 text-gray-600 dark:text-gray-400">{cronUnit === 'minute' ? 'minutes' : 'hours'}</span>
              </div>
            )}

            {cronUnit === 'day' && (
              <div className="mb-4">
                <label htmlFor="cronTime" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                  Run Time (HH:MM UTC):
                </label>
                <input
                  type="time"
                  id="cronTime"
                  name="cronTime"
                  value={cronTime}
                  onChange={(e) => setCronTime(e.target.value)}
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  disabled={isSaving}
                />
              </div>
            )}

            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Current Cron Schedule (UTC):
              </p>
              <code className="block bg-gray-100 dark:bg-gray-700 p-2 rounded-md text-gray-800 dark:text-gray-200 break-words">
                {settings.cronSchedule}
              </code>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                (e.g., "0 2 * * *" means daily at 2:00 AM UTC)
              </p>
               <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                Last Run: {settings.lastCronRun ? formatDateTime(settings.lastCronRun) : 'Never'}
              </p>
            </div>


            <button
              type="submit"
              className="w-full bg-cyan-400 hover:cyan-400 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Update Settings'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;
