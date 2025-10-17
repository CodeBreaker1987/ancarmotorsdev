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

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { orderId, status } = JSON.parse(event.body);
    
    if (!["pending", "paid", "continuous"].includes(status)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid status" })
      };
    }

    const updateQuery = `
      UPDATE public.orders 
      SET payment_status = $1
      WHERE orderid = $2
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [status, orderId]);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Payment status updated successfully",
        order: result.rows[0]
      })
    };

  } catch (error) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to update payment status" })
    };
  }
}