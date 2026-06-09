'use strict';

const crypto  = require('crypto');
const express = require('express');
const { Pool } = require('pg');
const session  = require('express-session');
const nodemailer = require('nodemailer');
const path    = require('path');
const Groq    = require('groq-sdk');

const app  = express();
const PORT = process.env.PORT || 5000;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ── Validate required secrets at startup ──────────────────────────────────
if (!process.env.SESSION_SECRET) {
  console.warn('[Security] SESSION_SECRET env var is not set. A random secret will be used — all sessions will be lost on restart. Set SESSION_SECRET in your environment.');
}
if (!process.env.ADMIN_PASSWORD) {
  console.error('[Security] CRITICAL: ADMIN_PASSWORD env var is not set. Admin login is disabled until it is configured.');
}

const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

// ── Security headers ──────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://upload.wikimedia.org",
      "connect-src 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  );
  next();
});

// ── Block direct access to server-side files ──────────────────────────────
const BLOCKED_PATHS = /^\/(server\.js|package(?:-lock)?\.json|\.env[^/]*|\.replit[^/]*|\.git[^/]*|node_modules[^/]*)/i;
app.use((req, res, next) => {
  if (BLOCKED_PATHS.test(req.path)) return res.status(403).end();
  next();
});

// ── In-memory rate limiter ────────────────────────────────────────────────
const _rateLimitStore = new Map();
// Periodically clear stale entries to avoid memory leak
setInterval(() => {
  const cutoff = Date.now() - 15 * 60 * 1000;
  for (const [k, v] of _rateLimitStore) {
    if (v.start < cutoff) _rateLimitStore.delete(k);
  }
}, 5 * 60 * 1000);

function rateLimit(maxReqs, windowMs) {
  return (req, res, next) => {
    const ip  = req.ip || req.socket?.remoteAddress || 'unknown';
    const key = `${req.path}::${ip}`;
    const now = Date.now();
    let entry = _rateLimitStore.get(key);
    if (!entry || now - entry.start > windowMs) {
      entry = { count: 1, start: now };
    } else {
      entry.count++;
    }
    _rateLimitStore.set(key, entry);
    if (entry.count > maxReqs) {
      return res.status(429).json({ error: 'Too many requests — please try again later.' });
    }
    next();
  };
}

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: true, limit: '32kb' }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000
  }
}));
app.use(express.static(path.join(__dirname)));

