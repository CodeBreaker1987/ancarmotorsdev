import pkg from "pg";
const { Pool } = pkg;

// 🧩 PostgreSQL connection setup
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
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const data = JSON.parse(event.body || "{}");
    console.log("🛰️ Received order data:", JSON.stringify(data, null, 2));
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
      shippingDate,
      payment_method,
      status,
      payment_status,
      transaction_number, // new
    } = data;

    // 🧩 Validate required fields
    if (!userId || !username || !truck_model || !total_price) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required user or truck data" }),
      };
    }

    // 🧾 Prepare SQL Insert Statement (include transaction_number)
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
        status,
        payment_status,
        transaction_number
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
      )
      RETURNING orderid;
    `;

    const values = [
      userId,
      username,
      truck_model,
      body_color || null,
      payload_capacity || null,
      towing_capacity || null,
      lifting_capacity || null,
      transmission || null,
      quantity || 1,
      base_price || 0,
      total_price,
      shipping_option === "date" ? shippingDate : shipping_option || "Standard",
      payment_method || "Bank",
      status || "Pending",
      payment_status || "pending",
      transaction_number || null,
    ];

    const result = await pool.query(insertQuery, values);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Order created successfully",
        orderId: result.rows[0]?.orderid || null,
      }),
    };
  } catch (error) {
    console.error("Add order error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to insert order",
        details: error.message,
      }),
    };
  }
}
