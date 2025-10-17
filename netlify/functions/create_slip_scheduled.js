// create_slip_scheduled.js
import pkg from "pg";
import emailjs from "@emailjs/nodejs";
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.NEON_HOST,
  database: process.env.NEON_DB,
  user: process.env.NEON_USER,
  password: process.env.NEON_PASS,
  port: 5432,
  ssl: { rejectUnauthorized: false },
});

// Configure EmailJS
emailjs.init({
  publicKey: process.env.EMAILJS_ANCAR_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_ANCAR_PRIVATE_KEY,
});


export async function handler(event, context) {
  try {
    // 1️⃣ Query all pending or processing orders created within 10 minutes
    const ordersQuery = `
      SELECT 
        o.*,
        u.email_address,
        u.first_name,
        u.last_name,
        SUM(o.total_price) OVER (PARTITION BY o.userid) as total_pending
      FROM public.orders o
      JOIN public.customers u ON o.userid = u.userid
      WHERE o.status IN ('Pending', 'Processing')
      ORDER BY o.userid, o.orderid DESC
    `;

    const result = await pool.query(ordersQuery);

    if (result.rows.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "No pending orders found" }),
      };
    }

    // 2️⃣ Group orders by user
    const userOrders = {};
    result.rows.forEach(order => {
      if (!userOrders[order.userid]) {
        userOrders[order.userid] = {
          orders: [],
          email: order.email_address,
          name: `${order.first_name} ${order.last_name}`,
          total: order.total_pending,
        };
      }
      userOrders[order.userid].orders.push(order);
    });

    // 3️⃣ Send email for each user
    for (const userId in userOrders) {
      const userData = userOrders[userId];

      // 🧾 Format each order for readability
      const ordersList = userData.orders.map(order => {
        const createdAt = new Date(order.created_at).toLocaleString("en-PH", {
          dateStyle: "medium",
          timeStyle: "short",
        });

        return `
🆔 Order #${order.orderid}
📅 Date: ${order.order_timestamp}

🚛 Model: ${order.truck_model}
🎨 Color: ${order.body_color}
⚙️ Transmission: ${order.transmission}
📦 Payload Capacity: ${order.payload_capacity}
🏗️ Lifting Capacity: ${order.lifting_capacity || "N/A"}
🚚 Towing Capacity: ${order.towing_capacity || "N/A"}
🔢 Quantity: ${order.quantity}

💰 Unit Price: ₱${Number(order.base_price).toLocaleString()}
💵 Total Price: ₱${Number(order.total_price).toLocaleString()}

📦 Shipping: ${order.shipping_option}
💳 Payment Method: ${order.payment_method}
📈 Order Status: ${order.status}
💸 Payment Status: ${order.payment_status || "Not yet paid"}
        `.trim();
      }).join("\n\n──────────────────────────────\n\n");

      // 4️⃣ Send email using EmailJS
      await emailjs.send(
        "service_y38zirj", // your EmailJS service ID
        "template_68j0zpr", // your EmailJS template ID
        {
          to_name: userData.name,
          to_email: userData.email,
          orders: ordersList,
          total_amount: `₱${Number(userData.total).toLocaleString()}`,
          payment_instructions: `
Please complete your payment within 48 hours to process your order.
Accepted methods: Bank Transfer, Cash Payment, Check, or Installment.
Contact our support if you need assistance.
          `.trim(),
        }
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Payment slips sent successfully" }),
    };

  } catch (error) {
    console.error("Error generating slips:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate payment slips" }),
    };
  }
}