// ── HTML escape helper (prevents XSS in email templates) ──────────────────
function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// ── Email ──────────────────────────────────────────────────────────────────
function sendAdminEmail(appointment) {
  const user  = process.env.SMTP_USER;
  const pass  = process.env.SMTP_PASS;
  const adminEmail = process.env.ADMIN_EMAIL || user;
  if (!user || !pass) {
    console.log('[Email] SMTP not configured — skipping notification');
    return;
  }
  const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
  const { id, full_name, phone, email, department, appointment_date, appointment_time, message } = appointment;
  const dateStr = new Date(appointment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  transporter.sendMail({
    from: `"Wangduk Health" <${user}>`,
    to: adminEmail,
    subject: `New Appointment #${id} — ${escHtml(full_name)}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#1e3a6e,#2563eb);padding:24px;color:#fff">
          <h2 style="margin:0;font-size:20px">New Appointment Request</h2>
          <p style="margin:4px 0 0;opacity:.85;font-size:13px">Wangduk Health and Research — Admin Notification</p>
        </div>
        <div style="padding:24px">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#64748b;width:140px">Appointment ID</td><td style="padding:8px 0;font-weight:600">#${escHtml(String(id))}</td></tr>
            <tr style="background:#f8fafc"><td style="padding:8px 4px;color:#64748b">Patient Name</td><td style="padding:8px 4px;font-weight:600">${escHtml(full_name)}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Phone</td><td style="padding:8px 0">${escHtml(phone)}</td></tr>
            <tr style="background:#f8fafc"><td style="padding:8px 4px;color:#64748b">Email</td><td style="padding:8px 4px">${escHtml(email)}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Department</td><td style="padding:8px 0">${escHtml(department)}</td></tr>
            <tr style="background:#f8fafc"><td style="padding:8px 4px;color:#64748b">Date</td><td style="padding:8px 4px">${escHtml(dateStr)}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Time</td><td style="padding:8px 0">${escHtml(appointment_time)}</td></tr>
            ${message ? `<tr style="background:#f8fafc"><td style="padding:8px 4px;color:#64748b">Notes</td><td style="padding:8px 4px">${escHtml(message)}</td></tr>` : ''}
          </table>
          <div style="margin-top:20px">
            <a href="${process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : ''}/admin" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600">View in Admin Dashboard →</a>
          </div>
        </div>
        <div style="background:#f8fafc;padding:14px 24px;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0">
          Wangduk Health and Research · Bistupur, Jamshedpur, Jharkhand
        </div>
      </div>`
  }, (err) => {
    if (err) console.error('[Email] Send error:', err.message);
    else console.log(`[Email] Notification sent for appointment #${id}`);
  });
}

// ── AI Chatbot ────────────────────────────────────────────────────────────
let _groq = null;
function getGroq() {
  if (!_groq) {
    if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is not configured');
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

const SYSTEM_PROMPT = `You are a helpful, friendly, and professional AI assistant for Wangduk Health and Research, a hospital located in Bistupur, Jamshedpur, Jharkhand, India.

Your role is to assist patients and visitors with:
- Appointment booking guidance
- Information about hospital services and departments
- Doctor and staff information
- Hospital timings and location
- Fees and insurance queries
- Emergency assistance

Hospital details:
- Name: Wangduk Health and Research
- Location: Bistupur, Jamshedpur, Jharkhand, India
- Phone: 9263403905 (24/7 Emergency)
- Founded: 1889
- Director: Prof. Laslong Wangduk (Cardiology & Orthopedics specialist, Yoshida Award recipient, trained at AIIMS Surat)
- Staff: 145+ active healthcare professionals
- Facilities: MRI, CT Scan, Diagnostics Lab, Emergency (24x7), Pharmacy (24x7), Blood Bank, Physiotherapy
- Departments: Cardiology, Orthopedics, Radiology, Pathology, General Medicine, Pediatrics, Gynaecology, Emergency Care
- OPD Hours: Mon–Sat, 9:00 AM – 7:00 PM
- Emergency: 24x7
- Lab: 7:00 AM – 8:00 PM
- Consultation fees: General OPD ₹200–₹400, Specialist ₹400–₹800

Rules:
1. For emergencies (chest pain, difficulty breathing, severe bleeding, unconsciousness, stroke, heart attack), immediately urge them to call 9263403905 or visit the Emergency Department.
2. Never provide a medical diagnosis. Give general educational information and always recommend consulting a doctor.
3. Keep every reply SHORT — 1 to 3 sentences max. Be direct and conversational, not exhaustive.
4. Never use bullet lists or headers. Answer the specific question only.
5. If you cannot find specific information, say so in one sentence and give the phone number 9263403905.
6. Do not repeat the same fallback message. Ask a specific follow-up question to better understand the user's need.`;

// Rate limit: 20 chat messages per IP per 10 minutes
app.post('/api/chat', rateLimit(20, 10 * 60 * 1000), async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }
  if (message.length > 500) {
    return res.status(400).json({ error: 'Message is too long (max 500 characters)' });
  }

  // Sanitise history: only allow user/assistant roles, cap content length
  const safeHistory = Array.isArray(history)
    ? history
        .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .map(m => ({ role: m.role, content: m.content.slice(0, 1000) }))
        .slice(-10)
    : [];

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...safeHistory,
      { role: 'user', content: message }
    ];

    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages,
      max_tokens: 120,
      temperature: 0.7
    });

    const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that. Please call us at 9263403905.";
    res.json({ reply });
  } catch (err) {
    console.error('[AI] Chat error:', err.message);
    res.status(500).json({ error: 'AI service unavailable. Please call us at 9263403905.' });
  }
});

// ── Auth middleware ────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  if (req.session && req.session.adminLoggedIn) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// ── Public: book appointment ───────────────────────────────────────────────
// Rate limit: 5 submissions per IP per 15 minutes
app.post('/api/appointments', rateLimit(5, 15 * 60 * 1000), async (req, res) => {
  const { fullName, phone, email, department, date, time, message } = req.body;
  if (!fullName || !phone || !email || !department || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (typeof fullName !== 'string' || fullName.trim().length > 120) {
    return res.status(400).json({ error: 'Invalid name' });
  }
  if (!/^[0-9]{10}$/.test(phone.replace(/\s/g, ''))) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO appointments (full_name, phone, email, department, appointment_date, appointment_time, message, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending') RETURNING *`,
      [fullName.trim().slice(0, 120), phone.trim().slice(0, 20), email.trim().slice(0, 254), department, date, time, (message || '').toString().trim().slice(0, 500)]
    );
    const appt = result.rows[0];
    sendAdminEmail(appt);
    res.json({ success: true, id: appt.id });
  } catch (err) {
    console.error('[DB] Insert error:', err.message);
    res.status(500).json({ error: 'Failed to save appointment. Please try again.' });
  }
});

