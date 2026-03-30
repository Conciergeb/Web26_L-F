/**
 * MAIN SERVER FILE - This is the "heart" of the backend app.
 * It sets up the web server using Express.js (like a restaurant host managing tables/orders).
 * Beginners: Think of it as the main door - handles incoming requests from browser.
 */

// 1. IMPORT PACKAGES (like including libraries/tools)
const express = require('express');     // Core web server framework
const path = require('path');           // Helps with file paths (windows/mac)
const cors = require('cors');           // Allows frontend to talk to backend (security)
require('dotenv').config();             // Loads secret settings from .env file (like passwords)

// 2. CREATE APP (empty restaurant)
const app = express();                  // Creates the Express app instance

// 3. MIDDLEWARE (tools that process EVERY request automatically)
// These run BEFORE routes, like security checks or data prep
app.use(cors());                        // Allows requests from browser (localhost:3000)
app.use(express.json());                // Parses JSON data from forms (e.g. {name: "John"})
app.use(express.urlencoded({ extended: true })); // Parses form data (name=John&age=20)

// 4. SERVE STATIC FILES (HTML/CSS/JS/images directly from 'public' folder)
app.use(express.static(path.join(__dirname, 'public'))); // Browser gets home.html etc. without code

// 5. ROUTES (handle specific URLs like /api/lost - like menu sections)
app.use('/api/auth', require('./routes/auth'));    // Login/register endpoints
app.use('/api/lost', require('./routes/lost'));    // Lost item report handler
app.use('/api/found', require('./routes/found'));  // Found item report handler

// 6. START SERVER (open restaurant doors)
const PORT = process.env.PORT || 3000;             // Port number (like table number)
app.listen(PORT, () => {                           // Listen for visitors
  console.log(`Server running on port ${PORT}`);   // Log success message
});
/**
 * END OF server.js - Visit http://localhost:3000 to test!
 */
