
const express = require('express');
const passport = require('passport'); 
const connectDB = require('./src/config/db'); 
const configurePassport = require('./src/config/passport'); 
const { startCronJob } = require('./src/cron/cfSyncJob'); 
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; 


connectDB();

// --- Passport Configuration ---
configurePassport(passport); // Pass the passport instance to the config function
app.use(passport.initialize()); // Initialize passport middleware

// --- Middleware ---
app.use(cors());
app.use(express.json()); // Body parser for JSON data

// --- Import Routes ---
const authRoutes = require('./src/routes/authRoutes');
const studentRoutes = require('./src/routes/studentRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');


app.use('/api/auth', authRoutes); 
app.use('/api/students', studentRoutes); 
app.use('/api/settings', settingsRoutes);


app.get('/', (req, res) => {
  res.send('Student Progress System Backend API is running!');
});


app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  // Start the cron job after the server has started and DB is connected
  await startCronJob();
});
