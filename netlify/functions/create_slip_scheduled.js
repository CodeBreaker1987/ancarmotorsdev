// create_slip_scheduled.js
import pkg from "pg";
import emailjs from "@emailjs/nodejs";
const { Pool } = pkg;

// ✅ Keep one pool instance (important for Netlify)
const pool = new Pool({
  host: process.env.NEON_HOST,
  database: process.env.NEON_DB,
  user: process.env.NEON_USER,
  password: process.env.NEON_PASS,
  port: 5432,
  ssl: { rejectUnauthorized: false },
});

// ✅ Initialize EmailJS securely
if (!process.env.EMAILJS_ANCAR_PUBLIC_KEY || !process.env.EMAILJS_ANCAR_PRIVATE_KEY) {
  console.warn("⚠️ Missing EmailJS credentials in environment variables.");
}

emailjs.init({
  publicKey: process.env.EMAILJS_ANCAR_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_ANCAR_PRIVATE_KEY,
});

export async function handler(event) {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { userid, statusGroup = "active" } = body;

    const activeStatuses = ["Pending", "Processing", "Awaiting Shipment", "Shipped", "Out for Delivery"];
    const closedStatuses = ["Completed", "Canceled", "Returned"];
    const statuses = statusGroup === "completed" ? closedStatuses : activeStatuses;

    console.log(`📧 Generating slip for ${userid || "ALL"} users [${statusGroup}]`);

    const ordersQuery = `
      SELECT 
        o.*, u.email_address, u.first_name, u.last_name,
        SUM(o.total_price) OVER (PARTITION BY o.userid) as total_amount
      FROM public.orders o
      JOIN public.customers u ON o.userid = u.userid
      WHERE o.status = ANY($1)
      ${userid ? "AND o.userid = $2" : ""}
      ORDER BY o.userid, o.orderid DESC;
    `;

    const result = await pool.query(ordersQuery, userid ? [statuses, userid] : [statuses]);
    if (result.rows.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ message: "No orders for this slip type" }) };
    }

    const userOrders = {};
    for (const order of result.rows) {
      if (!userOrders[order.userid]) {
        userOrders[order.userid] = {
          email: order.email_address,
          name: `${order.first_name} ${order.last_name}`,
          total: order.total_amount,
          orders: [],
        };
      }
      userOrders[order.userid].orders.push(order);
    }

    // Send one email per user
    for (const userId in userOrders) {
      const userData = userOrders[userId];
      const ordersList = userData.orders.map(o => `
🆔 Order #${o.orderid}
📅 Date: ${o.order_timestamp}

🚛 Model: ${o.truck_model}
🎨 Color: ${o.body_color}
⚙️ Transmission: ${o.transmission}
📦 Payload Capacity: ${o.payload_capacity}
🏗️ Lifting Capacity: ${o.lifting_capacity || "N/A"}
🚚 Towing Capacity: ${o.towing_capacity || "N/A"}
🔢 Quantity: ${o.quantity}

💰 Unit Price: ₱${Number(o.base_price).toLocaleString()}
💵 Total Price: ₱${Number(o.total_price).toLocaleString()}

📦 Shipping: ${o.shipping_option}
💳 Payment Method: ${o.payment_method}
📈 Order Status: ${o.status}
💸 Payment Status: ${o.payment_status || "Not yet paid"}
      `.trim()).join("\n\n──────────────────────────────\n\n");

      await emailjs.send("service_y38zirj", "template_68j0zpr", {
        to_name: userData.name,
        to_email: userData.email,
        orders: ordersList,
        total_amount: `₱${Number(userData.total).toLocaleString()}`,
        payment_instructions: `
Please complete your payment within 48 hours to process your order.
Accepted methods: Bank Transfer, Cash Payment, Check, or Installment.
Contact our support if you need assistance.
        `.trim(),
      });
    }

    return { statusCode: 200, body: JSON.stringify({ message: "Slip emails sent successfully." }) };
  } catch (err) {
    console.error("❌ Error creating slip:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
