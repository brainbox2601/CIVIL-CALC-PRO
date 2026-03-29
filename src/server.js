// src/server.js
// ─────────────────────────────────────────────────────────────
// CivilCalc Pro — Express backend with Supabase auth
// ─────────────────────────────────────────────────────────────

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');

const authRoutes         = require('./routes/auth.routes');
const calculationRoutes  = require('./routes/calculations.routes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── MIDDLEWARE ────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting — tighter on auth endpoints
const generalLimiter = rateLimit({ windowMs: 15*60*1000, max: 200 });
const authLimiter    = rateLimit({
  windowMs: 15*60*1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts. Try again later.' },
});

app.use(generalLimiter);

// ── HEALTH CHECK ──────────────────────────────────────────────
app.get('/health', (_, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ── ROUTES ────────────────────────────────────────────────────
app.use('/api/auth',         authLimiter, authRoutes);
app.use('/api/calculations', calculationRoutes);

// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` })
);

// ── GLOBAL ERROR HANDLER ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong.'
      : err.message,
  });
});

// ── START ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ CivilCalc API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

module.exports = app;
