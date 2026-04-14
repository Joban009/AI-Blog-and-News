import './load-env.js';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'ai_blog_db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
});

try {
  const [rows] = await pool.query(
    'SELECT u.id, u.email, u.password_hash, u.role_id, u.is_active, r.name AS role_name FROM users u JOIN roles r ON r.id = u.role_id WHERE u.email = ? AND u.is_active = 1',
    ['admin@ainewsblog.com']
  );
  const user = rows[0];
  console.log('User found:', user ? 'yes' : 'no');
  if (user) {
    console.log('  role_name:', user.role_name);
    console.log('  is_active:', user.is_active);
    const match = await bcrypt.compare('Admin@1234', user.password_hash);
    console.log('  Password matches "Admin@1234":', match);
  } else {
    // List all users
    const [all] = await pool.query('SELECT id, email, username, role_id, is_active FROM users');
    console.log('All users in DB:', JSON.stringify(all, null, 2));
  }
} catch(e) {
  console.error('Error:', e.message);
  console.error('Code:', e.code);
}

await pool.end();
