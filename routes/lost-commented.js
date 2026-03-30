/**
 * LOST REPORT ROUTE - Handles POST /api/lost (user submits lost item form).
 * Requires login (authGuard), saves to DB, sends confirmation email.
 * Beginners: Like "report lost wallet" form → store data + email "we got it".
 * Triggered by browser fetch('/api/lost') from lost.html.
 */

const express = require('express');           // Router tools
const multer = require('multer');             // File upload handler (images)
const nodemailer = require('nodemailer');     // Send emails
const { db } = require('../db');              // Database
const authGuard = require('../middleware/auth'); // Login check
const router = express.Router();              // Sub-routes handler

// FILE UPLOAD SETUP (saves images to uploads/ folder)
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',                    // Folder for images
    filename: (req, file, cb) => {              // Rename file: timestamp-originalname.jpg
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  })
});

// EMAIL TRANSPORTER (Gmail setup - uses .env secrets)
const transporter = nodemailer.createTransporter({
  service: 'gmail',                            // Gmail service
  auth: { 
    user: process.env.EMAIL_USER,              // Your Gmail (from .env)
    pass: process.env.EMAIL_PASS               // App password (NOT regular password)
  }
});

// MAIN ENDPOINT - POST /api/lost
router.post('/', authGuard, upload.single('image'), async (req, res) => {
  // 1. EXTRACT FORM DATA (from lost.html)
  const {
    fullname, sex, college, department, phone, email, description, hostel, offcampus
  } = req.body;

  // 2. VALIDATION (must-have fields)
  if (!fullname || !email || !description) {
    return res.status(400).json({ message: 'fullname, email, and description are required' });
  }

  // 3. GET IMAGE PATH (if uploaded)
  const imagePath = req.file ? req.file.path : null;  // uploads/123.jpg or null

  try {
    // 4. SAVE TO DATABASE (lost_reports table)
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO lost_reports
          (fullname, sex, college, department, phone, email, description, hostel, offcampus, imagePath, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')  -- status starts as 'pending'
      `, [fullname, sex, college, department, phone, email, description, hostel, offcampus, imagePath], 
      function(err) {                            // Callback when done
        if (err) reject(err);                    // SQL error?
        else resolve();                          // Success!
      });
    });

    // 5. SEND CONFIRMATION EMAIL (your requirement!)
    await transporter.sendMail({
      from: process.env.EMAIL_USER,              // From admin Gmail
      to: email,                                 // To user who submitted
      subject: 'Lost report received',           // Subject line
      text: `Hello ${fullname},\\n\\nYour report was received and will be addressed as soon as possible.`  // Message
    });

    // 6. SUCCESS RESPONSE (browser alert shows this)
    res.json({ message: 'Lost report saved and email sent' });
  } catch (err) {                                // Any step fails?
    console.error(err);                          // Log for debug
    res.status(500).json({ message: 'Error saving lost report' });
  }
});

// EXPORT ROUTER for server.js
module.exports = router;
