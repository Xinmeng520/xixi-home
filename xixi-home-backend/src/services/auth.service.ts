import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';
import { signToken } from '../utils/jwt.js';
import { UserRow } from '../types/index.js';

export async function login(username: string, password: string) {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  const users = rows as UserRow[];
  if (users.length === 0) throw new Error('用户名或密码错误');
  const user = users[0];
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error('用户名或密码错误');
  const token = signToken({ userId: user.id, username: user.username, role: user.role });
  return {
    token,
    user: { id: user.id, username: user.username, nickname: user.nickname, avatar: user.avatar, role: user.role },
  };
}

export async function getMe(userId: number) {
  const [rows] = await pool.query(
    'SELECT id, username, nickname, avatar, role, created_at FROM users WHERE id = ?',
    [userId]
  );
  const users = rows as UserRow[];
  if (users.length === 0) throw new Error('用户不存在');
  return users[0];
}

export async function changePassword(userId: number, oldPassword: string, newPassword: string) {
  const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
  const users = rows as UserRow[];
  if (users.length === 0) throw new Error('用户不存在');
  const ok = await bcrypt.compare(oldPassword, users[0].password);
  if (!ok) throw new Error('原密码错误');
  const hash = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password = ? WHERE id = ?', [hash, userId]);
}
