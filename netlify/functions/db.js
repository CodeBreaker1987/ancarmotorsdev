import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
   host: process.env.NEON_HOST,      // Neon host
  database: process.env.NEON_DB,    // Neon database name
  user: process.env.NEON_USER,      // Neon username
  password: process.env.NEON_PASS,  // Neon password
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;
