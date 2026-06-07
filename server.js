'use strict';

const express = require('express');
const { Pool } = require('pg');
const session = require('express-session');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'whr-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 8 * 60 * 60 * 1000 }
}));
app.use(express.static(path.join(__dirname)));

// ── Email ──────────────────────────────────────────────────────────────────
function sendAdminEmail(appointment) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const adminEmail = process.env.ADMIN_EMAIL || user;
  if (!user || !pass) {
    console.log('[Email] SMTP not configured — skipping notification');
    return;
  }
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
  const { id, full_name, phone, email, department, appointment_date, appointment_time, message } = appointment;
  const dateStr = new Date(appointment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  transporter.sendMail({
    from: `"Wangduk Health" <${user}>`,
    to: adminEmail,
    subject: `📋 New Appointment #${id} — ${full_name}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#1e3a6e,#2563eb);padding:24px;color:#fff">
          <h2 style="margin:0;font-size:20px">New Appointment Request</h2>
          <p style="margin:4px 0 0;opacity:.85;font-size:13px">Wangduk Health and Research — Admin Notification</p>
        </div>
        <div style="padding:24px">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#64748b;width:140px">Appointment ID</td><td style="padding:8px 0;font-weight:600">#${id}</td></tr>
            <tr style="background:#f8fafc"><td style="padding:8px 4px;color:#64748b">Patient Name</td><td style="padding:8px 4px;font-weight:600">${full_name}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Phone</td><td style="padding:8px 0">${phone}</td></tr>
            <tr style="background:#f8fafc"><td style="padding:8px 4px;color:#64748b">Email</td><td style="padding:8px 4px">${email}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Department</td><td style="padding:8px 0">${department}</td></tr>
            <tr style="background:#f8fafc"><td style="padding:8px 4px;color:#64748b">Date</td><td style="padding:8px 4px">${dateStr}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Time</td><td style="padding:8px 0">${appointment_time}</td></tr>
            ${message ? `<tr style="background:#f8fafc"><td style="padding:8px 4px;color:#64748b">Notes</td><td style="padding:8px 4px">${message}</td></tr>` : ''}
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

// ── Auth middleware ────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  if (req.session && req.session.adminLoggedIn) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// ── Public: book appointment ───────────────────────────────────────────────
app.post('/api/appointments', async (req, res) => {
  const { fullName, phone, email, department, date, time, message } = req.body;
  if (!fullName || !phone || !email || !department || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!/^[0-9]{10}$/.test(phone.replace(/\s/g, ''))) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO appointments (full_name, phone, email, department, appointment_date, appointment_time, message, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending') RETURNING *`,
      [fullName.trim(), phone.trim(), email.trim(), department, date, time, (message || '').trim()]
    );
    const appt = result.rows[0];
    sendAdminEmail(appt);
    res.json({ success: true, id: appt.id });
  } catch (err) {
    console.error('[DB] Insert error:', err.message);
    res.status(500).json({ error: 'Failed to save appointment. Please try again.' });
  }
});

// ── Admin: login / logout ─────────────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPass = process.env.ADMIN_PASSWORD || 'wangduk@admin';
  if (password === adminPass) {
    req.session.adminLoggedIn = true;
    res.json({ success: true });
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
    params.push(`%${search.trim()}%`);
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
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid ID' });
  if (!ALLOWED_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  try {
    await pool.query('UPDATE appointments SET status = $1 WHERE id = $2', [status, id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[DB] Update error:', err.message);
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
      full_name        VARCHAR(255) NOT NULL,
      phone            VARCHAR(20)  NOT NULL,
      email            VARCHAR(255) NOT NULL,
      department       VARCHAR(100) NOT NULL,
      appointment_date DATE         NOT NULL,
      appointment_time TIME         NOT NULL,
      message          TEXT         DEFAULT '',
      status           VARCHAR(50)  DEFAULT 'Pending',
      created_at       TIMESTAMP    DEFAULT NOW()
    )
  `);
  console.log('[DB] appointments table ready');
}

app.listen(PORT, '0.0.0.0', async () => {
  await initDB();
  console.log(`[Server] Wangduk Health running on port ${PORT}`);
});
