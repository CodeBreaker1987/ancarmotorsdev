// netlify/functions/update_user.js
import { Client } from "pg"; // PostgreSQL client

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { userId, first_name, last_name, username, email_address, phone_number, home_address, password } =
      JSON.parse(event.body);

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing userId" }),
      };
    }

    const client = new Client({
      host: process.env.NEON_HOST,
  database: process.env.NEON_DB,
  user: process.env.NEON_USER,
  password: process.env.NEON_PASS,
  port: 5432,
  ssl: { rejectUnauthorized: false },
    });

    await client.connect();

    // Build dynamic query
    const fields = [];
    const values = [];
    let idx = 1;

    if (first_name) {
      fields.push(`first_name = $${idx++}`);
      values.push(first_name);
    }
    if (last_name) {
      fields.push(`last_name = $${idx++}`);
      values.push(last_name);
    }
    if (username) {
      fields.push(`username = $${idx++}`);
      values.push(username);
    }
    if (email_address) {
      fields.push(`email_address = $${idx++}`);
      values.push(email_address);
    }
    if (phone_number) {
      fields.push(`phone_number = $${idx++}`);
      values.push(phone_number);
    }
    if (home_address) {
      fields.push(`home_address = $${idx++}`); // ✅ added home_address
      values.push(home_address);
    }
    if (password) {
      fields.push(`password = $${idx++}`);
      values.push(password);
    }

    if (fields.length === 0) {
      await client.end();
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No fields to update" }),
      };
    }

    values.push(userId);
    const query = `UPDATE public.customers SET ${fields.join(", ")} WHERE userid = $${idx} RETURNING *`;

    const result = await client.query(query, values);
    await client.end();

    if (result.rowCount === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows[0]),
    };
  } catch (err) {
    console.error("Error updating user:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Database error",
        details: err.message,
      }),
    };
  }
}
