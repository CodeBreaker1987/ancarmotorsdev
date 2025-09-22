// functions/reg_user.js
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
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { firstName, lastName, address, email, phone, username, password } = JSON.parse(event.body);

    const query = `
      INSERT INTO public.customers 
        (first_name, last_name, home_address, email_address, phone_number, username, password)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING userid, username;
    `;

    const values = [firstName, lastName, address, email, phone, username, password];
    const result = await pool.query(query, values);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: result.rows[0] }),
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: error.message }),
    };
  }
}
