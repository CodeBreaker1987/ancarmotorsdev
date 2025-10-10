// netlify/functions/get_owner_info.js
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
    const { company_position } = JSON.parse(event.body || "{}");

    // Optional: validate the position field
    if (!company_position) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: "Missing company_position" }),
      };
    }

    const query = `
      SELECT * FROM public.admins
      WHERE LOWER(company_position) = LOWER($1)
      LIMIT 1;
    `;

    const result = await pool.query(query, [company_position]);

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ success: false, message: "Owner not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: result.rows[0] }),
    };
  } catch (err) {
    console.error("❌ get_owner_info error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "Server error" }),
    };
  }
};
