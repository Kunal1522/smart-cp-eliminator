// backend/src/utils/csvUtils.js
const { stringify } = require('csv-stringify');

/**
 * @desc Generates a CSV string from an array of objects.
 * @param {Array<Object>} data - The array of objects to convert to CSV.
 * @param {Array<string>} columns - An array of column headers (keys from the objects) for the CSV.
 * @returns {Promise<string>} A promise that resolves with the CSV string.
 */
const generateCsv = (data, columns) => {
  return new Promise((resolve, reject) => {
    // Configure csv-stringify.
    // `header: true` means the first row will be the column names.
    // `columns` specifies the order and names of the columns.
    stringify(data, { header: true, columns: columns }, (err, output) => {
      if (err) {
        console.error('Error generating CSV:', err);
        return reject(err);
      }
      resolve(output);
    });
  });
};

module.exports = {
  generateCsv,
};
