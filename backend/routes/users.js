import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/users/:username/posts  — public profile posts
router.get('/:username/posts', async (req, res, next) => {
  try {
    const { username } = req.params;
    const [[user]] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const [posts] = await pool.query(
      `SELECT p.id, p.title, p.slug, p.excerpt, p.type,
              p.cover_image_url, p.published_at, p.views,
              c.name AS category
       FROM posts p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.author_id = ? AND p.status = 'published'
       ORDER BY p.published_at DESC`,
      [user.id]
    );
    res.json({ posts });
  } catch (err) { next(err); }
});

// PATCH /api/users/me  — update own profile
router.patch('/me', authenticate, async (req, res, next) => {
  try {
    const { bio, avatar_url } = req.body;
    await pool.query(
      'UPDATE users SET bio = ?, avatar_url = ? WHERE id = ?',
      [bio ?? null, avatar_url ?? null, req.user.id]
    );
    res.json({ message: 'Profile updated' });
  } catch (err) { next(err); }
});

export default router;
