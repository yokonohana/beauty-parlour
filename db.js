import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || '5432'),
  user: process.env.POSTGRES_USER,
  password: process.env.PGPASSWORD,
  database: process.env.POSTGRES_DB,
  ssl: { rejectUnauthorized: false },
});

export default pool;
