import { pool } from "../config/db.js";
import fs from "fs";
import path from "path";
import { env } from "../config/env.js";

export async function getList(userId: number) {
  const [rows] = await pool.query(
    `SELECT a.*, u.nickname as creator_name,
            (SELECT COUNT(*) FROM photos p WHERE p.album_id = a.id) as photo_count
     FROM albums a JOIN users u ON a.created_by = u.id
     WHERE a.created_by = ?
     ORDER BY a.updated_at DESC`,
    [userId]
  );
  return rows as any[];
}

export async function getById(id: number, userId: number) {
  const [rows] = await pool.query(
    `SELECT a.*, u.nickname as creator_name,
            (SELECT COUNT(*) FROM photos p WHERE p.album_id = a.id) as photo_count
     FROM albums a JOIN users u ON a.created_by = u.id
     WHERE a.id = ? AND a.created_by = ?`,
    [id, userId]
  );
  const items = rows as any[];
  return items.length > 0 ? items[0] : null;
}

export async function create(data: { name: string; description?: string; cover_url?: string; created_by: number }) {
  const [result] = await pool.query(
    "INSERT INTO albums (name, description, cover_url, created_by) VALUES (?, ?, ?, ?)",
    [data.name, data.description || null, data.cover_url || null, data.created_by]
  );
  return (result as any).insertId;
}

export async function update(id: number, userId: number, data: { name?: string; description?: string; cover_url?: string }) {
  const fields: string[] = [];
  const values: any[] = [];
  if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
  if (data.description !== undefined) { fields.push("description = ?"); values.push(data.description); }
  if (data.cover_url !== undefined) { fields.push("cover_url = ?"); values.push(data.cover_url); }
  if (fields.length === 0) return;
  values.push(id, userId);
  await pool.query(`UPDATE albums SET ${fields.join(", ")} WHERE id = ? AND created_by = ?`, values);
}

export async function remove(id: number, userId: number) {
  // Get all photos in this album
  const [photos] = await pool.query("SELECT image_url FROM photos WHERE album_id = ?", [id]);
  // Delete physical files
  for (const photo of photos as any[]) {
    if (photo.image_url) {
      const filePath = path.join(env.upload.dir, "..", photo.image_url);
      fs.unlink(filePath, () => {});
    }
  }
  // Move photos out of album first
  await pool.query("UPDATE photos SET album_id = NULL WHERE album_id = ?", [id]);
  await pool.query("DELETE FROM albums WHERE id = ? AND created_by = ?", [id, userId]);
}

export async function getPhotos(albumId: number, userId: number) {
  const [rows] = await pool.query(
    `SELECT p.*, u.nickname as user_nickname FROM photos p
     JOIN users u ON p.user_id = u.id
     WHERE p.album_id = ? AND p.user_id = ?
     ORDER BY p.created_at DESC`,
    [albumId, userId]
  );
  return rows as any[];
}