const { Pool } = require('pg');

const pool = new Pool({
	host: process.env.NEON_HOST,
  database: process.env.NEON_DB,
  user: process.env.NEON_USER,
  password: process.env.NEON_PASS,
  port: 5432,
  ssl: { rejectUnauthorized: false },
});

exports.handler = async function(event, context) {
	try {
		const client = await pool.connect();
		try {
			// Fetch all orders
			const ordersRes = await client.query('SELECT * FROM public.orders');
			const orders = ordersRes.rows || [];
			return {
				statusCode: 200,
				body: JSON.stringify({ orders })
			};
		} finally {
			client.release();
		}
	} catch (err) {
		return {
			statusCode: 500,
			body: JSON.stringify({ error: err.message })
		};
	}
};
