/**
 * AUTH ROUTES - Handles /api/auth/register & /api/auth/login.
 * Creates accounts, checks passwords, generates login tokens.
 * Beginners: Like front desk - new user signup or check-in with ID.
 * URL: POST /api/auth/register or /api/auth/login
 */

const express = require('express');     // Express router tools
const bcrypt = require('bcrypt');       // Encrypts passwords (secure hash)
const jwt = require('jsonwebtoken');    // Creates login tokens
const { body, validationResult } = require('express-validator'); // Input validation
const { db } = require('../db');        // Database connection

const router = express.Router();         // Mini "sub-server" for auth URLs

// SETTINGS (from .env - customize expiry/secret)
const JWT_SECRET = process.env.JWT_SECRET || 'please-change-this-secret-in-prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';  // Token valid 1 hour

// REGISTER ENDPOINT (new user signup)
router.post('/register',
  // VALIDATION RULES (check input before processing)
  body('email').isEmail(),                           // Must be valid email
  body('password').isLength({ min: 8 }),             // Password at least 8 chars
  async (req, res) => {                              // Handler function
    const errors = validationResult(req);             // Get validation results
    if (!errors.isEmpty()) {                         // Bad input?
      return res.status(400).json({ errors: errors.array() });  // Send errors back
    }

    const { email, password, fullName } = req.body;    // Extract form data

    try {
      // CHECK IF EMAIL ALREADY EXISTS
      const existing = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM Users WHERE email = ?', [email], (err, row) => {
          if (err) reject(err);
          else resolve(row);  // Pure SQLite
        });
      });

      if (existing) {  // Duplicate?

        return res.status(409).json({ message: 'Email already registered' });
      }

      // ENCRYPT PASSWORD (never store plain text!)
      const passwordHash = await bcrypt.hash(password, 12);  // Salt rounds = strength

      // SAVE NEW USER TO DB
      await new Promise((resolve, reject) => {
        db.run('INSERT INTO Users (email, passwordHash, fullName) VALUES (?, ?, ?)', 
          [email, passwordHash, fullName || null],       // null if no name
          function(err) { if (err) reject(err); else resolve(); }  // Callback
        );
      });

      res.json({ message: 'User registered successfully' });  // Success!
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Registration failed' });  // Server error
    }
  }
);

// LOGIN ENDPOINT
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // BASIC CHECKS
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // FIND USER IN DB
    const userRow = await new Promise((resolve, reject) => {
      db.get('SELECT id, passwordHash, role, fullName FROM Users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!userRow) {  // No user?

      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = userRow;

    const validPassword = await bcrypt.compare(password, user.passwordHash);  // Check password

    if (!validPassword) {                              // Wrong password?
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // CREATE LOGIN TOKEN (JWT - secure pass for 1hr)
    const token = jwt.sign(
      { uid: user.id, email: user.email || email, role: user.role || 'user' },  // User data inside token
      JWT_SECRET,                                      // Secret key
      { expiresIn: JWT_EXPIRES_IN }                    // Expires in 1h
    );

    // SEND TOKEN + USER INFO
    res.json({ 
      token,                                           // Save in localStorage for authGuard
      user: { id: user.id, email: user.email || email, fullName: user.fullName, role: user.role || 'user' } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
});

// MAKE ROUTER AVAILABLE TO server.js
module.exports = router;
