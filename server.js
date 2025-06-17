import 'dotenv/config';
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
  app.use(cors({ origin: ['http://localhost:3000'], credentials: true }));
  app.use(express.json());

  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
  app.use('/uploads', express.static(uploadsDir));

  // Регистрация
  app.post('/api/auth/register', async (req, res) => {
    const { email, password, name, last_name, phone } = req.body;
    if (!email || !password || !name || !last_name || !phone)
      return res.status(400).json({ error: 'Все поля обязательны' });

    try {
      const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length)
        return res.status(400).json({ error: 'Email уже зарегистрирован' });

      const passwordHash = await bcrypt.hash(password, 10);
      const result = await db.query(
        `INSERT INTO users (name, last_name, email, password_hash, phone)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [name, last_name, email, passwordHash, phone]
      );

      res.status(201).json({ message: 'Регистрация успешна', userId: result.rows[0].id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  });

  // Авторизация
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email и пароль обязательны' });

    try {
      const result = await db.query(
        'SELECT id, name, last_name, password_hash FROM users WHERE email = $1',
        [email]
      );

      if (!result.rows.length)
        return res.status(401).json({ error: 'Пользователь не найден' });

      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch)
        return res.status(401).json({ error: 'Неверный пароль' });

      res.status(200).json({
        message: 'Успешный вход',
        userId: user.id,
        name: user.name,
        last_name: user.last_name
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  });

  // Услуги
  app.get('/api/services', async (_, res) => {
    try {
      const result = await db.query(`
        SELECT id, name, description, price, category, subcategory
        FROM services ORDER BY category, subcategory, name
      `);

      const grouped = {};
      result.rows.forEach(service => {
        if (!grouped[service.subcategory]) grouped[service.subcategory] = [];
        grouped[service.subcategory].push(service);
      });

      res.json(grouped);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка получения услуг' });
    }
  });

  // Мастера
  app.get('/api/masters', async (req, res) => {
    const { category } = req.query;
    if (!category)
      return res.status(400).json({ error: 'category обязателен' });

    try {
      const result = await db.query(
        'SELECT id, name FROM masters WHERE specialization = $1 ORDER BY name',
        [category]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка получения мастеров' });
    }
  });

  // Свободные слоты
  app.get('/api/availability', async (req, res) => {
    const { masterId, year, month } = req.query;
    if (!masterId || !year || !month)
      return res.status(400).json({ error: 'masterId, year и month обязательны' });

    try {
      const startDate = new Date(`${year}-${month.padStart(2, '0')}-01`);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

      const schedule = await db.query(
        'SELECT day_of_week, start_time, end_time FROM master_schedule WHERE master_id = $1',
        [masterId]
      );

      const scheduleMap = {};
      schedule.rows.forEach(row => {
        scheduleMap[row.day_of_week] = [row.start_time, row.end_time];
      });

      const appointments = await db.query(
        'SELECT appointment_data FROM appointments WHERE master_id = $1 AND appointment_data BETWEEN $2 AND $3',
        [masterId, startDate.toISOString(), endDate.toISOString()]
      );

      const takenSlots = new Set(appointments.rows.map(r => new Date(r.appointment_data).toISOString()));
      const result = {};
      const days = [];

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        days.push(new Date(d));
      }

      for (const date of days) {
        const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        if (!scheduleMap[weekday]) continue;

        const [start, end] = scheduleMap[weekday];
        const startTime = new Date(`${date.toISOString().split('T')[0]}T${start}`);
        const endTime = new Date(`${date.toISOString().split('T')[0]}T${end}`);
        const times = [];

        for (let t = new Date(startTime); t < endTime; t.setMinutes(t.getMinutes() + 30)) {
          const iso = t.toISOString();
          if (!takenSlots.has(iso)) times.push(t.toTimeString().slice(0, 5));
        }

        if (times.length > 0) {
          result[date.toISOString().split('T')[0]] = times;
        }
      }

      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка при расчёте слотов' });
    }
  });

  // Запись на прием
  app.post('/api/appointments', async (req, res) => {
    const { userId, masterId, serviceId, date, time } = req.body;
    if (!userId || !masterId || !serviceId || !date || !time)
      return res.status(400).json({ error: 'Все поля обязательны' });

    try {
      const appointmentDate = new Date(`${date}T${time}:00`);
      await db.query(`
        INSERT INTO appointments (user_id, service_id, master_id, appointment_data, status, created_at)
        VALUES ($1, $2, $3, $4, 'pending', NOW())
      `, [userId, serviceId, masterId, appointmentDate]);

      res.status(201).json({ message: 'Запись создана' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка сервера при записи' });
    }
  });

  // Отмена записи
  app.delete('/api/appointments/:id', async (req, res) => {
    const userId = req.headers['x-user-id'];
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Нет userId' });

    try {
      const result = await db.query(
        'DELETE FROM appointments WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );

      if (result.rowCount === 0)
        return res.status(404).json({ error: 'Запись не найдена' });

      res.status(200).json({ message: 'Запись отменена' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка при отмене записи' });
    }
  });

  // Контактные данные
  app.get('/api/contacts', async (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Нет userId' });

    try {
      const result = await db.query(
        'SELECT name, last_name, email, phone FROM users WHERE id = $1',
        [userId]
      );
      if (!result.rows.length) return res.status(404).json({ error: 'Пользователь не найден' });
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка при получении данных' });
    }
  });

  app.put('/api/contacts', async (req, res) => {
    const userId = req.headers['x-user-id'];
    const { name, last_name, email, phone, password } = req.body;
    if (!userId) return res.status(401).json({ error: 'Нет userId' });

    try {
      if (password) {
        const hash = await bcrypt.hash(password, 10);
        await db.query(`
          UPDATE users SET name=$1, last_name=$2, email=$3, phone=$4, password_hash=$5 WHERE id=$6
        `, [name, last_name, email, phone, hash, userId]);
      } else {
        await db.query(`
          UPDATE users SET name=$1, last_name=$2, email=$3, phone=$4 WHERE id=$5
        `, [name, last_name, email, phone, userId]);
      }

      res.status(200).json({ message: 'Контактные данные обновлены' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка обновления данных' });
    }
  });

  // Записи пользователя
  app.get('/api/user/appointments', async (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Нет userId' });

    try {
      const now = new Date();
      const result = await db.query(`
        SELECT a.id, a.appointment_data, s.name AS service_name, s.price, m.name AS master_name
        FROM appointments a
        JOIN services s ON a.service_id = s.id
        JOIN masters m ON a.master_id = m.id
        WHERE a.user_id = $1 AND a.appointment_data >= $2
        ORDER BY a.appointment_data
      `, [userId, now.toISOString()]);

      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка при получении записей' });
    }
  });

  app.use('/api', uploadRoute);

  const vite = await createViteServer({ root: __dirname, server: { middlewareMode: true } });
  app.use(vite.middlewares);

  app.use('*', async (req, res) => {
    try {
      const html = await vite.transformIndexHtml(req.originalUrl, `
        <!DOCTYPE html>
        <html lang="ru"><head><meta charset="UTF-8" /><title>BLISS</title></head><body><div id="root"></div></body></html>
      `);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      console.error('Ошибка шаблона:', e);
      res.status(500).end(e.message);
    }
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`✅ Сервер запущен: http://localhost:${PORT}`));
};

startServer();
