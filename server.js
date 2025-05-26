import express from 'express';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';
import bcrypt from 'bcrypt';
import fs from 'fs';
import cors from 'cors';
import db from './db.js';
import uploadRoute from './uploadRoute.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const startServer = async () => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // === Обработка /uploads (PNG, JPG, и пр.) ===
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  // Отдача статики (включая .png)
  app.use('/uploads', express.static(uploadsDir));

  // === API маршруты ===

  // Регистрация
  app.post('/api/auth/register', async (req, res) => {
    const { email, password, name, last_name, phone } = req.body;

    if (!email || !password || !name || !last_name || !phone) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    try {
      const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email уже зарегистрирован' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const result = await db.query(
        `INSERT INTO users (name, last_name, email, password_hash, phone)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [name, last_name, email, passwordHash, phone]
      );

      res.status(201).json({ message: 'Регистрация успешна', userId: result.rows[0].id });
    } catch (err) {
      console.error('Ошибка при регистрации:', err);
      res.status(500).json({ error: 'Ошибка сервера при регистрации' });
    }
  });

  // Вход
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    try {
      const result = await db.query('SELECT id, password_hash FROM users WHERE email = $1', [email]);

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Пользователь не найден' });
      }

      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
        return res.status(401).json({ error: 'Неверный пароль' });
      }

      res.status(200).json({ message: 'Успешный вход', userId: user.id });
    } catch (err) {
      console.error('Ошибка при входе:', err);
      res.status(500).json({ error: 'Ошибка сервера при входе' });
    }
  });

  // Получение контактной информации
  app.get('/api/contacts', async (req, res) => {
    const userId = 1;

    try {
      const result = await db.query(
        `SELECT name, last_name, email, phone FROM users WHERE id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Ошибка при получении данных:', err);
      res.status(500).json({ error: 'Ошибка сервера при получении данных' });
    }
  });

  // Обновление контактной информации
  app.put('/api/contacts', async (req, res) => {
    const userId = 1;
    const { name, last_name, email, phone, password } = req.body;

    try {
      const updateFields = [];
      const values = [];
      let index = 1;

      if (name) {
        updateFields.push(`name = $${index++}`);
        values.push(name);
      }
      if (last_name) {
        updateFields.push(`last_name = $${index++}`);
        values.push(last_name);
      }
      if (email) {
        updateFields.push(`email = $${index++}`);
        values.push(email);
      }
      if (phone) {
        updateFields.push(`phone = $${index++}`);
        values.push(phone);
      }
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateFields.push(`password_hash = $${index++}`);
        values.push(hashedPassword);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'Нет данных для обновления' });
      }

      values.push(userId);
      const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${index}`;
      await db.query(query, values);

      res.status(200).json({ message: 'Данные успешно обновлены' });
    } catch (err) {
      console.error('Ошибка при обновлении данных:', err);
      res.status(500).json({ error: 'Ошибка сервера при обновлении данных' });
    }
  });

  // Сохранение отзыва (может оставить любой пользователь)
  app.post('/api/reviews', async (req, res) => {
    const { name, rating, comment } = req.body;

    if (!name || !rating || !comment) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    try {
      await db.query(
        `INSERT INTO reviews (name, rating, comment, created_at)
        VALUES ($1, $2, $3, NOW())`,
        [name, rating, comment]
      );

      res.status(201).json({ message: 'Отзыв успешно добавлен' });
    } catch (err) {
      console.error('Ошибка при сохранении отзыва:', err);
      res.status(500).json({ error: 'Ошибка сервера при сохранении отзыва' });
    }
  });


  // Получение отзывов
  app.get('/api/reviews', async (req, res) => {
    try {
      const result = await db.query(`
        SELECT r.id, u.name, r.rating, r.comment, r.created_at
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        ORDER BY RANDOM()
        LIMIT 10
      `);

      res.json(result.rows);
    } catch (err) {
      console.error('Ошибка при получении отзывов:', err);
      res.status(500).json({ error: 'Ошибка сервера при получении отзывов' });
    }
  });

  // Получение списка услуг
  app.get('/api/services', async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM services ORDER BY id');

      const grouped = {
        'Маникюр': [],
        'Педикюр': [],
        'Комплексные услуги': [],
        'Стрижка и укладка': [],
        'Окрашивание': [],
        'Ресницы': [],
        'Брови': []
      };

      result.rows.forEach((service, index) => {
        const i = index + 1;
        if (i >= 1 && i <= 9) grouped['Маникюр'].push(service);
        else if (i >= 10 && i <= 15) grouped['Педикюр'].push(service);
        else if (i >= 16 && i <= 23) grouped['Комплексные услуги'].push(service);
        else if (i >= 24 && i <= 34) grouped['Стрижка и укладка'].push(service);
        else if (i >= 35 && i <= 38) grouped['Окрашивание'].push(service);
        else if (i >= 39 && i <= 42) grouped['Ресницы'].push(service);
        else if (i >= 43 && i <= 46) grouped['Брови'].push(service);
      });

      res.json(grouped);
    } catch (err) {
      console.error('Ошибка при группировке услуг:', err);
      res.status(500).json({ error: 'Ошибка сервера при группировке услуг' });
    }
  });

  // Загрузка изображений
  app.use('/api', uploadRoute); // включает /api/upload

  // Vite middleware
  const vite = await createViteServer({
    root: __dirname,
    server: { middlewareMode: true },
  });

  app.use(vite.middlewares);

  // SPA fallback
  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl;
      const template = await vite.transformIndexHtml(url, `
        <!DOCTYPE html>
        <html lang="ru">
          <head><meta charset="UTF-8"><title>BLISS</title></head>
          <body><div id="root"></div></body>
        </html>
      `);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      console.error('Ошибка Vite middleware:', e);
      res.status(500).end(e.message);
    }
  });

  // Запуск сервера
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Сервер запущен: http://localhost:${PORT}`);
  });
};

startServer();
