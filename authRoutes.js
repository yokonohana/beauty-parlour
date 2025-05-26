import express from 'express';
import db from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();
const SECRET = 'jwt-secret-key'; // лучше вынести в .env

router.post('/register', async (req, res) => {
  const { name, last_name, email, password, phone } = req.body;
  try {
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) return res.status(400).json({ error: 'Пользователь уже существует' });

    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(`
      INSERT INTO users (name, last_name, email, password_hash, phone)
      VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role
    `, [name, last_name, email, hash, phone]);

    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: 'Неверный email или пароль' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Неверный email или пароль' });

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '1d' });
    delete user.password_hash;
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
