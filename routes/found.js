// routes/found.js
const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const { db } = require('../db');
const router = express.Router();

const upload = multer({ storage: multer.diskStorage({ destination: 'uploads/', filename: (req,f,cb)=>cb(null, `${Date.now()}-${f.originalname}`) })});

// Comment email - Gmail issue
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

router.post('/', upload.single('image'), async (req, res) => {
  console.log('=== FOUND SUBMIT HIT ===');
  console.log('Headers auth:', req.headers.authorization);
  console.log('Body keys:', Object.keys(req.body));
  console.log('File:', req.file ? req.file.filename : 'none');
  
  // Extract ALL fields properly from FormData using req.body
  const finderName = req.body['full Name'] || req.body.finderName || '';
  const finderSex = req.body.Sex || req.body.finderSex || null;
  const phone = req.body.phone || null;
  const email = req.body.email || '';
  const studentId = req.body.studentId || null;
  const staffId = req.body.staffId || null;
  const foundPlace = req.body.foundPlace || null;
  const college = req.body.college || null;
  const department = req.body.department || null;
  const foundByType = req.body.foundByType || 'other';
  const foundDescription = req.body.foundDescription || '';
  const finderAge = req.body.finderAge || null;

  console.log('Extracted fields:', {finderName, email, foundDescription: foundDescription.substring(0,50), college, studentId, staffId});

  if (!finderName || !email || !foundDescription) {
    console.log('Missing required fields');
    return res.status(400).json({ message: 'finderName, email, foundDescription required' });
  }

  try {
    const imagePath = req.file ? req.file.path : null;
    
    // DB insert with error handling
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO found_reports (finderName, finderSex, finderAge, phone, studentId, staffId, email, foundPlace, college, department, foundByType, foundDescription, imagePath, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unclaimed')
      `, [finderName, finderSex, finderAge, phone, studentId, staffId, email, foundPlace, college, department, foundByType, foundDescription, imagePath], function(err) {
        if (err) {
          console.error('DB INSERT ERROR:', err);
          reject(err);
        } else {
          console.log('Found DB success ID:', this.lastID);
          resolve();
        }
      });
    });

    // Email optional (non-critical)
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'KNUST Found Report Received',
        text: `Hello ${finderName},\n\nYour found item report has been received. Thank you!`
      });
      console.log('Email sent to:', email);
    } catch (emailErr) {
      console.log('Email failed (non-critical):', emailErr.message);
    }

    // Success - EXACT match to frontend expectation
    res.json({ message: 'Found Report submitted Thank you' });
  } catch (err) {
    console.error('=== CRITICAL FOUND ERROR ===', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

module.exports = router;
