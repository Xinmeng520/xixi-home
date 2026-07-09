import { pool } from '../config/db.js';
import { PostRow, PostImageRow, CommentRow, PostDetail, PostListItem } from '../types/index.js';

export async function getList(page: number, pageSize: number) {
  const offset = (page - 1) * pageSize;
  const [rows] = await pool.query(
    `SELECT p.id, p.title, p.content, p.like_count, p.is_pinned, p.created_at,
            u.id as author_id, u.nickname as author_nickname, u.avatar as author_avatar,
            (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count
     FROM posts p
     JOIN users u ON p.author_id = u.id
     ORDER BY p.is_pinned DESC, p.created_at DESC
     LIMIT ? OFFSET ?`,
    [pageSize, offset]
  );
  const items = rows as any[];
  // Batch load images for all posts in ONE query (fix N+1)
  if (items.length > 0) {
    const postIds = items.map((item: any) => item.id);
    const placeholders = postIds.map(() => '?').join(',');
    const [imgs] = await pool.query(
      'SELECT id, post_id, image_url, sort_order FROM post_images WHERE post_id IN (' + placeholders + ') ORDER BY sort_order',
      postIds
    );
    const imagesMap: Record<number, any[]> = {};
    for (const img of imgs as any[]) {
      if (!imagesMap[img.post_id]) imagesMap[img.post_id] = [];
      imagesMap[img.post_id].push(img);
    }
    for (const item of items) {
      item.images = imagesMap[item.id] || [];
    }
  }
  const [countRows] = await pool.query('SELECT COUNT(*) as total FROM posts');
  const total = (countRows as any[])[0].total;

  // Transform to match frontend types
  const transformedItems = items.map((p: any) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    is_pinned: p.is_pinned,
    like_count: p.like_count,
    comment_count: p.comment_count,
    created_at: p.created_at,
    is_liked: false,
    author: { id: p.author_id, nickname: p.author_nickname, avatar: p.author_avatar },
    images: p.images || [],
  }));

  return { items: transformedItems, total };
}

export async function getDetail(id: number) {
  const [rows] = await pool.query(
    `SELECT p.id, p.title, p.content, p.like_count, p.is_pinned, p.created_at,
            u.id as author_id, u.nickname as author_nickname, u.avatar as author_avatar
     FROM posts p JOIN users u ON p.author_id = u.id WHERE p.id = ?`,
    [id]
  );
  const posts = rows as any[];
  if (posts.length === 0) return null;
  const post = posts[0];

  const [images] = await pool.query(
    'SELECT id, image_url, sort_order FROM post_images WHERE post_id = ? ORDER BY sort_order',
    [id]
  );

  const [comments] = await pool.query(
    `SELECT c.id, c.content, c.created_at,
            u.id as author_id, u.nickname as author_nickname, u.avatar as author_avatar
     FROM comments c JOIN users u ON c.author_id = u.id
     WHERE c.post_id = ? ORDER BY c.created_at ASC`,
    [id]
  );

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    is_pinned: post.is_pinned,
    like_count: post.like_count,
    created_at: post.created_at,
    is_liked: false,
    author: { id: post.author_id, nickname: post.author_nickname, avatar: post.author_avatar },
    images: images as PostImageRow[],
    comments: (comments as any[]).map((c: any) => ({
      id: c.id,
      content: c.content,
      created_at: c.created_at,
      author: { id: c.author_id, nickname: c.author_nickname, avatar: c.author_avatar },
    })),
  };
}

export async function createPost(data: { title?: string; content: string; author_id: number; images?: string[]; is_pinned?: number }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO posts (title, content, author_id, is_pinned) VALUES (?, ?, ?, ?)',
      [data.title || null, data.content, data.author_id, data.is_pinned || 0]
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

export async function updatePost(id: number, authorId: number, data: { title?: string; content: string; images?: string[]; is_pinned?: number }) {
  const [rows] = await pool.query('SELECT author_id FROM posts WHERE id = ?', [id]);
  const posts = rows as PostRow[];
  if (posts.length === 0) throw new Error('\u5e16\u5b50\u4e0d\u5b58\u5728');
  if (posts[0].author_id !== authorId) throw new Error('\u65e0\u6743\u7f16\u8f91\u4ed6\u4eba\u5e16\u5b50');
  await pool.query('UPDATE posts SET title = ?, content = ?, is_pinned = ? WHERE id = ?', [data.title || null, data.content, data.is_pinned ?? posts[0].is_pinned, id]);
  if (data.images && data.images.length > 0) {
    await pool.query('DELETE FROM post_images WHERE post_id = ?', [id]);
    for (let i = 0; i < data.images.length; i++) {
      await pool.query('INSERT INTO post_images (post_id, image_url, sort_order) VALUES (?, ?, ?)', [id, data.images[i], i]);
    }
  }
}

export async function deletePost(id: number, authorId: number) {
  const [rows] = await pool.query('SELECT author_id FROM posts WHERE id = ?', [id]);
  const posts = rows as PostRow[];
  if (posts.length === 0) throw new Error('\u5e16\u5b50\u4e0d\u5b58\u5728');
  if (posts[0].author_id !== authorId) throw new Error('\u65e0\u6743\u5220\u9664\u4ed6\u4eba\u5e16\u5b50');
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
      await conn.query('UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?', [postId]);
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
    `SELECT c.id, c.content, c.created_at,
            u.id as author_id, u.nickname as author_nickname, u.avatar as author_avatar
     FROM comments c JOIN users u ON c.author_id = u.id
     WHERE c.post_id = ? ORDER BY c.created_at ASC`,
    [postId]
  );
  return (rows as any[]).map((c: any) => ({
    id: c.id,
    content: c.content,
    created_at: c.created_at,
    author: { id: c.author_id, nickname: c.author_nickname, avatar: c.author_avatar },
  }));
}

export async function addComment(postId: number, authorId: number, content: string) {
  const [posts] = await pool.query('SELECT id FROM posts WHERE id = ?', [postId]);
  if ((posts as any[]).length === 0) throw new Error('帖子不存在');
  const [result] = await pool.query(
    'INSERT INTO comments (post_id, author_id, content) VALUES (?, ?, ?)',
    [postId, authorId, content]
  );
  return (result as any).insertId;
}