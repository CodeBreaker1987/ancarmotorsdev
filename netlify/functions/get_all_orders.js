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
  let statusFilter = [];

  try {
    if (event.body) {
      const body = JSON.parse(event.body);
      month = body.month; // "YYYY-MM"
      if (Array.isArray(body.statusFilter)) {
        statusFilter = body.statusFilter;
      }
    }
  } catch (err) {
    console.error("Error parsing request body:", err);
    return {
      statusCode: 400, 
      body: JSON.stringify({ error: "Invalid request body", details: err.message }),
    };
  }

  // Modified query to include payment_status, transaction_number and calculate totals
  let query = `
    WITH OrdersData AS (
      SELECT
        o.orderid,
        o.transaction_number,
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
          WHEN o.status IN ('Pending', 'Processing', 'Awaiting Shipment', 'Shipped', 'Out for Delivery')
          THEN o.total_price 
          ELSE 0 
        END) OVER() as active_pending_total,
        SUM(CASE 
          WHEN o.status = 'Completed'
          THEN o.total_price 
          ELSE 0 
        END) OVER() as completed_total,
        SUM(CASE 
          WHEN o.status = 'Canceled'
          THEN o.total_price 
          ELSE 0 
        END) OVER() as canceled_total,
        SUM(CASE 
          WHEN o.status = 'Returned'
          THEN o.total_price 
          ELSE 0 
        END) OVER() as returned_total
      FROM public.orders o
      LEFT JOIN public.customers c ON o.userid = c.userid
      WHERE 1=1
      ${month ? "AND TO_CHAR(o.order_timestamp, 'YYYY-MM') = $1" : ""}
      ${statusFilter.length > 0 ? `AND o.status = ANY($${month ? '4' : '3'})` : ""}
      ORDER BY o.order_timestamp DESC
      LIMIT $${month ? '2' : '1'} OFFSET $${month ? '3' : '2'}
    )
    SELECT 
      *,
      total_count,
      active_pending_total,
      completed_total,
      canceled_total,
      returned_total
    FROM OrdersData
  `;

  let params = [];
  if (month && statusFilter.length > 0) {
    params = [month, limit, offset, statusFilter.map(s => String(s))];
  } else if (month) {
    params = [month, limit, offset];
  } else if (statusFilter.length > 0) {
    params = [limit, offset, statusFilter.map(s => String(s))];
  } else {
    params = [limit, offset];
  }

  // Debug log the params
  console.log('Query parameters:', {
    month,
    statusFilter,
    limit,
    offset,
    params,
    hasMonth: !!month,
    filterLength: statusFilter.length
  });

  try {
    console.log("Executing query with params:", JSON.stringify({
      month,
      statusFilter,
      limit,
      offset,
      paramArray: params
    }));

    const result = await pool.query(query, params);
    
    if (!result.rows || result.rows.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          orders: [],
          totalCount: 0,
          activePendingTotal: 0,
          completedTotal: 0,
          canceledTotal: 0,
          returnedTotal: 0,
          totalPages: 0,
          currentPage: parseInt(page),
        }),
      };
    }

    const firstRow = result.rows[0];
    return {
      statusCode: 200,
      body: JSON.stringify({
        orders: result.rows,
        totalCount: firstRow.total_count || 0,
        activePendingTotal: firstRow.active_pending_total || 0,
        completedTotal: firstRow.completed_total || 0,
        canceledTotal: firstRow.canceled_total || 0,
        returnedTotal: firstRow.returned_total || 0,
        totalPages: Math.ceil((firstRow.total_count || 0) / limit),
        currentPage: parseInt(page),
      }),
    };
  } catch (err) {
    console.error("get_all_orders error:", err);
    // Ensure we're always returning a properly formatted error response
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to fetch orders",
        details: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      }),
    };
  }
}