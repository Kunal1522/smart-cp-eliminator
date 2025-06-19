// backend/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Path to your User model
require('dotenv').config(); // Load environment variables

/**
 * @desc Middleware to protect routes, ensuring only authenticated users can access them.
 * It expects a JWT in the 'Authorization' header (Bearer token).
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token from the Authorization header
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using the JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user by the ID in the decoded token, exclude password
      // Attach the user object to the request for subsequent middleware/controllers
      req.user = await User.findById(decoded.id).select('-password'); // Exclude password from user object

      // Move to the next middleware or route handler
      next();
    } catch (error) {
      console.error('Not authorized, token failed:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // If no token is found in the header
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * @desc Middleware to authorize users based on their role.
 * Use after `protect` middleware.
 * @param {string[]} roles - An array of allowed roles (e.g., ['admin']).
 * @returns {Function} Express middleware function.
 */
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles]; // Convert single role string to an array
  }

  return (req, res, next) => {
    // Check if the user (attached by `protect` middleware) exists and has a role
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Not authorized, user role missing' });
    }
    // Check if the user's role is included in the allowed roles array
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Not authorized as ${req.user.role}, requires one of: ${roles.join(', ')}` });
    }

    next(); // User is authorized, proceed
  };
};

module.exports = { protect, authorize };
