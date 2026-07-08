import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';

export async function initDatabase() {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT COUNT(*) as count FROM users');
    const count = (rows as any[])[0].count;
    if (count === 0) {
      const hash = await bcrypt.hash('123456', 10);
      await conn.query(
        'INSERT INTO users (username, password, nickname, role) VALUES (?, ?, ?, ?), (?, ?, ?, ?)',
        ['xixi', hash, '熙熙', 10, 'xiaowo', hash, '小窝', 10]
      );
      const [xixiRows] = await conn.query('SELECT id FROM users WHERE username = ?', ['xixi']);
      const xixiId = (xixiRows as any[])[0].id;
      await conn.query(
        'INSERT INTO anniversaries (title, date, is_recurring, created_by) VALUES (?, ?, ?, ?)',
        ['确定关系日', '2026-05-23', 1, xixiId]
      );
      console.log('Initial data inserted');
    }
  } catch (err) {
    console.log('initDatabase note:', (err as Error).message);
  } finally {
    conn.release();
  }
}
