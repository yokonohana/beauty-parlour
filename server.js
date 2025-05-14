import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });

  app.use(vite.middlewares);

  app.get('/', async (req, res) => {
    const html = await vite.transformIndexHtml(req.url, `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <link rel="icon" type="image/svg+xml" href="/vite.svg" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Vite + React</title>
          <link href="fonts/mont/stylesheet.css" rel="stylesheet" type="text/css" />
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="/src/main.jsx"></script>
        </body>
      </html>
    `);
    res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
  });

  // API маршрут
  app.get('/api/hello', (req, res) => {
    res.json({ message: 'Привет из Express!' });
  });

  // Запуск сервера
  const port = 3000;
  app.listen(port, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${port}`);
  });
}

startServer();
