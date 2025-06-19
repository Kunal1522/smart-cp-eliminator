// Formats a Date object into a readable string (e.g., "Jan 01, 2023 10:30 AM")
export const formatDateTime = (dateInput) => {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Invalid Date';

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };
  return date.toLocaleString('en-US', options);
};

// Formats a Date object into a readable date string (e.g., "Jan 01, 2023")
export const formatDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Invalid Date';

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
};

/**
 * @desc Calculates a date X days ago from now.
 * @param {number} days - Number of days to go back.
 * @returns {Date} A Date object representing X days ago.
 */
export const getDateXDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

/**
 * @desc Checks if a given date is within the last X days.
 * @param {Date | string} checkDateInput - The date to check.
 * @param {number} days - The number of days for the filter.
 * @returns {boolean} True if the date is within the last X days, false otherwise.
 */
export const isDateWithinLastXDays = (checkDateInput, days) => {
  const checkDate = new Date(checkDateInput);
  const xDaysAgo = getDateXDaysAgo(days);
  return checkDate >= xDaysAgo;
};

/**
 * @desc Converts Unix timestamp in seconds to a Date object.
 * Codeforces API often provides timestamps in seconds.
 * @param {number} timestampSeconds - Unix timestamp in seconds.
 * @returns {Date} Corresponding Date object.
 */
export const unixSecondsToDate = (timestampSeconds) => {
  return new Date(timestampSeconds * 1000); // Convert to milliseconds
};
