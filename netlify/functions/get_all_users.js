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
  if (!["GET", "POST"].includes(event.httpMethod)) {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    // Count customers and return a small sample of users (optional)
    const countRes = await pool.query("SELECT COUNT(*)::int AS total_customers FROM public.customers");
    const usersRes = await pool.query("SELECT userid, first_name, last_name, email_address FROM public.customers ORDER BY userid DESC LIMIT 100");

    const totalCustomers = countRes.rows?.[0]?.total_customers ?? 0;
    const users = usersRes.rows ?? [];

    return {
      statusCode: 200,
      body: JSON.stringify({
        totalCustomers,
        users,
      }),
    };
  } catch (err) {
    console.error("get_all_users error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to fetch users",
        details: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      }),
    };
  }
}