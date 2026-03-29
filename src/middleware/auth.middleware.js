// src/middleware/auth.middleware.js
// ─────────────────────────────────────────────────────────────
// Replaces your old JWT verify middleware completely.
//
// How it works:
//   1. Frontend sends:  Authorization: Bearer <supabase_access_token>
//   2. We call supabase.auth.getUser(token)
//   3. Supabase validates it cryptographically on their servers
//   4. We attach the user to req.user and call next()
//
// No more: jwt.verify(), bcrypt, secret keys, token expiry logic.
// Supabase handles ALL of that for you automatically.
// ─────────────────────────────────────────────────────────────

const { supabaseAdmin } = require('../lib/supabaseclient');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Missing or malformed authorization header.',
      });
    }

    const token = header.split(' ')[1];

    // Supabase verifies the token — no secret key needed on your end
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.',
      });
    }

    // Attach user to request — available in all downstream route handlers
    req.user = {
      id:    user.id,           // Supabase UUID
      email: user.email,
      role:  user.role,         // 'authenticated' by default
      meta:  user.user_metadata, // name, avatar etc stored here
    };

    next();
  } catch (err) {
    console.error('[auth.middleware] Unexpected error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Authentication check failed.',
    });
  }
};

module.exports = { authenticate };
