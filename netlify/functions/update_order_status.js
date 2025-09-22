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
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { orderId, status } = JSON.parse(event.body);

    if (!orderId || !status) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing orderId or status" }),
      };
    }

    const queryText = `
      UPDATE public.orders
      SET status = $1
      WHERE orderid = $2
      RETURNING *;
    `;

    const { rows } = await pool.query(queryText, [status, orderId]);

    if (rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Order not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, order: rows[0] }),
    };
  } catch (err) {
    console.error("update order status error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
}
