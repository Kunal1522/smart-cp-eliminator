// frontend/src/services/settingsService.js
import api from './api'; // Import the configured Axios instance

/**
 * @desc Fetches global application settings from the backend.
 * @returns {Object} The app settings object.
 * @throws {Error} If the API call fails.
 */
export const getAppSettings = async () => {
  try {
    const response = await api.get('/settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching app settings:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch app settings');
  }
};

/**
 * @desc Updates global application settings on the backend.
 * @param {Object} settingsData - Object containing updated settings (e.g., { cronSchedule: '0 3 * * *' }).
 * @returns {Object} The updated app settings object.
 * @throws {Error} If the API call fails.
 */
export const updateAppSettings = async (settingsData) => {
  try {
    const response = await api.put('/settings', settingsData);
    return response.data;
  } catch (error) {
    console.error('Error updating app settings:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update app settings');
  }
};
