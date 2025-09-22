// functions/get_sales.js
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.NEON_HOST,
  database: process.env.NEON_DB,
  user: process.env.NEON_USER,
  password: process.env.NEON_PASS,
  port: 5432,
  ssl: { rejectUnauthorized: false },
});

export async function handler(event, context) {
  try {
    const { month } = event.queryStringParameters || {};
    const start = month + "-01";
    const end = month + "-31";

    const res = await pool.query(
      "SELECT * FROM public.orders WHERE created_at BETWEEN $1 AND $2",
      [start, end]
    );

    return {
      statusCode: 200,
      body: JSON.stringify(res.rows),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
