// backend/src/routes/settingsRoutes.js
const express = require('express');
const { getAppSettings, updateAppSettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Import middleware
const router = express.Router();
/**
 * @route GET /api/settings
 * @desc Get application settings (e.g., cron schedule)
 * @access Private (Admin only)
 */
router.get('/', protect, authorize(['admin']), getAppSettings);
/**
 * @route PUT /api/settings
 * @desc Update application settings (e.g., cron schedule)
 * @access Private (Admin only)
 */
router.put('/', protect, authorize(['admin']), updateAppSettings);

module.exports = router;
