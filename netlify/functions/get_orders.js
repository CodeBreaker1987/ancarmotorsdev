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
    try {
      const parsed = JSON.parse(event.body || "{}");
      userId = parsed.userId || parsed.userid || parsed.userID;
      page = parsed.page || parsed.currentPage || 1;
      limit = parsed.limit || 10;
    } catch (e) {
      console.warn("Failed to parse POST body, falling back to query params", e);
    }
  } else {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  const offset = (page - 1) * limit;

  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing userId parameter" }),
    };
  }

  // Query page rows
  const listQuery = `
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
      payment_status
    FROM public.orders
    WHERE userid = $1
    ORDER BY order_timestamp DESC
    LIMIT $2 OFFSET $3
  `;

  // Aggregate totals across all matching orders (not limited by pagination)
  const totalsQuery = `
    SELECT
      COUNT(*)::int AS total_count,
      COALESCE(SUM(CASE WHEN status IN ('Pending','Processing') THEN total_price ELSE 0 END),0) AS active_pending_total,
      COALESCE(SUM(CASE WHEN status = 'Completed' THEN total_price ELSE 0 END),0) AS completed_total,
      COALESCE(SUM(CASE WHEN status = 'Canceled' THEN total_price ELSE 0 END),0) AS canceled_total
    FROM public.orders
    WHERE userid = $1
  `;

  try {
    const [listRes, totalsRes] = await Promise.all([
      pool.query(listQuery, [userId, limit, offset]),
      pool.query(totalsQuery, [userId]),
    ]);

    const orders = listRes.rows || [];
    const totalCount = Number(totalsRes.rows[0]?.total_count || 0);
    const activePendingTotal = Number(totalsRes.rows[0]?.active_pending_total || 0);
    const completedTotal = Number(totalsRes.rows[0]?.completed_total || 0);
    const canceledTotal = Number(totalsRes.rows[0]?.canceled_total || 0);

    return {
      statusCode: 200,
      body: JSON.stringify({
        orders,
        totalCount,
        activePendingTotal,
        completedTotal,
        canceledTotal,
        totalPages: totalCount > 0 ? Math.ceil(totalCount / limit) : 1,
        currentPage: Number(page),
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
