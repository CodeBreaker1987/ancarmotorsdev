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
    const { userid = null, transaction_number = null, statusGroup = "active" } = body;

    const activeStatuses = ["Pending", "Processing", "Awaiting Shipment", "Shipped", "Out for Delivery"];
    const closedStatuses = ["Completed", "Canceled", "Returned"];
    const statuses = statusGroup === "completed" ? closedStatuses : activeStatuses;

    console.log(`📧 Generating slip email for ${userid || "ALL"} users [${statusGroup}] transaction_number=${transaction_number || "NONE"}`);

    // Query orders filtered by status, optional transaction_number and optional userid
    const ordersQuery = `
      SELECT 
        o.*,
        u.email_address,
        u.first_name,
        u.last_name,
        SUM(o.total_price) OVER (PARTITION BY o.userid) as total_amount
      FROM public.orders o
      JOIN public.customers u ON o.userid = u.userid
      WHERE o.status = ANY($1)
        AND ($2::text IS NULL OR o.transaction_number = $2)
        AND ($3::text IS NULL OR o.userid = $3)
      ORDER BY o.userid, o.orderid DESC;
    `;

    const params = [statuses, transaction_number || null, userid || null];
    const result = await pool.query(ordersQuery, params);

    if (result.rows.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "No orders found for the given criteria." }),
      };
    }

    // Group orders by user
    const userOrders = {};
    for (const order of result.rows) {
      if (!userOrders[order.userid]) {
        userOrders[order.userid] = {
          email: order.email_address,
          name: `${order.first_name || ""} ${order.last_name || ""}`.trim() || "Customer",
          total: order.total_amount,
          orders: [],
        };
      }
      userOrders[order.userid].orders.push(order);
    }

    // Send one email per user, include transaction slip number first
    for (const userId in userOrders) {
      const userData = userOrders[userId];

      // Determine slip header for this user's orders.
      // Prefer provided transaction_number; otherwise use the transaction_number from the first order (most recent).
      let slipHeader = transaction_number;
      if (!slipHeader) {
        const slips = Array.from(new Set(userData.orders.map((o) => o.transaction_number).filter(Boolean)));
        slipHeader = slips.length === 1 ? slips[0] : (slips.length > 1 ? slips.join(", ") : "N/A");
      }

      const ordersList = userData.orders.map(o => `
Transaction Slip: ${slipHeader}

🆔 Order #${o.orderid}
📅 Date: ${o.order_timestamp || "N/A"}

🚛 Model: ${o.truck_model || "N/A"}
🎨 Color: ${o.body_color || "N/A"}
⚙️ Transmission: ${o.transmission || "N/A"}
📦 Payload Capacity: ${o.payload_capacity || "N/A"}
🏗️ Lifting Capacity: ${o.lifting_capacity || "N/A"}
🚚 Towing Capacity: ${o.towing_capacity || "N/A"}
🔢 Quantity: ${o.quantity || 1}

💰 Unit Price: ₱${Number(o.base_price || 0).toLocaleString()}
💵 Total Price: ₱${Number(o.total_price || 0).toLocaleString()}

📦 Shipping: ${o.shipping_option || "Standard"}
💳 Payment Method: ${o.payment_method || "N/A"}
📈 Order Status: ${o.status || "N/A"}
💸 Payment Status: ${o.payment_status || "Not yet paid"}
      `.trim()).join("\n\n──────────────────────────────\n\n");

      // Send email: include transaction_number as a separate template field and the orders list
      try {
        // add: provide public logo URL and try to generate base64 fallback
        const logoUrl = process.env.SLIP_LOGO_URL || null;
        let logoBase64 = null;
        if (logoUrl) {
          try {
            const res = await fetch(logoUrl);
            if (res.ok) {
              const arrayBuffer = await res.arrayBuffer();
              const contentType = res.headers.get("content-type") || "image/png";
              logoBase64 = `data:${contentType};base64,${Buffer.from(arrayBuffer).toString("base64")}`;
            } else {
              console.warn(`Could not fetch logo URL (${logoUrl}): HTTP ${res.status}`);
            }
          } catch (fetchErr) {
            console.warn("Failed to fetch/convert logo to base64:", fetchErr);
          }
        }

        await emailjs.send("service_y38zirj", "template_68j0zpr", {
          to_name: userData.name,
          to_email: userData.email,
          transaction_number: slipHeader,
          orders: ordersList,
          total_amount: `₱${Number(userData.total || 0).toLocaleString()}`,
          payment_instructions: `
Please complete your payment within 48 hours to process your order.
Accepted methods: Bank Transfer, Cash Payment, Check, or Installment.
Contact our support if you need assistance.
          `.trim(),
          // image fields available to the template:
          logo_url: logoUrl,        // public URL (recommended)
          logo_base64: logoBase64,  // data URI fallback (optional)
        });
      } catch (sendErr) {
        console.error(`❌ Failed to send slip email to user ${userId} (${userData.email}):`, sendErr);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Slip emails processed." }),
    };
  } catch (err) {
    console.error("❌ Error creating slip:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
