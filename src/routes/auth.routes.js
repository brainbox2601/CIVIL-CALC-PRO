// src/routes/auth.routes.js
// ─────────────────────────────────────────────────────────────
// All auth is handled by Supabase — your backend just proxies
// the calls and returns a clean response shape.
//
// Routes:
//   POST   /api/auth/register    → email + password signup
//   POST   /api/auth/login       → email + password login
//   POST   /api/auth/logout      → invalidate session
//   GET    /api/auth/me          → get current user (protected)
//   POST   /api/auth/google      → exchange Google token
//   POST   /api/auth/refresh     → refresh access token
// ─────────────────────────────────────────────────────────────

const express    = require('express');
const router     = express.Router();
const { supabaseAdmin, supabaseAnon } = require('../lib/supabaseclient');
const { authenticate } = require('../middleware/auth.middleware');

// ── REGISTER ──────────────────────────────────────────────────
// Creates user in Supabase Auth + stores name in user_metadata
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,         // skip email confirmation for now
      user_metadata: { name },     // stored on the user object
    });

    if (error) {
      // Supabase returns a clear message e.g. "User already registered"
      return res.status(400).json({ success: false, message: error.message });
    }

    // Sign them in immediately after registration to get the session tokens
    const { data: session, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return res.status(400).json({ success: false, message: signInError.message });
    }

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        user:         sanitizeUser(session.user),
        accessToken:  session.session.access_token,
        refreshToken: session.session.refresh_token,
        expiresAt:    session.session.expires_at,
      },
    });
  } catch (err) {
    console.error('[/register]', err.message);
    return res.status(500).json({ success: false, message: 'Registration failed.' });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Supabase returns 'Invalid login credentials' — keep it vague, good for security
      return res.status(401).json({ success: false, message: error.message });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user:         sanitizeUser(data.user),
        accessToken:  data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt:    data.session.expires_at,
      },
    });
  } catch (err) {
    console.error('[/login]', err.message);
    return res.status(500).json({ success: false, message: 'Login failed.' });
  }
});

// ── LOGOUT ────────────────────────────────────────────────────
// Invalidates the refresh token server-side
router.post('/logout', authenticate, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];

    // Sign out this specific session using the access token
    const { error } = await supabaseAdmin.auth.admin.signOut(token);

    if (error) console.warn('[/logout] Supabase error:', error.message);
    // Always return 204 — even if token was already expired
    return res.status(204).send();
  } catch (err) {
    console.error('[/logout]', err.message);
    return res.status(204).send(); // Silent success — logout should never fail visibly
  }
});

// ── REFRESH TOKEN ─────────────────────────────────────────────
// Frontend sends the refresh token, gets back a new access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required.' });
    }

    const { data, error } = await supabaseAnon.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Token refreshed.',
      data: {
        user:         sanitizeUser(data.user),
        accessToken:  data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt:    data.session.expires_at,
      },
    });
  } catch (err) {
    console.error('[/refresh]', err.message);
    return res.status(500).json({ success: false, message: 'Token refresh failed.' });
  }
});

// ── GOOGLE OAuth ──────────────────────────────────────────────
// Frontend signs in with Google using @react-oauth/google,
// gets back a Google ID token, sends it here for exchange
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Google ID token is required.' });
    }

    const { data, error } = await supabaseAnon.auth.signInWithIdToken({
      provider: 'google',
      token:    idToken,
    });

    if (error) {
      return res.status(401).json({ success: false, message: error.message });
    }

    return res.status(200).json({
      success: true,
      message: 'Google login successful.',
      data: {
        user:         sanitizeUser(data.user),
        accessToken:  data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt:    data.session.expires_at,
      },
    });
  } catch (err) {
    console.error('[/google]', err.message);
    return res.status(500).json({ success: false, message: 'Google auth failed.' });
  }
});

// ── GET CURRENT USER ──────────────────────────────────────────
// Protected — requires valid Bearer token
router.get('/me', authenticate, async (req, res) => {
  try {
    // req.user was attached by authenticate middleware
    // Fetch fresh from Supabase in case metadata changed
    const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(req.user.id);

    if (error || !user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      data:    sanitizeUser(user),
    });
  } catch (err) {
    console.error('[/me]', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch user.' });
  }
});

// ── HELPER ────────────────────────────────────────────────────
// Strip internal Supabase fields before sending to client
function sanitizeUser(user) {
  return {
    id:        user.id,
    email:     user.email,
    name:      user.user_metadata?.name      || user.email.split('@')[0],
    avatarUrl: user.user_metadata?.avatar_url || null,
    role:      user.role,                    // 'authenticated'
    createdAt: user.created_at,
  };
}

module.exports = router;
