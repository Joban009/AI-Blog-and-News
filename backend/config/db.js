import mysql from "mysql2/promise";

function envTrim(key, fallback = "") {
  const v = process.env[key];
  if (v === undefined || v === null) return fallback;
  return String(v).trim();
}

const pool = mysql.createPool({
  host: envTrim("DB_HOST", "localhost") || "localhost",
  port: Number(envTrim("DB_PORT", "3306")) || 3306,
  database: envTrim("DB_NAME", "ai_blog_db") || "ai_blog_db",
  user: envTrim("DB_USER", "root") || "root",
  password: envTrim("DB_PASSWORD", ""),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
});

export default pool;
