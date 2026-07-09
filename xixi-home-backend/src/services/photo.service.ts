import { pool } from "../config/db.js";
import { PhotoRow } from "../types/index.js";
import fs from "fs";
import path from "path";
import { env } from "../config/env.js";

export async function getList(page: number, pageSize: number) {
  const offset = (page - 1) * pageSize;
  const [rows] = await pool.query(
    `SELECT p.id, p.image_url, p.caption, p.album_id, p.created_at,
            u.id as user_id, u.nickname as user_nickname
     FROM photos p JOIN users u ON p.user_id = u.id
     ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
    [pageSize, offset]
  );
  const photos = rows as any[];
  const [countRows] = await pool.query("SELECT COUNT(*) as total FROM photos");
  const total = (countRows as any[])[0].total;
  return { items: photos, total };
}

export async function createPhoto(userId: number, imageUrl: string, caption?: string, albumId?: number) {
  const [result] = await pool.query(
    "INSERT INTO photos (user_id, image_url, caption, album_id) VALUES (?, ?, ?, ?)",
    [userId, imageUrl, caption || null, albumId || null]
  );
  return (result as any).insertId;
}

export async function deletePhoto(id: number, userId: number) {
  const [rows] = await pool.query("SELECT user_id, image_url FROM photos WHERE id = ?", [id]);
  const photos = rows as any[];
  if (photos.length === 0) throw new Error("照片不存在");
  if (photos[0].user_id !== userId) throw new Error("无权删除他人照片");
  // Delete physical file
  const imageUrl = photos[0].image_url;
  if (imageUrl) {
    const filePath = path.join(env.upload.dir, "..", imageUrl);
    fs.unlink(filePath, () => {}); // ignore error if file not found
  }
  await pool.query("DELETE FROM photos WHERE id = ?", [id]);
}