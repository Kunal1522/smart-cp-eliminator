const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

/**
 * Generates a JWT token for a user.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

/**
 * Register a new user.
 */
exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // Check if user already exists by email or username
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User with that email or username already exists' });
    }

    // Create a new user instance
    const user = await User.create({
      username,
      email,
      password, // Password will be hashed by the pre-save hook in the User model
    });

    if (user) {
      // If user created successfully, send back user info and a token
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id), // Generate and send JWT
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error during user registration:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * @desc Authenticate user & get token.
 * @route POST /api/auth/login
 * @access Public
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Basic validation for input fields
  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // Check if user exists by email
    const user = await User.findOne({ email });

    // If user exists and password matches
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id), // Generate and send JWT
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error during user login:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * @desc Get current user profile (for testing protected routes)
 * @route GET /api/auth/me
 * @access Private
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getMe = async (req, res) => {
  // req.user is available from the 'protect' middleware
  if (req.user) {
    res.json({
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
