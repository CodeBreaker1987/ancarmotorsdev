// add_order.js
import pkg from "pg";
const { Pool } = pkg;

// PostgreSQL connection
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
    const data = JSON.parse(event.body);

    // Extract only order-related fields
    const {
      userId,
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
    } = data;

    if (!userId || !truck_model) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

if (shipping_option === "date" && !data.shippingDate) {
  alert("Please select a shipping date.");
  return;
}


    // Insert order into database
    const insertQuery = `
      INSERT INTO public.orders (
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
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14
      ) RETURNING *;
    `;

    const values = [
      userId,
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
    ];

    const result = await pool.query(insertQuery, values);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        order: result.rows[0],
      }),
    };
  } catch (error) {
    console.error("Add order error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to insert order" }),
    };
  }
}
