// frontend/src/components/StudentForm.jsx
import React, { useState, useEffect } from 'react';
import ErrorMessage from './ErrorMessage';

/**
 * @desc Form component for adding or editing student details.
 * @param {Object} props - Component props.
 * @param {Object} [props.initialData] - Optional initial data for editing a student.
 * @param {Function} props.onSubmit - Callback function triggered on form submission (receives student data).
 * @param {string} props.submitText - Text for the submit button (e.g., "Add Student", "Update Student").
 * @param {boolean} [props.isLoading=false] - Indicates if the form submission is in progress.
 * @param {string|null} [props.error=null] - Error message to display.
 */
function StudentForm({ initialData = {}, onSubmit, submitText, isLoading = false, error = null }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    codeforcesHandle: '',
    autoEmailEnabled: true, // Default to true for new students
  });
  const [formError, setFormError] = useState(null); // Local error for validation

  useEffect(() => {
    // Populate form if initialData is provided (for edit mode)
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phoneNumber: initialData.phoneNumber || '',
        codeforcesHandle: initialData.codeforcesHandle || '',
        autoEmailEnabled: initialData.autoEmailEnabled !== undefined ? initialData.autoEmailEnabled : true,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError('Name is required.');
      return false;
    }
    if (!formData.email.trim()) {
      setFormError('Email is required.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError('Please enter a valid email address.');
      return false;
    }
    if (!formData.codeforcesHandle.trim()) {
      setFormError('Codeforces Handle is required.');
      return false;
    }
    setFormError(null); // Clear previous errors
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData); // Pass validated data to parent component
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
        {initialData._id ? 'Edit Student' : 'Add New Student'}
      </h2>

      {(formError || error) && <ErrorMessage message={formError || error} />}

      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
          Name:
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          disabled={isLoading}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
          Email:
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          disabled={isLoading}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="phoneNumber" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
          Phone Number:
        </label>
        <input
          type="text"
          id="phoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          disabled={isLoading}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="codeforcesHandle" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
          Codeforces Handle:
        </label>
        <input
          type="text"
          id="codeforcesHandle"
          name="codeforcesHandle"
          value={formData.codeforcesHandle}
          onChange={handleChange}
          className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          disabled={isLoading}
        />
      </div>

      <div className="mb-6 flex items-center">
        <input
          type="checkbox"
          id="autoEmailEnabled"
          name="autoEmailEnabled"
          checked={formData.autoEmailEnabled}
          onChange={handleChange}
          className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          disabled={isLoading}
        />
        <label htmlFor="autoEmailEnabled" className="text-gray-700 dark:text-gray-300 text-sm font-bold">
          Enable Inactivity Reminder Emails
        </label>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? 'Saving...' : submitText}
      </button>
    </form>
  );
}

export default StudentForm;
