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
  // Accept both POST (for month filter) and GET (for pagination)
  if (!["POST", "GET"].includes(event.httpMethod)) {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  let month;
  const { page = 1, limit = 10 } = event.queryStringParameters || {};
  const offset = (page - 1) * limit;

  try {
    if (event.body) {
      const body = JSON.parse(event.body);
      month = body.month; // "YYYY-MM"
    }
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request body" }),
    };
  }

  // Modified query to include payment_status and calculate totals
  let query = `
    WITH OrdersData AS (
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
        o.payment_status,
        c.first_name,
        c.last_name,
        c.home_address,
        c.email_address,
        c.phone_number,
        COUNT(*) OVER() as total_count,
        SUM(CASE 
          WHEN o.status IN ('Pending', 'Processing') 
          AND o.payment_status = 'pending' 
          THEN o.total_price 
          ELSE 0 
        END) OVER() as pending_total
      FROM public.orders o
      JOIN public.customers c ON o.userid = c.userid
      ${month ? "WHERE TO_CHAR(o.order_timestamp, 'YYYY-MM') = $1" : ""}
      ORDER BY o.order_timestamp DESC
      LIMIT $${month ? '2' : '1'} OFFSET $${month ? '3' : '2'}
    )
    SELECT 
      *,
      total_count,
      pending_total
    FROM OrdersData
  `;

  const params = month 
    ? [month, limit, offset]
    : [limit, offset];

  try {
    const result = await pool.query(query, params);
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
    console.error("get_all_orders error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch orders", details: err.message }),
    };
  }
}