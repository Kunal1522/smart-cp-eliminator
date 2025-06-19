// frontend/src/services/studentService.js
import api from './api'; // Import the configured Axios instance

/**
 * @desc Fetches all student records from the backend.
 * @returns {Array<Object>} An array of student objects.
 * @throws {Error} If the API call fails.
 */
export const getStudents = async () => {
  try {
    const response = await api.get('/students');
    return response.data;
  } catch (error) {
    console.error('Error fetching students:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch students');
  }
};

/**
 * @desc Fetches a single student record by ID.
 * @param {string} id - The ID of the student.
 * @returns {Object} The student object.
 * @throws {Error} If the API call fails or student not found.
 */
export const getStudentById = async (id) => {
  try {
    const response = await api.get(`/students/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching student with ID ${id}:`, error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || `Failed to fetch student with ID ${id}`);
  }
};

/**
 * @desc Adds a new student record to the backend.
 * @param {Object} studentData - Object containing student details (name, email, etc.).
 * @returns {Object} The newly created student object.
 * @throws {Error} If the API call fails.
 */
export const addStudent = async (studentData) => {
  try {
    const response = await api.post('/students', studentData);
    return response.data;
  } catch (error) {
    console.error('Error adding student:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to add student');
  }
};

/**
 * @desc Updates an existing student record.
 * @param {string} id - The ID of the student to update.
 * @param {Object} studentData - Object containing updated student details.
 * @returns {Object} The updated student object.
 * @throws {Error} If the API call fails.
 */
export const updateStudent = async (id, studentData) => {
  try {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  } catch (error) {
    console.error(`Error updating student with ID ${id}:`, error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || `Failed to update student with ID ${id}`);
  }
};

/**
 * @desc Deletes a student record by ID.
 * @param {string} id - The ID of the student to delete.
 * @returns {Object} A success message.
 * @throws {Error} If the API call fails.
 */
export const deleteStudent = async (id) => {
  try {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting student with ID ${id}:`, error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || `Failed to delete student with ID ${id}`);
  }
};

/**
 * @desc Fetches comprehensive profile data for a student, including contest history and submissions.
 * @param {string} id - The ID of the student.
 * @returns {Object} Object containing student, contestHistory, and submissions.
 * @throws {Error} If the API call fails.
 */
export const getStudentProfile = async (id) => {
  try {
    const response = await api.get(`/students/${id}/profile`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching student profile for ID ${id}:`, error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || `Failed to fetch student profile for ID ${id}`);
  }
};

/**
 * @desc Initiates download of all student data as a CSV file.
 * @returns {Blob} The CSV file data.
 * @throws {Error} If the API call fails.
 */
export const downloadStudentsCsv = async () => {
  try {
    // Axios can handle responseType 'blob' for binary data like CSV
    const response = await api.get('/students/download-csv', { responseType: 'blob' });
    return response.data;
  } catch (error) {
    console.error('Error downloading CSV:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to download CSV');
  }
};
