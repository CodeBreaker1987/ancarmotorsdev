// functions/get_orders.js
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
  console.log("Incoming request body:", event.body);

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing request body" }),
    };
  }

  let userId;
  try {
    const parsed = JSON.parse(event.body);
    userId = parsed.userId;

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing userId in request body" }),
      };
    }
  } catch (err) {
    console.error("JSON parse error:", err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON in request body" }),
    };
  }

  const query = `
    SELECT
      orderid,
      order_timestamp,
      userid,
      username,
      truck_model,
      body_color,
      payload_capacity,
      towing_capacity,
      lifting_capacity,
      transmission,
      quantity,
      base_price,
      total_price,
      shipping_option,
      payment_method,
      status
    FROM public.orders
    WHERE userid = $1
    ORDER BY order_timestamp DESC
  `;

  try {
    const result = await pool.query(query, [userId]);
    console.log("Orders fetched:", result.rowCount);
    return {
      statusCode: 200,
      body: JSON.stringify({ orders: result.rows }),
    };
  } catch (err) {
    console.error("Database query error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch orders", details: err.message }),
    };
  }
}
