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

  let month;
  try {
    const body = JSON.parse(event.body);
    month = body.month; // "YYYY-MM"
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request body" }),
    };
  }

  // Join orders and customers, filter by month if provided
  let query = `
    SELECT
      o.orderid,
      o.order_timestamp,
      o.userid,
      o.username,
      o.truck_model,
      o.body_color,
      o.payload_capacity,
      o.towing_capacity,
      o.lifting_capacity,
      o.transmission,
      o.quantity,
      o.base_price,
      o.total_price,
      o.shipping_option,
      o.payment_method,
      o.status,
      c.first_name,
      c.last_name,
      c.home_address,
      c.email_address,
      c.phone_number
    FROM public.orders o
    JOIN public.customers c ON o.userid = c.userid
  `;

  const params = [];
  if (month) {
    query += ` WHERE TO_CHAR(o.order_timestamp, 'YYYY-MM') = $1`;
    params.push(month);
  }
  query += ` ORDER BY o.order_timestamp DESC`;

  try {
    const result = await pool.query(query, params);
    return {
      statusCode: 200,
      body: JSON.stringify({ orders: result.rows }),
    };
  } catch (err) {
    console.error("get_all_orders error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch orders", details: err.message }),
    };
  }
}