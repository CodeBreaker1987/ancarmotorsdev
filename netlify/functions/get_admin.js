// netlify/functions/get_admin.js
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.NEON_HOST,
  user: process.env.NEON_USER,
  password: process.env.NEON_PASS,
  database: process.env.NEON_DB,
  port: 5432,
  ssl: { rejectUnauthorized: false },
});

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { username, password } = JSON.parse(event.body);

    const query = `
      SELECT * FROM public.admins
      WHERE username = $1 AND password = $2
      LIMIT 1;
    `;

    const result = await pool.query(query, [username, password]);

    if (result.rows.length === 0) {
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, message: "Invalid credentials" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: result.rows[0] }),
    };
  } catch (err) {
    console.error("❌ Admin login error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "Server error" }),
    };
  }
};
