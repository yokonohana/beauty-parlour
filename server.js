import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';
import bcrypt from 'bcrypt';
import fs from 'fs';
import cors from 'cors';
import twilio from 'twilio';

process.env.DATABASE_PUBLIC_URL = process.env.DATABASE_PUBLIC_URL || "postgres://myuser:mypassword@myhost:5432/mydatabase?sslmode=require";

import db from './db.js';
import uploadRoute from './uploadRoute.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const startServer = async () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // === Обработка /uploads (PNG, JPG и пр.) ===
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
  app.use('/uploads', express.static(uploadsDir));

  // =========================
  // ===      API ROUTES   ==
  // =========================

  // ————— Регистрация нового пользователя —————
  app.post('/api/auth/register', async (req, res) => {
    const { email, password, name, last_name, phone } = req.body;
    if (!email || !password || !name || !last_name || !phone) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    try {
      // Проверяем, нет ли уже пользователя с таким email
      const existingUser = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email уже зарегистрирован' });
      }

      // Хэшируем пароль и сохраняем пользователя
      const passwordHash = await bcrypt.hash(password, 10);
      const result = await db.query(
        `
          INSERT INTO users (name, last_name, email, password_hash, phone)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
        `,
        [name, last_name, email, passwordHash, phone]
      );

      res.status(201).json({
        message: 'Регистрация успешна',
        userId: result.rows[0].id
      });
    } catch (err) {
      console.error('Ошибка при регистрации:', err);
      res.status(500).json({ error: 'Ошибка сервера при регистрации' });
    }
  });

  // ————— Вход пользователя —————
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    try {
      const result = await db.query(
        'SELECT id, password_hash FROM users WHERE email = $1',
        [email]
      );
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

  // ————— Получение контактной информации —————
  app.get('/api/contacts', async (req, res) => {
    try {
      const result = await db.query(`
        SELECT address, phone, working_hours
        FROM contact_info
        ORDER BY id
        LIMIT 1
      `);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Контактная информация не найдена' });
      }
      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Ошибка при получении контактной информации:', err);
      res.status(500).json({ error: 'Ошибка сервера при получении контактов' });
    }
  });

  // ————— Обновление контактной информации пользователя —————
  app.put('/api/contacts', async (req, res) => {
    const userId = 1; // фиксируем пользователя с id=1
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

  // ————— Добавление нового отзыва —————
  app.post('/api/reviews', async (req, res) => {
    const { name, rating, comment } = req.body;
    if (!name || !rating || !comment) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }
    try {
      await db.query(
        `
          INSERT INTO reviews (name, rating, comment, status, created_at)
          VALUES ($1, $2, $3, 'approved', NOW())
        `,
        [name, rating, comment]
      );
      res.status(201).json({ message: 'Отзыв успешно добавлен' });
    } catch (err) {
      console.error('Ошибка при сохранении отзыва:', err);
      res.status(500).json({ error: 'Ошибка сервера при сохранении отзыва' });
    }
  });

  // ————— Получение 10 случайных «approved» отзывов —————
  app.get('/api/reviews', async (req, res) => {
    try {
      const result = await db.query(`
        SELECT id, name, rating, comment, created_at
        FROM reviews
        WHERE status = 'approved'
        ORDER BY RANDOM()
        LIMIT 10
      `);
      res.json(result.rows);
    } catch (err) {
      console.error('Ошибка при получении отзывов:', err);
      res.status(500).json({ error: 'Ошибка сервера при получении отзывов' });
    }
  });

  // ————— Получение списка услуг, сгруппированных по subcategory —————
  app.get('/api/services', async (req, res) => {
    try {
      const result = await db.query(`
        SELECT id, name, description, price, category, subcategory
        FROM services
        ORDER BY category, subcategory, name
      `);

      const grouped = {};
      result.rows.forEach(service => {
        const sub = service.subcategory;
        if (!grouped[sub]) {
          grouped[sub] = [];
        }
        grouped[sub].push({
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price
        });
      });

      res.json(grouped);
    } catch (err) {
      console.error('Ошибка при получении и группировке услуг:', err);
      res.status(500).json({ error: 'Ошибка сервера при получении услуг' });
    }
  });

  // ————— Получение списка мастеров по категории —————
  // GET /api/masters?category=<категория>
  app.get('/api/masters', async (req, res) => {
    try {
      const { category } = req.query;
      if (!category) {
        return res.status(400).json({ error: 'Параметр category обязателен' });
      }
      const result = await db.query(
        'SELECT id, name FROM masters WHERE specialization = $1 ORDER BY name',
        [category]
      );
      // Вернём массив формата [{ id, name }, ...]
      res.json(result.rows);
    } catch (err) {
      console.error('Ошибка при получении мастеров:', err);
      res.status(500).json({ error: 'Ошибка сервера при получении мастеров' });
    }
  });

  // ————— Получение доступных слотов (availability) по мастеру и месяцу —————
  // GET /api/availability?masterId=<id>&year=<YYYY>&month=<MM>
  app.get('/api/availability', async (req, res) => {
    try {
      const { masterId, year, month } = req.query;
      if (!masterId || !year || !month) {
        return res
          .status(400)
          .json({ error: 'Параметры masterId, year и month обязательны' });
      }

      // Приводим year, month к числам
      const y = parseInt(year, 10);
      const m = parseInt(month, 10); // 1..12

      // 1) Запросим расписание мастера (master_schedule)
      const scheduleRes = await db.query(
        `
          SELECT day_of_week, start_time, end_time
          FROM master_schedule
          WHERE master_id = $1
        `,
        [masterId]
      );
      const scheduleRows = scheduleRes.rows;

      // 2) Собираем мап day_of_week → { start_time, end_time }
      const workMap = {};
      scheduleRows.forEach(({ day_of_week, start_time, end_time }) => {
        workMap[day_of_week] = {
          start_time: start_time.slice(0, 5),
          end_time: end_time.slice(0, 5)
        };
      });

      // 3) Выясняем число дней в месяце y-m
      const daysInMonth = new Date(y, m, 0).getDate();

      // 4) Пробегаем по каждому дню месяца и собираем FREE слоты
      const availabilityMap = {};

      const dowMap = {
        1: 'monday',
        2: 'tuesday',
        3: 'wednesday',
        4: 'thursday',
        5: 'friday',
        6: 'saturday',
        0: 'sunday'
      };

      for (let d = 1; d <= daysInMonth; d++) {
        const curDate = new Date(y, m - 1, d);
        const weekdayJS = curDate.getDay(); // 0=Вс,1=Пн,...6=Сб
        const dow = dowMap[weekdayJS];
        if (!workMap[dow]) continue; // Мастер не работает в этот день

        // Формируем dateKey = "YYYY-MM-DD"
        const dd = String(d).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        const dateKey = `${y}-${mm}-${dd}`;

        // 5) Выбираем уже занятые слоты у мастера на эту дату
        const apptRes = await db.query(
          `
            SELECT DATE_TRUNC('minute', appointment_data) AS slot_time
            FROM appointments
            WHERE master_id = $1
              AND DATE_TRUNC('day', appointment_data) = $2::date
          `,
          [masterId, dateKey]
        );
        const busySlots = new Set(
          apptRes.rows.map(r => {
            const dt = new Date(r.slot_time);
            const hh = String(dt.getHours()).padStart(2, '0');
            const mm2 = String(dt.getMinutes()).padStart(2, '0');
            return `${hh}:${mm2}`;
          })
        );

        // 6) Генерируем 30-минутные интервалы от start_time до end_time
        const { start_time, end_time } = workMap[dow];
        const [startH, startM] = start_time.split(':').map(Number);
        const [endH,   endM]   = end_time.split(':').map(Number);

        let currentMinutes = startH * 60 + startM;
        const endMinutes   = endH * 60 + endM;
        const freeSlots    = [];

        while (currentMinutes + 30 <= endMinutes) {
          const hh = String(Math.floor(currentMinutes / 60)).padStart(2, '0');
          const mm2 = String(currentMinutes % 60).padStart(2, '0');
          const slot = `${hh}:${mm2}`;
          if (!busySlots.has(slot)) {
            freeSlots.push(slot);
          }
          currentMinutes += 30;
        }

        if (freeSlots.length > 0) {
          availabilityMap[dateKey] = freeSlots;
        }
      }

      res.json(availabilityMap);
    } catch (err) {
      console.error('Ошибка при получении доступности:', err);
      res.status(500).json({ error: 'Серверная ошибка при получении доступности' });
    }
  });

  // ————— Создание записи на приём —————
  // POST /api/appointments
  // Ожидаем JSON: { userId, masterId, date: "YYYY-MM-DD", time: "HH:MM" }
  app.post('/api/appointments', async (req, res) => {
    try {
      const { userId, masterId, date, time } = req.body;
      if (!userId || !masterId || !date || !time) {
        return res.status(400).json({ error: 'userId, masterId, date и time обязательны' });
      }

      // 1) Собираем appointment_data из date + time (формат ISO)
      const appointmentDateTime = new Date(`${date}T${time}:00`);

      // 2) Вставляем запись в таблицу appointments
      await db.query(
        `
          INSERT INTO appointments (user_id, service_id, master_id, appointment_data, status, created_at)
          VALUES ($1, NULL, $2, $3, 'pending', NOW())
        `,
        [userId, masterId, appointmentDateTime]
      );

      // 3) Достаём номер телефона пользователя
      const userRes = await db.query(
        'SELECT phone FROM users WHERE id = $1',
        [userId]
      );
      if (userRes.rows.length === 0) {
        // Если пользователя нет, возвращаем ошибку, но всё равно уже вставили запись
        return res.status(404).json({ error: 'Пользователь не найден для отправки SMS' });
      }

      const userPhone = userRes.rows[0].phone;
      if (!userPhone) {
        return res.status(400).json({ error: 'У пользователя не указан номер телефона' });
      }

      // 4) Отправляем SMS-уведомление через Twilio
      const messageBody = `Ваша запись подтверждена: мастер ${masterId}, дата ${date}, время ${time}.`;
      await twilioClient.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to: userPhone,
        body: messageBody
      });

      return res.status(201).json({ message: 'Запись создана, SMS отправлено' });
    } catch (err) {
      console.error('Ошибка при создании записи:', err);
      return res.status(500).json({ error: 'Серверная ошибка при создании записи' });
    }
  });

  // ————— Маршрут для загрузки изображений —————
  app.use('/api', uploadRoute);

  // =========================
  // ===   VITE MIDDLEWARE  ==
  // =========================
  const vite = await createViteServer({
    root: __dirname,
    server: { middlewareMode: true },
  });
  app.use(vite.middlewares);

  // =========================
  // ===   SPA FALLBACK     ==
  // =========================
  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl;
      const template = await vite.transformIndexHtml(
        url,
        `<!DOCTYPE html>
        <html lang="ru">
          <head>
            <meta charset="UTF-8" />
            <title>BLISS</title>
          </head>
          <body>
            <div id="root"></div>
          </body>
        </html>`
      );
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      console.error('Ошибка Vite middleware:', e);
      res.status(500).end(e.message);
    }
  });

  // =========================
  // ===  START SERVER     ==
  // =========================
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Сервер запущен: http://localhost:${PORT}`);
  });
};

startServer();
