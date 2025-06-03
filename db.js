import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({
  host: 'centerbeam.proxy.rlwy.net',
  user: 'postgres',
  password: 'oSxDAMNNNUMuqvnuqcJXhCIQCHjMBHNe',
  database: 'railway',
  port: 34401,
});

export default pool;
