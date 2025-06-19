// frontend/src/components/LoadingSpinner.jsx
import React from 'react';

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center my-8">
      <div
        className="w-12 h-12 border-4 border-t-4 border-blue-500 border-solid rounded-full animate-spin"
        style={{ borderTopColor: 'transparent' }}
      ></div>
      <p className="ml-4 text-lg text-gray-600 dark:text-gray-300">Loading...</p>
    </div>
  );
}

export default LoadingSpinner;
