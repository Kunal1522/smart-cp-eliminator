// backend/server.js
const express = require('express');
const passport = require('passport'); // Import passport
const connectDB = require('./src/config/db'); // Import DB connection
const configurePassport = require('./src/config/passport'); // Import passport config
const { startCronJob } = require('./src/cron/cfSyncJob'); // Import cron job starter
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; // Use port from .env or default to 5000

// --- Database Connection ---
connectDB();

// --- Passport Configuration ---
configurePassport(passport); // Pass the passport instance to the config function
app.use(passport.initialize()); // Initialize passport middleware

// --- Middleware ---
// Enable CORS for all origins (for development).
// In production, you might restrict this to your frontend's domain.
app.use(cors());
app.use(express.json()); // Body parser for JSON data

// --- Import Routes ---
const authRoutes = require('./src/routes/authRoutes');
const studentRoutes = require('./src/routes/studentRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');

// --- API Routes ---
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/students', studentRoutes); // Student management routes
app.use('/api/settings', settingsRoutes); // Application settings routes

// Basic route for testing server
app.get('/', (req, res) => {
  res.send('Student Progress System Backend API is running!');
});

// --- Start the server ---
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  // Start the cron job after the server has started and DB is connected
  await startCronJob(); // <--- ADD THIS LINE HERE
});
