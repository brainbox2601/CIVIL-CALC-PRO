/**
 * CivilCalc Pro — Backend API
 * Stack: Node.js + Express + MongoDB (Mongoose)
 * 
 * Run: npm install && npm start
 * ENV: MONGODB_URI, JWT_SECRET, PORT
 */

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));

// ── DATABASE CONNECTION ──────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civilcalc')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ── MODELS ──────────────────────────────────────────────────

/**
 * User Model
 * Stores engineer profile and authentication details
 */
const UserSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true, minlength: 6 },
  role:      { type: String, default: 'Engineer' },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
UserSchema.methods.matchPassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

const User = mongoose.model('User', UserSchema);

/**
 * Calculation Model
 * Stores every calculation run by a user for history/projects
 */
const CalculationSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:      { type: String, required: true },   // e.g. "Beam Analysis"
  inputs:    { type: Object, required: true },   // raw input parameters
  results:   { type: Object, required: true },   // computed outputs
  summary:   { type: String },                   // short human-readable result
  notes:     { type: String, default: '' },      // optional user notes
  project:   { type: String, default: 'General' },
  createdAt: { type: Date, default: Date.now },
});

const Calculation = mongoose.model('Calculation', CalculationSchema);

// ── AUTH MIDDLEWARE ──────────────────────────────────────────
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'civilcalc_secret');
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ── ROUTES ───────────────────────────────────────────────────

/** POST /api/auth/register — Create new account */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required' });
    if (await User.findOne({ email }))
      return res.status(409).json({ error: 'Email already registered' });
    const user = await User.create({ name, email, password, role });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'civilcalc_secret', { expiresIn: '30d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/auth/login — Sign in */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'civilcalc_secret', { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/auth/me — Get current user */
app.get('/api/auth/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

/** POST /api/calculations — Save a calculation */
app.post('/api/calculations', auth, async (req, res) => {
  try {
    const { type, inputs, results, summary, notes, project } = req.body;
    const calc = await Calculation.create({ userId: req.user.id, type, inputs, results, summary, notes, project });
    res.status(201).json(calc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/calculations — Get all calculations for user */
app.get('/api/calculations', auth, async (req, res) => {
  try {
    const { page=1, limit=20, type, project } = req.query;
    const filter = { userId: req.user.id };
    if (type) filter.type = type;
    if (project) filter.project = project;
    const calcs = await Calculation.find(filter)
      .sort({ createdAt: -1 })
      .skip((page-1)*limit)
      .limit(+limit);
    const total = await Calculation.countDocuments(filter);
    res.json({ calcs, total, pages: Math.ceil(total/limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** DELETE /api/calculations/:id — Delete a calculation */
app.delete('/api/calculations/:id', auth, async (req, res) => {
  try {
    const calc = await Calculation.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!calc) return res.status(404).json({ error: 'Calculation not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/calculations/stats — Summary stats for profile page */
app.get('/api/calculations/stats', auth, async (req, res) => {
  try {
    const stats = await Calculation.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const total = stats.reduce((a, s) => a + s.count, 0);
    res.json({ stats, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** 
 * POST /api/calculate/beam — Server-side beam calculation
 * Validates inputs and runs structural formulas
 */
app.post('/api/calculate/beam', auth, async (req, res) => {
  try {
    const { load, span, type, E, I } = req.body;
    const P=+load, L=+span, E_val=+E*1e9, I_val=+I*1e-8;
    if([P,L,E_val,I_val].some(v=>!v||v<=0))
      return res.status(400).json({ error: 'Invalid input parameters' });
    let Mmax, Vmax, dmax;
    if(type==='ss'){Mmax=P*L/4;Vmax=P/2;dmax=(P*L**3)/(48*E_val*I_val)*1000;}
    else if(type==='cant'){Mmax=P*L;Vmax=P;dmax=(P*L**3)/(3*E_val*I_val)*1000;}
    else{Mmax=P*L/8;Vmax=P/2;dmax=(P*L**3)/(192*E_val*I_val)*1000;}
    const results = {
      Mmax: Mmax.toFixed(2), Vmax: Vmax.toFixed(2), dmax: dmax.toFixed(3),
      allowable_defl: (L*1000/360).toFixed(1),
      safe: dmax < L*1000/360
    };
    // Optionally save to DB
    await Calculation.create({ userId: req.user.id, type:'Beam Analysis', inputs:req.body, results, summary:`M=${results.Mmax}kN·m, δ=${results.dmax}mm` });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── HEALTH CHECK ─────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── START ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 CivilCalc API running on port ${PORT}`));

module.exports = app;
