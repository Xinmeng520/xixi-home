import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { pool } from './config/db.js';
import { initDatabase } from './utils/initData.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '..', env.upload.dir)));

// API routes
app.use('/api', routes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ code: 0, message: 'ok', data: { status: 'running' } });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function start() {
  try {
    // Test DB connection
    const conn = await pool.getConnection();
    console.log('MySQL connected successfully');
    conn.release();

    // Init data
    await initDatabase();

    app.listen(env.port, () => {
      console.log(`熙熙小窝后端服务已启动: http://localhost:${env.port}`);
      console.log(`API 地址: http://localhost:${env.port}/api`);
    });
  } catch (err) {
    console.error('启动失败:', (err as Error).message);
    process.exit(1);
  }
}

start();

export default app;
