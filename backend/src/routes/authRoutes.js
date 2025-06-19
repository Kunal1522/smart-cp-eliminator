const express = require('express');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', registerUser);

/**
 * @route POST /api/auth/login
 * @desc Authenticate user & get token
 * @access Public
 */
router.post('/login', loginUser);

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private (requires JWT token)
 */
router.get('/me', protect, getMe);

module.exports = router;
