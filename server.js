import express from 'express';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const startServer = async () => {
  const app = express();

  const vite = await createViteServer({
    root: __dirname,
    server: { middlewareMode: 'html' }
  });

  app.use(vite.middlewares);

  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl;
      let template = await vite.transformIndexHtml(url, `
        <!DOCTYPE html>
        <html>
          <head><title>Салон красоты BLISS</title></head>
          <body><div id="root"></div></body>
        </html>
      `);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      console.error(e);
      res.status(500).end(e.message);
    }
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
  });
};

startServer();
