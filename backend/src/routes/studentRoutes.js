// backend/src/routes/studentRoutes.js
const express = require('express');
const {
  getStudents,
  getStudentById,
  addStudent,
  updateStudent,
  deleteStudent,
  downloadStudentsCsv,
  getStudentProfile
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Import middleware

const router = express.Router();

// All student routes will be protected and typically accessible by an 'admin' role.
// Adjust roles as per your application's specific authorization needs.

/**
 * @route GET /api/students
 * @desc Get all students
 * @access Private (Admin only)
 */
router.get('/', protect, authorize(['admin']), getStudents);

/**
 * @route GET /api/students/download-csv
 * @desc Download all student data as CSV
 * @access Private (Admin only)
 */
router.get('/download-csv', protect, authorize(['admin']), downloadStudentsCsv);

/**
 * @route GET /api/students/:id
 * @desc Get a single student by ID
 * @access Private (Admin only)
 */
router.get('/:id', protect, authorize(['admin']), getStudentById);

/**
 * @route GET /api/students/:id/profile
 * @desc Get student profile data (contest history and problem solving data)
 * @access Private (Admin only)
 */
router.get('/:id/profile', protect, authorize(['admin']), getStudentProfile);

/**
 * @route POST /api/students
 * @desc Add a new student
 * @access Private (Admin only)
 */
router.post('/', protect, authorize(['admin']), addStudent);

/**
 * @route PUT /api/students/:id
 * @desc Update a student's details
 * @access Private (Admin only)
 */
router.put('/:id', protect, authorize(['admin']), updateStudent);

/**
 * @route DELETE /api/students/:id
 * @desc Delete a student and their associated Codeforces data
 * @access Private (Admin only)
 */
router.delete('/:id', protect, authorize(['admin']), deleteStudent);

module.exports = router;
