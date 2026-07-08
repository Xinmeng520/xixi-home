import { pool } from '../config/db.js';
import { PostRow, PostImageRow, CommentRow, PostDetail, PostListItem } from '../types/index.js';

export async function getList(page: number, pageSize: number) {
  const offset = (page - 1) * pageSize;
  const [rows] = await pool.query(
    `SELECT p.*, u.nickname as author_name, u.avatar as author_avatar,
            (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count
     FROM posts p
     JOIN users u ON p.author_id = u.id
     ORDER BY p.is_pinned DESC, p.created_at DESC
     LIMIT ? OFFSET ?`,
    [pageSize, offset]
  );
  const items = rows as PostListItem[];
  // Batch load images
  for (const item of items) {
    const [imgs] = await pool.query(
      'SELECT id, image_url, sort_order FROM post_images WHERE post_id = ? ORDER BY sort_order',
      [item.id]
    );
    item.images = imgs as PostImageRow[];
  }
  const [countRows] = await pool.query('SELECT COUNT(*) as total FROM posts');
  const total = (countRows as any[])[0].total;
  return { items, total };
}

export async function getDetail(id: number) {
  const [rows] = await pool.query(
    `SELECT p.*, u.nickname as author_name, u.avatar as author_avatar
     FROM posts p JOIN users u ON p.author_id = u.id WHERE p.id = ?`,
    [id]
  );
  const posts = rows as PostRow[];
  if (posts.length === 0) return null;
  const post = posts[0];

  const [images] = await pool.query(
    'SELECT id, image_url, sort_order FROM post_images WHERE post_id = ? ORDER BY sort_order',
    [id]
  );

  const [comments] = await pool.query(
    `SELECT c.*, u.nickname as author_name, u.avatar as author_avatar
     FROM comments c JOIN users u ON c.author_id = u.id
     WHERE c.post_id = ? ORDER BY c.created_at ASC`,
    [id]
  );

  return {
    ...post,
    images: images as PostImageRow[],
    comments: comments as any[],
  } as PostDetail;
}

export async function createPost(data: { title?: string; content: string; author_id: number; images?: string[] }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)',
      [data.title || null, data.content, data.author_id]
    );
    const postId = (result as any).insertId;
    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        await conn.query(
          'INSERT INTO post_images (post_id, image_url, sort_order) VALUES (?, ?, ?)',
          [postId, data.images[i], i]
        );
      }
    }
    await conn.commit();
    return postId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function updatePost(id: number, authorId: number, data: { title?: string; content: string }) {
  const [rows] = await pool.query('SELECT author_id FROM posts WHERE id = ?', [id]);
  const posts = rows as PostRow[];
  if (posts.length === 0) throw new Error('帖子不存在');
  if (posts[0].author_id !== authorId) throw new Error('无权编辑他人帖子');
  await pool.query('UPDATE posts SET title = ?, content = ? WHERE id = ?', [data.title || null, data.content, id]);
}

export async function deletePost(id: number, authorId: number) {
  const [rows] = await pool.query('SELECT author_id FROM posts WHERE id = ?', [id]);
  const posts = rows as PostRow[];
  if (posts.length === 0) throw new Error('帖子不存在');
  if (posts[0].author_id !== authorId) throw new Error('无权删除他人帖子');
  await pool.query('DELETE FROM posts WHERE id = ?', [id]);
}

export async function togglePin(id: number) {
  await pool.query('UPDATE posts SET is_pinned = 1 - is_pinned WHERE id = ?', [id]);
  const [rows] = await pool.query('SELECT is_pinned FROM posts WHERE id = ?', [id]);
  return (rows as any[])[0].is_pinned;
}

export async function toggleLike(postId: number, userId: number) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query(
      'SELECT id FROM likes WHERE post_id = ? AND user_id = ?',
      [postId, userId]
    );
    const likes = rows as any[];
    let liked: boolean;
    if (likes.length > 0) {
      await conn.query('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [postId, userId]);
      await conn.query('UPDATE posts SET like_count = like_count - 1 WHERE id = ?', [postId]);
      liked = false;
    } else {
      await conn.query('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [postId, userId]);
      await conn.query('UPDATE posts SET like_count = like_count + 1 WHERE id = ?', [postId]);
      liked = true;
    }
    const [countRows] = await conn.query('SELECT like_count FROM posts WHERE id = ?', [postId]);
    await conn.commit();
    return { liked, like_count: (countRows as any[])[0].like_count };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function getComments(postId: number) {
  const [rows] = await pool.query(
    `SELECT c.*, u.nickname as author_name, u.avatar as author_avatar
     FROM comments c JOIN users u ON c.author_id = u.id
     WHERE c.post_id = ? ORDER BY c.created_at ASC`,
    [postId]
  );
  return rows as any[];
}

export async function addComment(postId: number, authorId: number, content: string) {
  const [result] = await pool.query(
    'INSERT INTO comments (post_id, author_id, content) VALUES (?, ?, ?)',
    [postId, authorId, content]
  );
  return (result as any).insertId;
}
