import { pool } from '../config/db.js';
import { PhotoRow } from '../types/index.js';

export async function getList(page: number, pageSize: number) {
  const offset = (page - 1) * pageSize;
  const [rows] = await pool.query(
    `SELECT p.*, u.nickname as user_name
     FROM photos p JOIN users u ON p.user_id = u.id
     ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
    [pageSize, offset]
  );
  const [countRows] = await pool.query('SELECT COUNT(*) as total FROM photos');
  return { items: rows as any[], total: (countRows as any[])[0].total };
}

export async function createPhoto(userId: number, imageUrl: string, caption?: string) {
  const [result] = await pool.query(
    'INSERT INTO photos (user_id, image_url, caption) VALUES (?, ?, ?)',
    [userId, imageUrl, caption || null]
  );
  return (result as any).insertId;
}

export async function deletePhoto(id: number, userId: number) {
  const [rows] = await pool.query('SELECT user_id FROM photos WHERE id = ?', [id]);
  const photos = rows as PhotoRow[];
  if (photos.length === 0) throw new Error('照片不存在');
  if (photos[0].user_id !== userId) throw new Error('无权删除他人照片');
  await pool.query('DELETE FROM photos WHERE id = ?', [id]);
}
