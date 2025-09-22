// functions/get_customer.js
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
  try {
    const { username, email_address, password, userid } = event.queryStringParameters;

    if (!username && !email_address && !userid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing login parameters." }),
      };
    }

    let query = `
      SELECT 
        userid,
        first_name,
        last_name,
        home_address,
        phone_number,
        email_address,
        username,
        password
      FROM public.customers
      WHERE 1=1
    `;
    const params = [];

    if (username) {
      params.push(username);
      query += ` AND username = $${params.length}`;
    }

    if (email_address) {
      params.push(email_address);
      query += ` AND email_address = $${params.length}`;
    }

    if (userid) {
      params.push(userid);
      query += ` AND userid = $${params.length}`;
    }

    query += ` LIMIT 1`;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Customer not found" }),
      };
    }

    const user = result.rows[0];

    // ✅ Plain password check
    if (password && password !== user.password) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid password" }),
      };
    }

    delete user.password; // ✅ don’t leak password

    return {
      statusCode: 200,
      body: JSON.stringify({ user }),
    };
  } catch (err) {
    console.error("get_customer error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error." }),
    };
  }
}
