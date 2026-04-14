import pool from '../config/db.js';

// GET /api/comments?post_id=:id
export async function listComments(req, res, next) {
  try {
    const { post_id } = req.query;
    if (!post_id) return res.status(400).json({ error: 'post_id required' });

    const isAdmin = req.user?.role === 'admin';
    const statusFilter = isAdmin ? '' : "AND c.status = 'approved'";

    const [comments] = await pool.query(
      `SELECT c.id, c.content, c.status, c.parent_id, c.created_at,
              u.id AS author_id, u.username AS author, u.avatar_url AS author_avatar
       FROM comments c
       JOIN users u ON u.id = c.author_id
       WHERE c.post_id = ? ${statusFilter}
       ORDER BY c.created_at ASC`,
      [post_id]
    );

    res.json({ comments });
  } catch (err) { next(err); }
}

// POST /api/comments
export async function createComment(req, res, next) {
  try {
    const { post_id, content, parent_id } = req.body;

    // Ensure post exists and is published
    const [[post]] = await pool.query(
      "SELECT id FROM posts WHERE id = ? AND status = 'published'",
      [post_id]
    );
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const [result] = await pool.query(
      'INSERT INTO comments (post_id, author_id, content, parent_id) VALUES (?, ?, ?, ?)',
      [post_id, req.user.id, content, parent_id || null]
    );

    res.status(201).json({
      message: 'Comment submitted for review',
      commentId: result.insertId,
    });
  } catch (err) { next(err); }
}

// DELETE /api/comments/:id  (owner or admin)
export async function deleteComment(req, res, next) {
  try {
    const { id } = req.params;
    const [[comment]] = await pool.query('SELECT * FROM comments WHERE id = ?', [id]);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && comment.author_id !== req.user.id)
      return res.status(403).json({ error: 'Forbidden' });

    await pool.query('DELETE FROM comments WHERE id = ?', [id]);
    res.json({ message: 'Comment deleted' });
  } catch (err) { next(err); }
}

// PATCH /api/comments/:id/approve  (admin)
export async function approveComment(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query(
      "UPDATE comments SET status='approved', moderated_by=?, moderated_at=NOW() WHERE id=?",
      [req.user.id, id]
    );
    res.json({ message: 'Comment approved' });
  } catch (err) { next(err); }
}

// PATCH /api/comments/:id/reject  (admin)
export async function rejectComment(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query(
      "UPDATE comments SET status='rejected', moderated_by=?, moderated_at=NOW() WHERE id=?",
      [req.user.id, id]
    );
    res.json({ message: 'Comment rejected' });
  } catch (err) { next(err); }
}
