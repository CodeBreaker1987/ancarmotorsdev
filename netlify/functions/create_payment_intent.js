import fetch from "node-fetch";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.NEON_HOST,
  user: process.env.NEON_USER,
  password: process.env.NEON_PASS,
  database: process.env.NEON_DB,
  port: 5432,
  ssl: { rejectUnauthorized: false },
});

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { amount, email, description, orderId } = JSON.parse(event.body);

    // PayMongo expects the amount in *centavos*
    const formattedAmount = Math.round(amount * 100);

    const response = await fetch("https://api.paymongo.com/v1/checkout_sessions", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          attributes: {
            billing: { email },
            line_items: [
              {
                name: description,
                amount: formattedAmount,
                currency: "PHP",
                quantity: 1,
              },
            ],
            payment_method_types: [
              "card",
              "gcash",
              "paymaya",
            ],
            success_url: `${process.env.SITE_URL}/success?orderId=${orderId}`,
            cancel_url: `${process.env.SITE_URL}/cancel?orderId=${orderId}`,
          },
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("PayMongo API Error:", result);
      throw new Error(result.errors?.[0]?.detail || "PayMongo Error");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ checkoutUrl: result.data.attributes.checkout_url }),
    };
  } catch (error) {
    console.error("Error creating PayMongo session:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
