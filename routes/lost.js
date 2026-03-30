// routes/lost.js
const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const { db } = require('../db');
const authGuard = require('../middleware/auth');
const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
  })
});

// Comment email - Gmail issue
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

router.post('/', upload.single('image'), async (req, res) => {
  console.log('=== LOST SUBMIT HIT ===');
  const body = req.body;
  console.log('Body keys:', Object.keys(body));
  console.log('reporterType:', body.reporterType);
  console.log('File:', req.file ? 'yes' : 'no');

  const {
    fullname, sex, college, department, phone, email, description, hostel, offcampus,
    reporterType, staffDept, staffId, studentId
  } = body;

  if (!fullname || !email || !description) {
    return res.status(400).json({ message: 'fullname, email, and description are required' });
  }

  const staffRole = reporterType === 'staff' ? 1 : 0;

  const imagePath = req.file ? req.file.path : null;

  try {
    console.log('DB INSERT with staffRole=', staffRole);
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO lost_reports
          (fullname, sex, college, department, phone, email, description, hostel, offcampus, 
           staffRole, staffDept, staffId, studentId, imagePath, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `, [fullname, sex || null, college || null, department || null, phone || null, email, description, hostel || null, offcampus || null,
          staffRole, staffDept || null, staffId || null, studentId || null, imagePath], function(err) {
        if (err) {
          reject(err);
        } else {
          console.log('DB success ID:', this.lastID);
          resolve();
        }
      });
    });

    // Email optional
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Lost report received',
        text: `Hello ${fullname},\n\nYour report was received. ID: saved.`
      });
    } catch (e) {
      console.log('Email skipped:', e.message);
    }

    res.json({ message: 'Lost report submitted. Thank you!' });
  } catch (err) {
    console.error('ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
