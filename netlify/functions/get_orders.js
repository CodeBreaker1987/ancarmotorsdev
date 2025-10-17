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
  let userId, page = 1, limit = 10;
  if (event.httpMethod === "GET") {
    const params = event.queryStringParameters || {};
    userId = params.userid;
    page = parseInt(params.page) || 1;
    limit = parseInt(params.limit) || 10;
  } else if (event.httpMethod === "POST") {
    const parsed = JSON.parse(event.body);
    userId = parsed.userId;
    page = parsed.page || 1;
    limit = parsed.limit || 10;
  } else {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  console.log("Incoming request:", event);

  // Parse query parameters for pagination
  const offset = (page - 1) * limit;

  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing userId parameter" }),
    };
  }

  // Modified query to include payment_status and calculate totals
  const query = `
    WITH OrdersData AS (
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
        status,
        payment_status,
        COUNT(*) OVER() as total_count,
        SUM(CASE 
          WHEN status IN ('Pending', 'Processing') 
          AND payment_status = 'pending' 
          THEN total_price 
          ELSE 0 
        END) OVER() as pending_total
      FROM public.orders
      WHERE userid = $1
      ORDER BY order_timestamp DESC
      LIMIT $2 OFFSET $3
    )
    SELECT 
      *,
      total_count,
      pending_total
    FROM OrdersData
  `;

  try {
    const result = await pool.query(query, [userId, limit, offset]);
    const totalCount = result.rows[0]?.total_count || 0;
    const pendingTotal = result.rows[0]?.pending_total || 0;

    return {
      statusCode: 200,
      body: JSON.stringify({
        orders: result.rows,
        totalCount,
        pendingTotal,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: parseInt(page),
      }),
    };
  } catch (err) {
    console.error("Database query error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch orders", details: err.message }),
    };
  }
}
