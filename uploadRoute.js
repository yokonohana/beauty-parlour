import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from './db.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📁 Убедимся, что папка uploads существует
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ⚙️ Multer конфигурация
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// 📤 Загрузка и сохранение изображения в gallery
router.post('/upload', upload.single('photo'), async (req, res) => {
  const category = req.body.category || null;

  if (!req.file) {
    return res.status(400).json({ error: 'Файл не был загружен' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;

  try {
    const result = await db.query(
      'INSERT INTO gallery (image_url, category) VALUES ($1, $2) RETURNING *',
      [imageUrl, category]
    );

    res.json({
      message: 'Файл успешно загружен',
      photo: result.rows[0],
    });
  } catch (err) {
    console.error('Ошибка при сохранении в gallery:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// 📥 Получение изображений с фильтрацией
router.get('/gallery', async (req, res) => {
  try {
    const { category } = req.query;
    const query = category
      ? 'SELECT * FROM gallery WHERE category = $1 ORDER BY created_at DESC'
      : 'SELECT * FROM gallery ORDER BY created_at DESC';

    const values = category ? [category] : [];

    const result = await db.query(query, values);

    const images = result.rows.map((img) => ({
      id: img.id,
      url: img.image_url,
      category: img.category,
    }));

    res.json(images);
  } catch (err) {
    console.error('Ошибка при загрузке изображений:', err);
    res.status(500).json({ error: 'Ошибка сервера при получении изображений' });
  }
});

export default router;
