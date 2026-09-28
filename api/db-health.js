const { Pool } = require("pg");

let pool;
function database() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");
  pool ||= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false },
  });
  return pool;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  try {
    await database().query("SELECT 1 AS ok");
    return res.status(200).json({ ok: true, message: "Supabase PostgreSQL đã kết nối qua Vercel." });
  } catch (error) {
    console.error("DB_HEALTH_ERROR", error);
    return res.status(500).json({ ok: false, message: "Vercel đã chạy API nhưng chưa kết nối được Supabase PostgreSQL.", detail: error.message });
  }
};
