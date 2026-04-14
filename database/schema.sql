-- ─────────────────────────────────────────────────────────
-- AI News Blog System — MySQL Schema
-- Run: mysql -u root -p < database/schema.sql
-- ─────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS ai_blog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ai_blog_db;

-- ── Roles ─────────────────────────────────────────────────
CREATE TABLE roles (
  id        TINYINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name      VARCHAR(20)       NOT NULL UNIQUE,  -- 'admin' | 'user' | 'guest'
  PRIMARY KEY (id)
);

INSERT INTO roles (name) VALUES ('admin'), ('user'), ('guest');

-- ── Users ─────────────────────────────────────────────────
CREATE TABLE users (
  id            INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  role_id       TINYINT UNSIGNED  NOT NULL DEFAULT 2,          -- default: user
  username      VARCHAR(50)       NOT NULL UNIQUE,
  email         VARCHAR(255)      NOT NULL UNIQUE,
  password_hash VARCHAR(255)      NOT NULL,
  avatar_url    VARCHAR(500)      NULL,
  bio           TEXT              NULL,
  is_active     BOOLEAN           NOT NULL DEFAULT TRUE,
  created_at    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- ── Categories ────────────────────────────────────────────
CREATE TABLE categories (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100)  NOT NULL UNIQUE,
  slug        VARCHAR(120)  NOT NULL UNIQUE,
  description TEXT          NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

INSERT INTO categories (name, slug) VALUES
  ('Technology', 'technology'),
  ('News',       'news'),
  ('Science',    'science'),
  ('Business',   'business'),
  ('Health',     'health'),
  ('World',      'world');

-- ── Tags ──────────────────────────────────────────────────
CREATE TABLE tags (
  id    INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name  VARCHAR(50)   NOT NULL UNIQUE,
  slug  VARCHAR(60)   NOT NULL UNIQUE,
  PRIMARY KEY (id)
);

-- ── Posts (blogs & news) ───────────────────────────────────
CREATE TABLE posts (
  id              INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  author_id       INT UNSIGNED      NOT NULL,
  category_id     INT UNSIGNED      NULL,
  title           VARCHAR(500)      NOT NULL,
  slug            VARCHAR(520)      NOT NULL UNIQUE,
  excerpt         TEXT              NULL,
  content         LONGTEXT          NOT NULL,
  cover_image_url VARCHAR(500)      NULL,
  type            ENUM('blog','news') NOT NULL DEFAULT 'blog',
  status          ENUM('draft','pending','published','rejected') NOT NULL DEFAULT 'draft',
  -- draft    = admin created, not published yet
  -- pending  = user submitted, awaiting admin approval
  -- published = live
  -- rejected  = rejected by admin
  is_ai_generated BOOLEAN           NOT NULL DEFAULT FALSE,
  ai_prompt       TEXT              NULL,       -- the prompt used to generate content
  views           INT UNSIGNED      NOT NULL DEFAULT 0,
  moderated_by    INT UNSIGNED      NULL,       -- admin who approved/rejected
  moderated_at    DATETIME          NULL,
  rejection_reason TEXT             NULL,
  published_at    DATETIME          NULL,
  created_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (author_id)    REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id)  REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (moderated_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status    (status),
  INDEX idx_type      (type),
  INDEX idx_author    (author_id),
  FULLTEXT INDEX ft_search (title, excerpt, content)
);

-- ── Post Tags (many-to-many) ───────────────────────────────
CREATE TABLE post_tags (
  post_id INT UNSIGNED NOT NULL,
  tag_id  INT UNSIGNED NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
);

-- ── Comments ───────────────────────────────────────────────
CREATE TABLE comments (
  id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  post_id      INT UNSIGNED  NOT NULL,
  author_id    INT UNSIGNED  NOT NULL,
  parent_id    INT UNSIGNED  NULL,           -- for threaded replies
  content      TEXT          NOT NULL,
  status       ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  moderated_by INT UNSIGNED  NULL,
  moderated_at DATETIME      NULL,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (post_id)      REFERENCES posts(id)    ON DELETE CASCADE,
  FOREIGN KEY (author_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (parent_id)    REFERENCES comments(id) ON DELETE SET NULL,
  FOREIGN KEY (moderated_by) REFERENCES users(id)    ON DELETE SET NULL,
  INDEX idx_post_status (post_id, status)
);

-- ── Refresh Tokens ────────────────────────────────────────
CREATE TABLE refresh_tokens (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED  NOT NULL,
  token_hash VARCHAR(255)  NOT NULL UNIQUE,
  expires_at DATETIME      NOT NULL,
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Seed: default admin user ───────────────────────────────
-- Password: Admin@1234  (change immediately in production!)
INSERT INTO users (role_id, username, email, password_hash) VALUES
  (1, 'admin', 'admin@ainewsblog.com',
   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj2cBFLtYGTi');
