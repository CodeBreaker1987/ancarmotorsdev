const { Pool } = require('pg');  // Change to CommonJS import

const pool = new Pool({
  host: process.env.NEON_HOST,
  database: process.env.NEON_DB,
  user: process.env.NEON_USER,
  password: process.env.NEON_PASS,
  port: 5432,
  ssl: { rejectUnauthorized: false },
});

exports.handler = async (event, context) => {  // Change to CommonJS export
  // Add CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { orderid, status } = JSON.parse(event.body);

    if (!orderid || !status) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing orderid or status" }),
      };
    }

    // Fix SQL syntax error (remove trailing comma)
    const query = `
      UPDATE orders 
      SET status = $1
      WHERE orderid = $2 
      RETURNING *`;

    const result = await pool.query(query, [status, orderid]);

    if (result.rowCount === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "Order not found" }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.rows[0]),
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
    };
  }
};
