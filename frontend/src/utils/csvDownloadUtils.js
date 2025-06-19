// frontend/src/utils/csvDownloadUtils.js

/**
 * @desc Triggers a client-side download of a Blob as a file.
 * @param {Blob} blob - The Blob object (e.g., received from Axios with responseType: 'blob').
 * @param {string} filename - The name of the file to download.
 */
export const downloadBlobAsFile = (blob, filename) => {
  // Create a URL for the Blob object
  const url = window.URL.createObjectURL(blob);

  // Create a temporary anchor element
  const a = document.createElement('a');
  a.href = url;
  a.download = filename; // Set the download filename

  // Programmatically click the anchor to trigger the download
  document.body.appendChild(a);
  a.click();

  // Clean up: revoke the object URL and remove the anchor element
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
