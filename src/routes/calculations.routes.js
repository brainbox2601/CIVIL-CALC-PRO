// src/routes/calculations.routes.js
// ─────────────────────────────────────────────────────────────
// Saved calculations — all routes are protected.
// Data stored in Supabase PostgreSQL table: `calculations`
//
// SQL to create the table (run once in Supabase SQL editor):
//
//   CREATE TABLE calculations (
//     id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//     user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
//     type        TEXT NOT NULL,
//     inputs      JSONB NOT NULL,
//     results     JSONB NOT NULL,
//     summary     TEXT,
//     created_at  TIMESTAMPTZ DEFAULT now()
//   );
//
//   – Row Level Security: users only see their own calculations
//   ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;
//
//   CREATE POLICY “Users see own calculations”
//     ON calculations FOR ALL
//     USING (auth.uid() = user_id);
//
// ─────────────────────────────────────────────────────────────

const express  = require(‘express’);
const router   = express.Router();
const { supabaseAdmin }  = require(’../lib/supabaseclient’);
const { authenticate }   = require(’../middleware/auth.middleware’);

// All calculations routes require a valid session
router.use(authenticate);

// ── SAVE CALCULATION ──────────────────────────────────────────
// POST /api/calculations
router.post(’/’, async (req, res) => {
try {
const { type, inputs, results, summary } = req.body;

```
if (!type || !inputs || !results) {
  return res.status(400).json({
    success: false,
    message: 'type, inputs, and results are required.',
  });
}

const { data, error } = await supabaseAdmin
  .from('calculations')
  .insert({
    user_id: req.user.id,
    type,
    inputs,
    results,
    summary: summary || null,
  })
  .select()
  .single();

if (error) {
  console.error('[POST /calculations]', error.message);
  return res.status(500).json({ success: false, message: 'Failed to save calculation.' });
}

return res.status(201).json({
  success: true,
  message: 'Calculation saved.',
  data,
});
```

} catch (err) {
console.error(’[POST /calculations]’, err.message);
return res.status(500).json({ success: false, message: ‘Server error.’ });
}
});

// ── GET ALL CALCULATIONS ──────────────────────────────────────
// GET /api/calculations?page=1&limit=20&type=Beam+Analysis
router.get(’/’, async (req, res) => {
try {
const page  = Math.max(1, parseInt(req.query.page  || ‘1’,  10));
const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || ‘20’, 10)));
const type  = req.query.type || null;
const from  = (page - 1) * limit;
const to    = from + limit - 1;

```
let query = supabaseAdmin
  .from('calculations')
  .select('*', { count: 'exact' })
  .eq('user_id', req.user.id)
  .order('created_at', { ascending: false })
  .range(from, to);

if (type) query = query.eq('type', type);

const { data, error, count } = await query;

if (error) {
  console.error('[GET /calculations]', error.message);
  return res.status(500).json({ success: false, message: 'Failed to fetch calculations.' });
}

return res.status(200).json({
  success: true,
  data,
  meta: {
    total:      count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  },
});
```

} catch (err) {
console.error(’[GET /calculations]’, err.message);
return res.status(500).json({ success: false, message: ‘Server error.’ });
}
});

// ── DELETE CALCULATION ────────────────────────────────────────
// DELETE /api/calculations/:id
router.delete(’/:id’, async (req, res) => {
try {
const { error } = await supabaseAdmin
.from(‘calculations’)
.delete()
.eq(‘id’,      req.params.id)
.eq(‘user_id’, req.user.id); // Ensure user owns this record

```
if (error) {
  return res.status(500).json({ success: false, message: 'Failed to delete calculation.' });
}

return res.status(204).send();
```

} catch (err) {
console.error(’[DELETE /calculations]’, err.message);
return res.status(500).json({ success: false, message: ‘Server error.’ });
}
});

module.exports = router;
