/**
 * DATABASE FILE - Manages data storage using SQLite (like a simple Excel file for app data).
 * Auto-creates tables for users/reports when server starts.
 * Beginners: Think of it as creating "spreadsheets" to store login info + lost/found reports.
 */

const sqlite3 = require('sqlite3').verbose();  // SQLite library (local file-based database)
const path = require('path');                 // Helps find/create database file path

// DATABASE FILE PATH (puts database in same folder as this file)
const dbPath = path.join(__dirname, 'database.db');

// CONNECT TO DATABASE (or create if missing)
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('SQLite connection failed:', err);  // Error if file broken/corrupt
  } else {
    console.log('Connected to SQLite database at', dbPath);  // Success!
    initTables();  // Create tables if they don't exist
  }
});

/**
 * CREATE TABLES FUNCTION - Runs once on startup.
 * Uses "IF NOT EXISTS" so safe to run multiple times (no duplicates).
 * serialize() = do one after another (no overlaps).
 */
function initTables() {
  db.serialize(() => {  // Ensures commands run in order
    // 1. USERS TABLE (stores login accounts)
    db.run(`
      CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,    -- Auto-numbered unique ID
        email TEXT UNIQUE NOT NULL,              -- Login email (unique, required)
        passwordHash TEXT NOT NULL,              -- Encrypted password
        fullName TEXT,                           -- User's name (optional)
        role TEXT DEFAULT 'user',                -- Admin/user role (default user)
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP  -- Auto timestamp
      )
    `);

    // 2. LOST REPORTS TABLE (user lost item reports - WITH STAFF FIELDS)
    db.run(`
      CREATE TABLE IF NOT EXISTS lost_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullname TEXT NOT NULL,                  -- Reporter's full name
        sex TEXT,                                -- Gender
        college TEXT,                            -- College name
        department TEXT,                         -- Student department
        staffRole INTEGER DEFAULT 0,             -- 1 if staff, 0 if student
        staffDept TEXT,                          -- Staff department (HR, IT etc.)
        staffId TEXT,                            -- Staff ID number
        phone TEXT,                              -- Contact phone
        email TEXT NOT NULL,                     -- Reporter's email (for confirmation)
        description TEXT NOT NULL,               -- What item lost + details
        hostel TEXT,                             -- Campus hostel (if applicable)
        offcampus TEXT,                          -- Off-campus address
        imagePath TEXT,                          -- Photo file path
        status TEXT DEFAULT 'pending',           -- Report status (pending/resolved)
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);


    // 3. FOUND REPORTS TABLE (user found item reports - WITH ID FIELDS)
    db.run(`
      CREATE TABLE IF NOT EXISTS found_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        finderName TEXT NOT NULL,                -- Finder's name
        finderSex TEXT,                          -- Gender
        finderAge TEXT,                          -- Age range
        phone TEXT,                              -- Contact
        studentId TEXT,                          -- Student ID (if student)
        staffId TEXT,                            -- Staff ID (if staff)
        email TEXT NOT NULL,                     -- Email for confirmation
        foundPlace TEXT,                         -- Where found
        college TEXT,                            -- Finder's college
        department TEXT,                         -- Department
        foundByType TEXT DEFAULT 'other',        -- Student/staff/etc.
        foundDescription TEXT NOT NULL,          -- Item description
        imagePath TEXT,                          -- Photo
        status TEXT DEFAULT 'unclaimed',         -- unclaimed/matched
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);


    console.log('Tables initialized');  // All tables ready!
  });
}

// EXPORT DATABASE for other files to use (like sharing a toolbox)
module.exports = { db };

