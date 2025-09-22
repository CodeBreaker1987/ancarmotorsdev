// functions/cancel_order.js
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
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { orderID, userId } = JSON.parse(event.body || "{}");

    if (!orderID || !userId) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing orderID or userId" }),
      };
    }

    // Check order exists and belongs to user
    const checkQuery = `
      SELECT status
      FROM public.orders
      WHERE orderid = $1 AND userid = $2
    `;
    const checkResult = await pool.query(checkQuery, [orderID, userId]);

    if (checkResult.rows.length === 0) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Order not found for this user" }),
      };
    }

    if (!["Pending", "Processing", "Awaiting Shipment", "Shipped", "Out for Delivery"].includes(checkResult.rows[0].status)) {
  return {
    statusCode: 400,
    body: JSON.stringify({ error: "Only active, pending or processing orders can be cancelled" }),
  };
}

    // Cancel the order
    const updateQuery = `
      UPDATE public.orders
      SET status = 'Canceled'
      WHERE orderid = $1
    `;
    await pool.query(updateQuery, [orderID]);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: `Order ${orderID} cancelled successfully` }),
    };
  } catch (err) {
    console.error("cancel_order error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Server error: " + err.message }),
    };
  }
}
