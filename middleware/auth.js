/**
 * AUTH GUARD MIDDLEWARE - "Security Guard" for protected routes.
 * Checks login token before allowing access to lost/found reports.
 * Beginners: Like a bouncer at a club - only lets in logged-in users.
 * Runs BETWEEN request & route handler.
 */

const jwt = require('jsonwebtoken');  // Library for creating/checking login tokens (JWT = JSON Web Token)

// SECRET KEY (like password to decode tokens - from .env or fallback)
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';

/**
 * MAIN FUNCTION - authGuard(req, res, next)
 * req = incoming request data, res = response, next() = let pass to next step
 */
function authGuard(req, res, next) {
  // 1. GET TOKEN FROM HEADERS (sent by browser: Authorization: Bearer eyJ...)
  const authHeader = req.headers.authorization || req.headers.Authorization;  // Case insensitive
  if (!authHeader || !authHeader.startsWith('Bearer ')) {  // Must start with "Bearer "
    return res.status(401).json({ message: 'Missing or invalid authorization header' });  // Block + error
  }

  // 2. EXTRACT TOKEN (split "Bearer TOKEN" → TOKEN part)
  const token = authHeader.split(' ')[1];  // Split by space, take index 1
  if (!token) {
    return res.status(401).json({ message: 'Missing authentication token' });
  }

  // 3. VERIFY TOKEN (decode + check if valid/not expired)
  try {
    const payload = jwt.verify(token, JWT_SECRET);  // Decodes token using secret
    req.user = payload;  // Attach user info to request (for later use)
    next();  // APPROVED! Continue to route handler
  } catch (err) {  // Bad/expired token
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// EXPORT FUNCTION for use in routes (e.g. router.post('/', authGuard, handler))
module.exports = authGuard;
