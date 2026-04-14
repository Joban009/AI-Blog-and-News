import pool    from '../config/db.js';
import slugify from 'slugify';

// ── Helpers ───────────────────────────────────────────────
function makeSlug(title) {
  return slugify(title, { lower: true, strict: true }) +
    '-' + Date.now().toString(36);
}

// ── GET /api/posts  (public — published only) ─────────────
export async function listPosts(req, res, next) {
  try {
    const { type, category, page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let where = "p.status = 'published'";

    if (type)     { where += ' AND p.type = ?';               params.push(type); }
    if (category) { where += ' AND c.slug = ?';               params.push(category); }
    if (search)   { where += ' AND MATCH(p.title,p.excerpt,p.content) AGAINST(? IN BOOLEAN MODE)';
                    params.push(search + '*'); }

    const [posts] = await pool.query(
      `SELECT p.id, p.title, p.slug, p.excerpt, p.cover_image_url,
              p.type, p.views, p.published_at, p.is_ai_generated,
              u.username AS author, u.avatar_url AS author_avatar,
              c.name AS category, c.slug AS category_slug,
              (SELECT COUNT(*) FROM comments cm WHERE cm.post_id = p.id AND cm.status='approved') AS comment_count
       FROM posts p
       JOIN users u ON u.id = p.author_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE ${where}
       ORDER BY p.published_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM posts p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE ${where}`,
      params
    );

    res.json({ posts, total, page: Number(page), limit: Number(limit) });
  } catch (err) { next(err); }
}

// ── GET /api/posts/:slug  (public) ────────────────────────
export async function getPost(req, res, next) {
  try {
    const { slug } = req.params;
    const [[post]] = await pool.query(
      `SELECT p.*, u.username AS author, u.avatar_url AS author_avatar,
              u.bio AS author_bio, c.name AS category, c.slug AS category_slug,
              admin.username AS moderated_by_name
       FROM posts p
       JOIN users u ON u.id = p.author_id
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN users admin ON admin.id = p.moderated_by
       WHERE p.slug = ?`,
      [slug]
    );
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Only published posts visible to non-admins
    const isAdmin = req.user?.role === 'admin';
    if (post.status !== 'published' && !isAdmin && post.author_id !== req.user?.id)
      return res.status(403).json({ error: 'Post not available' });

    // Increment views
    if (post.status === 'published')
      await pool.query('UPDATE posts SET views = views + 1 WHERE id = ?', [post.id]);

    // Fetch tags
    const [tags] = await pool.query(
      `SELECT t.name, t.slug FROM tags t
       JOIN post_tags pt ON pt.tag_id = t.id
       WHERE pt.post_id = ?`,
      [post.id]
    );

    res.json({ post: { ...post, tags } });
  } catch (err) { next(err); }
}

// ── POST /api/posts  (authenticated) ─────────────────────
export async function createPost(req, res, next) {
  try {
    const { title, content, excerpt, cover_image_url, type = 'blog',
            category_id, tags = [], ai_prompt } = req.body;
    const isAdmin = req.user.role === 'admin';
    const status  = isAdmin ? 'draft' : 'pending';
    const slug    = makeSlug(title);

    const [result] = await pool.query(
      `INSERT INTO posts
       (author_id, category_id, title, slug, excerpt, content,
        cover_image_url, type, status, is_ai_generated, ai_prompt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, category_id || null, title, slug, excerpt || null,
       content, cover_image_url || null, type, status,
       !!ai_prompt, ai_prompt || null]
    );

    // Attach tags
    if (tags.length) {
      for (const tagName of tags) {
        const slug_t = slugify(tagName, { lower: true, strict: true });
        await pool.query(
          'INSERT IGNORE INTO tags (name, slug) VALUES (?, ?)', [tagName, slug_t]
        );
        const [[tag]] = await pool.query('SELECT id FROM tags WHERE slug = ?', [slug_t]);
        await pool.query(
          'INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)',
          [result.insertId, tag.id]
        );
      }
    }

    res.status(201).json({ message: isAdmin ? 'Draft created' : 'Post submitted for review', slug });
  } catch (err) { next(err); }
}

// ── PUT /api/posts/:id  (owner or admin) ──────────────────
export async function updatePost(req, res, next) {
  try {
    const { id } = req.params;
    const [[post]] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && post.author_id !== req.user.id)
      return res.status(403).json({ error: 'Forbidden' });

    const { title, content, excerpt, cover_image_url, type, category_id } = req.body;
    const newSlug = title !== post.title ? makeSlug(title) : post.slug;

    await pool.query(
      `UPDATE posts SET title=?, slug=?, content=?, excerpt=?, cover_image_url=?,
       type=?, category_id=?, updated_at=NOW() WHERE id=?`,
      [title ?? post.title, newSlug, content ?? post.content,
       excerpt ?? post.excerpt, cover_image_url ?? post.cover_image_url,
       type ?? post.type, category_id ?? post.category_id, id]
    );

    res.json({ message: 'Post updated', slug: newSlug });
  } catch (err) { next(err); }
}

// ── DELETE /api/posts/:id  (owner or admin) ───────────────
export async function deletePost(req, res, next) {
  try {
    const { id } = req.params;
    const [[post]] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && post.author_id !== req.user.id)
      return res.status(403).json({ error: 'Forbidden' });

    await pool.query('DELETE FROM posts WHERE id = ?', [id]);
    res.json({ message: 'Post deleted' });
  } catch (err) { next(err); }
}

// ── POST /api/posts/:id/publish  (admin) ──────────────────
export async function publishPost(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query(
      `UPDATE posts SET status='published', published_at=NOW(),
       moderated_by=?, moderated_at=NOW() WHERE id=?`,
      [req.user.id, id]
    );
    res.json({ message: 'Post published' });
  } catch (err) { next(err); }
}

// ── POST /api/posts/:id/reject  (admin) ───────────────────
export async function rejectPost(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    await pool.query(
      `UPDATE posts SET status='rejected', moderated_by=?,
       moderated_at=NOW(), rejection_reason=? WHERE id=?`,
      [req.user.id, reason || null, id]
    );
    res.json({ message: 'Post rejected' });
  } catch (err) { next(err); }
}
