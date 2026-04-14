import bcrypt    from 'bcrypt';
import jwt       from 'jsonwebtoken';
import pool      from '../config/db.js';

const SALT_ROUNDS = 12;

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role_name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register
export async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    if (existing.length)
      return res.status(409).json({ error: 'Email or username already taken' });

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, password_hash]
    );

    const [[user]] = await pool.query(
      `SELECT u.*, r.name AS role_name
       FROM users u JOIN roles r ON r.id = u.role_id
       WHERE u.id = ?`,
      [result.insertId]
    );

    const token = signToken(user);
    res.status(201).json({ token, user: sanitize(user) });
  } catch (err) { next(err); }
}

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const [[user]] = await pool.query(
      `SELECT u.*, r.name AS role_name
       FROM users u JOIN roles r ON r.id = u.role_id
       WHERE u.email = ? AND u.is_active = 1`,
      [email]
    );
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ token, user: sanitize(user) });
  } catch (err) { next(err); }
}

// GET /api/auth/me
export async function me(req, res, next) {
  try {
    const [[user]] = await pool.query(
      `SELECT u.*, r.name AS role_name
       FROM users u JOIN roles r ON r.id = u.role_id
       WHERE u.id = ?`,
      [req.user.id]
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: sanitize(user) });
  } catch (err) { next(err); }
}

function sanitize(u) {
  const { password_hash, ...safe } = u;
  return safe;
}
