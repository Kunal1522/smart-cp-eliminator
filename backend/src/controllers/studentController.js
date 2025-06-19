// backend/src/controllers/studentController.js
const Student = require('../models/Student');
const CodeforcesContest = require('../models/CodeforcesContest');
const CodeforcesSubmission = require('../models/CodeforcesSubmission');
const { fetchAndSaveCFData } = require('../services/codeforcesService');
const { generateCsv } = require('../utils/csvUtils');

/**
 * @desc Get all students
 * @route GET /api/students
 * @access Private (Admin only)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getStudents = async (req, res) => {
  try {
    // Fetch students as lean objects to easily add new properties
    let students = await Student.find({}).lean();

    // Calculate the date 7 days ago
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Iterate over each student to calculate average problems per day for the last 7 days
    for (let i = 0; i < students.length; i++) {
      const student = students[i];

      // Fetch unique successful submissions for this student in the last 7 days
      const recentSubmissions = await CodeforcesSubmission.find({
        studentId: student._id,
        verdict: 'OK',
        submissionTime: { $gte: sevenDaysAgo }
      }).select('problemId contestId submissionTime'); // Only fetch necessary fields

      const uniqueProblemsSolved = new Set();
      recentSubmissions.forEach(submission => {
        // Create a unique identifier for the problem (e.g., "123A", "500B")
        const problemIdentifier = `${submission.problemId}-${submission.contestId || 'problemset'}`;
        uniqueProblemsSolved.add(problemIdentifier);
      });

      const totalProblemsSolvedLast7Days = uniqueProblemsSolved.size;
      
      // Calculate average problems per day over the last 7 days.
      // Ensure we divide by 7 days to get average for the week, even if less than 7 submissions.
      // If no problems solved, it's 0.
      const averageProblemsPerDay = totalProblemsSolvedLast7Days > 0 
                                      ? (totalProblemsSolvedLast7Days / 7).toFixed(1) 
                                      : 0;

      // Add the calculated field to the student object
      student.averageProblemsPerDay = parseFloat(averageProblemsPerDay);
    }

    res.json(students); // Send the augmented student data
  } catch (error) {
    console.error('Error fetching students with average problems:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc Get a single student by ID
 * @route GET /api/students/:id
 * @access Private (Admin only)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error(`Error fetching student ${req.params.id}:`, error.message);
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid Student ID format' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc Add a new student.
 * Immediately sends a response, then asynchronously triggers CF data sync.
 * @route POST /api/students
 * @access Private (Admin only)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.addStudent = async (req, res) => {
  const { name, email, phoneNumber, codeforcesHandle, autoEmailEnabled } = req.body;

  // Basic validation
  if (!name || !email || !codeforcesHandle) {
    return res.status(400).json({ message: 'Name, Email, and Codeforces Handle are required' });
  }

  try {
    // Check if student with email or handle already exists
    const existingStudent = await Student.findOne({
      $or: [{ email }, { codeforcesHandle: codeforcesHandle.toLowerCase() }]
    });

    if (existingStudent) {
      if (existingStudent.email === email) {
        return res.status(400).json({ message: 'Student with this email already exists' });
      }
      if (existingStudent.codeforcesHandle === codeforcesHandle.toLowerCase()) {
        return res.status(400).json({ message: 'Student with this Codeforces handle already exists' });
      }
    }

    const newStudent = new Student({
      name,
      email,
      phoneNumber,
      codeforcesHandle,
      autoEmailEnabled: autoEmailEnabled !== undefined ? autoEmailEnabled : true, // Default to true
    });

    const savedStudent = await newStudent.save();

    // --- IMPORTANT CHANGE HERE ---
    // Send the response immediately.
    // The frontend will receive this success response without waiting for CF sync.
    res.status(201).json(savedStudent);

    // Now, asynchronously trigger the Codeforces data sync in the background.
    // Do NOT await this call, so it doesn't block the HTTP response.
    if (codeforcesHandle) {
      console.log(`[Background Task] Starting immediate CF data sync for new student ${codeforcesHandle} (ID: ${savedStudent._id})...`);
      fetchAndSaveCFData(savedStudent._id, codeforcesHandle)
        .then(() => {
          console.log(`[Background Task] Codeforces data sync completed for ${codeforcesHandle}.`);
        })
        .catch((cfError) => {
          console.error(`[Background Task] Codeforces sync failed for new student ${codeforcesHandle}:`, cfError.message);
          // In a real app, you might log this to a dedicated error tracking system
          // or mark the student's status as 'CF_SYNC_FAILED' in DB.
        });
    }

  } catch (error) {
    console.error('Error adding student:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc Update a student's details.
 * Immediately sends a response, then asynchronously triggers CF data sync if handle changed.
 * @route PUT /api/students/:id
 * @access Private (Admin only)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.updateStudent = async (req, res) => {
  const { name, email, phoneNumber, codeforcesHandle, autoEmailEnabled } = req.body;
  const studentId = req.params.id;

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check for duplicate email/handle if they are being changed
    if (email && email !== student.email) {
      const emailExists = await Student.findOne({ email });
      if (emailExists && emailExists._id.toString() !== studentId) {
        return res.status(400).json({ message: 'Another student with this email already exists' });
      }
    }
    const oldCodeforcesHandle = student.codeforcesHandle; // Store old handle before update
    if (codeforcesHandle && codeforcesHandle.toLowerCase() !== oldCodeforcesHandle.toLowerCase()) {
      const handleExists = await Student.findOne({ codeforcesHandle: codeforcesHandle.toLowerCase() });
      if (handleExists && handleExists._id.toString() !== studentId) {
        return res.status(400).json({ message: 'Another student with this Codeforces handle already exists' });
      }
    }

    student.name = name || student.name;
    student.email = email || student.email;
    student.phoneNumber = phoneNumber || student.phoneNumber;
    student.codeforcesHandle = codeforcesHandle || student.codeforcesHandle;
    student.autoEmailEnabled = autoEmailEnabled !== undefined ? autoEmailEnabled : student.autoEmailEnabled;


    const updatedStudent = await student.save();

    // --- IMPORTANT CHANGE HERE ---
    // Send the response immediately.
    // The frontend will receive this success response without waiting for CF sync.
    res.json(updatedStudent);

    // If Codeforces handle was updated, trigger immediate CF data sync asynchronously.
    // Do NOT await this call.
    if (codeforcesHandle && codeforcesHandle.toLowerCase() !== oldCodeforcesHandle.toLowerCase()) {
      console.log(`[Background Task] Codeforces handle changed for ${updatedStudent.name}. Triggering real-time CF data sync (ID: ${updatedStudent._id})...`);
      fetchAndSaveCFData(updatedStudent._id, updatedStudent.codeforcesHandle)
        .then(() => {
          console.log(`[Background Task] Codeforces data sync completed for ${updatedStudent.codeforcesHandle}.`);
        })
        .catch((cfError) => {
          console.error(`[Background Task] Codeforces sync failed for updated student ${updatedStudent.codeforcesHandle}:`, cfError.message);
          // Log this internal error, but the HTTP response was already sent.
        });
    }

  } catch (error) {
    console.error(`Error updating student ${req.params.id}:`, error.message);
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid Student ID format' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc Delete a student and their associated Codeforces data.
 * @route DELETE /api/students/:id
 * @access Private (Admin only)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    // Find and delete the student
    const student = await Student.findByIdAndDelete(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete associated Codeforces contest and submission data
    await CodeforcesContest.deleteMany({ studentId: student._id });
    await CodeforcesSubmission.deleteMany({ studentId: student._id });

    res.json({ message: 'Student and associated data removed successfully' });
  } catch (error) {
    console.error(`Error deleting student ${req.params.id}:`, error.message);
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid Student ID format' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc Download all student data as CSV.
 * @route GET /api/students/download-csv
 * @access Private (Admin only)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.downloadStudentsCsv = async (req, res) => {
  try {
    const students = await Student.find({}).lean(); // .lean() for plain JS objects for csv-stringify

    // Define CSV columns and their corresponding object keys
    const columns = [
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' },
      { key: 'phoneNumber', header: 'Phone Number' },
      { key: 'codeforcesHandle', header: 'Codeforces Handle' },
      { key: 'currentRating', header: 'Current Rating' },
      { key: 'maxRating', header: 'Max Rating' },
      {
        key: 'lastUpdatedCFData',
        header: 'Last CF Data Update',
        // Format date for CSV
        formatter: (value) => value ? new Date(value).toLocaleString() : 'N/A'
      },
      { key: 'reminderEmailCount', header: 'Reminder Emails Sent' },
      { key: 'autoEmailEnabled', header: 'Auto Email Enabled' },
      { key: 'createdAt', header: 'Created At', formatter: (value) => new Date(value).toLocaleString() },
    ];

    const csvString = await generateCsv(students, columns);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="students_data.csv"');
    res.status(200).send(csvString);

  } catch (error) {
    console.error('Error generating CSV:', error.message);
    res.status(500).json({ message: 'Failed to download CSV' });
  }
};

/**
 * @desc Get student profile data (contest history and problem solving data).
 * @route GET /api/students/:id/profile
 * @access Private (Admin only)
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getStudentProfile = async (req, res) => {
  try {
    const studentId = req.params.id;

    // Fetch student basic details
    const student = await Student.findById(studentId).select('-__v -createdAt -updatedAt'); // Exclude some fields
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Fetch contest history for the student
    const contestHistory = await CodeforcesContest.find({ studentId })
                                                  .sort({ contestTime: 1 }) // Sort by contest time ascending
                                                  .select('-__v -createdAt');

    // Fetch submissions for the student
    const submissions = await CodeforcesSubmission.find({ studentId })
                                                 .sort({ submissionTime: 1 }) // Sort by submission time ascending
                                                 .select('-__v -createdAt');

    res.json({
      student,
      contestHistory,
      submissions,
    });

  } catch (error) {
    console.error(`Error fetching student profile for ${req.params.id}:`, error.message);
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid Student ID format' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};
