import { pool } from '../config/db.js';
import { AnniversaryRow } from '../types/index.js';

export async function getList() {
  const [rows] = await pool.query('SELECT * FROM anniversaries ORDER BY date ASC');
  return rows as AnniversaryRow[];
}

export async function create(data: { title: string; date: string; is_recurring: number; icon?: string; created_by: number }) {
  const [result] = await pool.query(
    'INSERT INTO anniversaries (title, date, is_recurring, icon, created_by) VALUES (?, ?, ?, ?, ?)',
    [data.title, data.date, data.is_recurring, data.icon || null, data.created_by]
  );
  return (result as any).insertId;
}

export async function update(id: number, data: { title: string; date: string; is_recurring: number; icon?: string }) {
  await pool.query(
    'UPDATE anniversaries SET title = ?, date = ?, is_recurring = ?, icon = ? WHERE id = ?',
    [data.title, data.date, data.is_recurring, data.icon || null, id]
  );
}

export async function remove(id: number) {
  await pool.query('DELETE FROM anniversaries WHERE id = ?', [id]);
}