// ── Public: check appointment status ──────────────────────────────────────
app.get('/api/appointments/status/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid appointment ID' });
  }
  try {
    const result = await pool.query(
      `SELECT id, full_name, department, appointment_date, appointment_time, status
       FROM appointments WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No appointment found with that ID' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[DB] Status check error:', err.message);
    res.status(500).json({ error: 'Database error. Please try again.' });
  }
});

// ── Admin: login / logout ─────────────────────────────────────────────────
// Rate limit: 10 attempts per IP per 15 minutes
app.post('/api/admin/login', rateLimit(10, 15 * 60 * 1000), (req, res) => {
  const { password } = req.body;
  const adminPass = process.env.ADMIN_PASSWORD;
  if (!adminPass) {
    return res.status(503).json({ error: 'Admin login is not configured on the server.' });
  }
  if (typeof password !== 'string' || !password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  // Constant-time comparison to prevent timing attacks
  const given  = Buffer.from(password);
  const stored = Buffer.from(adminPass);
  const match  = given.length === stored.length && crypto.timingSafeEqual(given, stored);
  if (match) {
    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ error: 'Session error' });
      req.session.adminLoggedIn = true;
      res.json({ success: true });
    });
  } else {
    res.status(401).json({ error: 'Incorrect password' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

app.get('/api/admin/check', requireAdmin, (req, res) => {
  res.json({ loggedIn: true });
});

// ── Admin: get appointments ────────────────────────────────────────────────
app.get('/api/admin/appointments', requireAdmin, async (req, res) => {
  const { search, department, date, status } = req.query;

  const conditions = [];
  const params = [];

  if (search) {
    params.push(`%${search.trim().slice(0, 100)}%`);
    const i = params.length;
    conditions.push(`(full_name ILIKE $${i} OR email ILIKE $${i} OR phone ILIKE $${i})`);
  }
  if (department) {
    params.push(department);
    conditions.push(`department = $${params.length}`);
  }
  if (date) {
    params.push(date);
    conditions.push(`appointment_date = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const sql = `SELECT * FROM appointments ${where} ORDER BY created_at DESC`;

  try {
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('[DB] Query error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// ── Admin: update status ──────────────────────────────────────────────────
const ALLOWED_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

app.patch('/api/admin/appointments/:id', requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ID' });
  if (!ALLOWED_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  try {
    await pool.query('UPDATE appointments SET status = $1 WHERE id = $2', [status, id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[DB] Update error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// ── Public: get updates ───────────────────────────────────────────────────
app.get('/api/updates', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, body, created_at FROM hospital_updates ORDER BY created_at DESC LIMIT 20'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[DB] Updates fetch error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// ── Admin: create update ──────────────────────────────────────────────────
app.post('/api/admin/updates', requireAdmin, async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Title and body are required' });
  try {
    const result = await pool.query(
      'INSERT INTO hospital_updates (title, body) VALUES ($1, $2) RETURNING *',
      [title.trim().slice(0, 120), body.trim().slice(0, 500)]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[DB] Update insert error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// ── Admin: delete update ──────────────────────────────────────────────────
app.delete('/api/admin/updates/:id', requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ID' });
  try {
    await pool.query('DELETE FROM hospital_updates WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[DB] Update delete error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// ── Admin: stats ──────────────────────────────────────────────────────────
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'Pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'Confirmed') AS confirmed,
        COUNT(*) FILTER (WHERE status = 'Completed') AS completed,
        COUNT(*) FILTER (WHERE status = 'Cancelled') AS cancelled
      FROM appointments
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ── Serve admin page ──────────────────────────────────────────────────────
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// ── DB init ───────────────────────────────────────────────────────────────
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS appointments (
      id               SERIAL PRIMARY KEY,
      full_name        VARCHAR(120) NOT NULL,
      phone            VARCHAR(20)  NOT NULL,
      email            VARCHAR(254) NOT NULL,
      department       VARCHAR(100) NOT NULL,
      appointment_date DATE         NOT NULL,
      appointment_time TIME         NOT NULL,
      message          TEXT         DEFAULT '',
      status           VARCHAR(50)  DEFAULT 'Pending',
      created_at       TIMESTAMP    DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hospital_updates (
      id         SERIAL PRIMARY KEY,
      title      VARCHAR(120) NOT NULL,
      body       VARCHAR(500) NOT NULL,
      created_at TIMESTAMP    DEFAULT NOW()
    )
  `);
  console.log('[DB] appointments + hospital_updates tables ready');
}

app.listen(PORT, '0.0.0.0', async () => {
  await initDB();
  console.log(`[Server] Wangduk Health running on port ${PORT}`);
});
