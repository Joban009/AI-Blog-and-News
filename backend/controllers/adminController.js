import pool from '../config/db.js';

// GET /api/admin/dashboard
export async function getDashboard(req, res, next) {
  try {
    const [[{ total_posts }]]    = await pool.query('SELECT COUNT(*) AS total_posts FROM posts');
    const [[{ published }]]      = await pool.query("SELECT COUNT(*) AS published FROM posts WHERE status='published'");
    const [[{ pending_posts }]]  = await pool.query("SELECT COUNT(*) AS pending_posts FROM posts WHERE status='pending'");
    const [[{ total_comments }]] = await pool.query('SELECT COUNT(*) AS total_comments FROM comments');
    const [[{ pending_comments }]] = await pool.query("SELECT COUNT(*) AS pending_comments FROM comments WHERE status='pending'");
    const [[{ total_users }]]    = await pool.query('SELECT COUNT(*) AS total_users FROM users');

    const [recent_posts] = await pool.query(
      `SELECT p.id, p.title, p.status, p.type, p.created_at, u.username AS author
       FROM posts p JOIN users u ON u.id = p.author_id
       ORDER BY p.created_at DESC LIMIT 5`
    );

    res.json({
      stats: { total_posts, published, pending_posts, total_comments, pending_comments, total_users },
      recent_posts,
    });
  } catch (err) { next(err); }
}

// GET /api/admin/posts?status=pending
export async function adminListPosts(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let where = '1=1';
    if (status) { where += ' AND p.status = ?'; params.push(status); }

    const [posts] = await pool.query(
      `SELECT p.id, p.title, p.slug, p.type, p.status, p.views,
              p.is_ai_generated, p.created_at, p.published_at,
              u.username AS author, c.name AS category
       FROM posts p
       JOIN users u ON u.id = p.author_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE ${where}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    res.json({ posts });
  } catch (err) { next(err); }
}

// GET /api/admin/comments?status=pending
export async function adminListComments(req, res, next) {
  try {
    const { status } = req.query;
    const params = [];
    let where = '1=1';
    if (status) { where += ' AND c.status = ?'; params.push(status); }

    const [comments] = await pool.query(
      `SELECT c.id, c.content, c.status, c.created_at,
              u.username AS author,
              p.title AS post_title, p.slug AS post_slug
       FROM comments c
       JOIN users u ON u.id = c.author_id
       JOIN posts p ON p.id = c.post_id
       WHERE ${where}
       ORDER BY c.created_at DESC`,
      params
    );

    res.json({ comments });
  } catch (err) { next(err); }
}

// GET /api/admin/users
export async function listUsers(req, res, next) {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.username, u.email, u.is_active, u.created_at,
              r.name AS role
       FROM users u JOIN roles r ON r.id = u.role_id
       ORDER BY u.created_at DESC`
    );
    res.json({ users });
  } catch (err) { next(err); }
}

// PATCH /api/admin/users/:id
export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { role, is_active } = req.body;

    if (role) {
      const [[r]] = await pool.query('SELECT id FROM roles WHERE name = ?', [role]);
      if (!r) return res.status(400).json({ error: 'Invalid role' });
      await pool.query('UPDATE users SET role_id = ? WHERE id = ?', [r.id, id]);
    }
    if (is_active !== undefined)
      await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [is_active, id]);

    res.json({ message: 'User updated' });
  } catch (err) { next(err); }
}
