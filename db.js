import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',       // твой пользователь
  host: 'localhost',      // адрес сервера
  database: 'diplom1',     // имя БД
  password: '08052003',       // пароль
  port: 5432,             // порт
});

export default pool;