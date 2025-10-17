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
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
});

export async function handler(event, context) {
  try {
    // Get all pending orders grouped by user
    const ordersQuery = `
      SELECT 
        o.*,
        u.email_address,
        u.first_name,
        u.last_name,
        SUM(o.total_price) OVER (PARTITION BY o.userid) as total_pending
      FROM orders o
      JOIN users u ON o.userid = u.userid
      WHERE o.status IN ('Pending', 'Processing')
      AND o.created_at >= NOW() - INTERVAL '10 minutes'
      ORDER BY o.userid, o.orderid DESC
    `;

    const result = await pool.query(ordersQuery);
    
    // Group orders by user
    const userOrders = {};
    result.rows.forEach(order => {
      if (!userOrders[order.userid]) {
        userOrders[order.userid] = {
          orders: [],
          email: order.email_address,
          name: `${order.first_name} ${order.last_name}`,
          total: order.total_pending
        };
      }
      userOrders[order.userid].orders.push(order);
    });

    // Send email for each user
    for (const userId in userOrders) {
      const userData = userOrders[userId];
      
      // Format orders for email
      const ordersList = userData.orders.map(order => `
        Order #${order.orderid}
        Model: ${order.truck_model}
        Specifications:
        - Color: ${order.body_color}
        - Transmission: ${order.transmission}
        - Quantity: ${order.quantity}
        Price: ₱${order.total_price.toLocaleString()}
        Status: ${order.status}
      `).join('\n\n');

      // Send email
      await emailjs.send(
        "service_hhwzshz",
        "template_payment_slip",
        {
          to_name: userData.name,
          to_email: userData.email,
          orders: ordersList,
          total_amount: `₱${userData.total.toLocaleString()}`,
          payment_instructions: "Please complete your payment within 48 hours to process your order.",
        }
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Payment slips sent successfully" })
    };

  } catch (error) {
    console.error('Error generating slips:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate payment slips" })
    };
  }
}