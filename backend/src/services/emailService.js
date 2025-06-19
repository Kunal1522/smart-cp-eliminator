// backend/src/services/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables

// Create a Nodemailer transporter using SMTP for Gmail
// WARNING: Using a personal Gmail account for automated emails is NOT recommended for production.
// It has strict sending limits and deliverability issues (emails often land in spam).
// For production, use a dedicated email service like SendGrid, Mailgun, Brevo, AWS SES, etc.
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use 'gmail' as service for simplicity
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail email address
    pass: process.env.EMAIL_PASS, // Your Gmail App Password (NOT your regular password)
  },
});

/**
 * @desc Sends an inactivity reminder email to a student.
 * @param {string} toEmail - Recipient's email address.
 * @param {string} studentName - Name of the student.
 * @param {number} reminderCount - The number of times this reminder has been sent.
 */
const sendReminderEmail = async (toEmail, studentName, reminderCount) => {
  // IMPORTANT: Replace 'http://localhost:3000' with the actual public URL of your frontend
  // where 'meme.jpg' is accessible (e.g., 'https://your-deployed-frontend.com').
  const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'; // Fallback to localhost
  const imageUrl = `https://i.pinimg.com/736x/a6/be/ef/a6beef75ba3c87a809f4f971e0b27ebc.jpg`; 

  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to: toEmail, // Recipient address
    subject: `[Student Progress System] Time to Get Back to Problem Solving, ${studentName}!`, // Subject line
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px; border-radius: 8px;">
        <h2 style="color: #0056b3; text-align: center; margin-bottom: 20px;">Hello ${studentName},</h2>
        <p style="background-color: #ffffff; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
          We noticed that you haven't made any Codeforces submissions in the last 7 days.
        </p>
        <p style="background-color: #ffffff; padding: 15px; border-radius: 5px; border: 1px solid #ddd; margin-top: 10px;">
          Consistency is key to improving your competitive programming skills!
        </p>
        <p style="background-color: #ffffff; padding: 15px; border-radius: 5px; border: 1px solid #ddd; margin-top: 10px;">
          Let's get back to solving some problems and watch your rating soar.
        </p>
        <p style="text-align: center; margin-top: 25px; font-size: 1.1em;">
          This is reminder number: <strong>${reminderCount}</strong>
        </p>
        
        <p style="text-align: center; margin: 30px 0;">
          <img src="${imageUrl}" alt="Programming Meme" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); border: 2px solid #ddd;" />
        </p>

        <p style="text-align: center; margin-top: 25px;">Keep up the great work!</p>
        <p style="text-align: center;">Best regards,<br><strong style="color: #0056b3;">Your TLE Eliminators Team</strong></p>
        <hr style="border: 0; border-top: 1px solid #ccc; margin: 30px 0;">
        <p style="font-size: 0.8em; color: #666; text-align: center;">This is an automated email. Please do not reply.</p>
      </div>
    `, // HTML body
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Inactivity reminder email sent to ${toEmail}.`);
  } catch (error) {
    console.error(`Failed to send email to ${toEmail}:`, error.message);
    console.error('Nodemailer error details:', error); // Log more details for debugging
  }
};

module.exports = {
  sendReminderEmail,
};
