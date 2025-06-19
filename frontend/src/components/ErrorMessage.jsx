// frontend/src/components/ErrorMessage.jsx
import React from 'react';

function ErrorMessage({ message }) {
  if (!message) return null; // Don't render if no message

  return (
    <div
      className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-md relative mb-4 shadow-sm"
      role="alert"
    >
      <strong className="font-bold">Error!</strong>
      <span className="block sm:inline ml-2">{message}</span>
    </div>
  );
}

export default ErrorMessage;
