import { pool } from '../config/db.js';
import { env } from '../config/env.js';

export async function getHomeData() {
  // daysTogether
  const relDate = new Date(env.relationshipDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysTogether = Math.floor((today.getTime() - relDate.getTime()) / 86400000);

  // nextAnniversary
  const todayStr = today.toISOString().slice(0, 10);
  const [annRows] = await pool.query('SELECT * FROM anniversaries ORDER BY date ASC');
  const anniversaries = annRows as any[];
  let nextAnniversary: any = null;
  let minDiff = Infinity;
  for (const ann of anniversaries) {
    const annDate = new Date(ann.date);
    const thisYear = today.getFullYear();
    const nextOccurrence = new Date(thisYear, annDate.getMonth(), annDate.getDate());
    if (nextOccurrence.getTime() < today.getTime()) {
      nextOccurrence.setFullYear(thisYear + 1);
    }
    const diff = Math.floor((nextOccurrence.getTime() - today.getTime()) / 86400000);
    if (diff < minDiff) {
      minDiff = diff;
      nextAnniversary = {
        title: ann.title,
        date: ann.date,
        icon: ann.icon,
        days_left: diff,
        next_date: nextOccurrence.toISOString().slice(0, 10),
      };
    }
  }

  // latestPosts
  const [posts] = await pool.query(
    `SELECT p.id, p.title, p.content, p.like_count, p.created_at,
            u.nickname as author_name, u.avatar as author_avatar
     FROM posts p JOIN users u ON p.author_id = u.id
     ORDER BY p.is_pinned DESC, p.created_at DESC LIMIT 5`
  );

  // recentPhotos
  const [photos] = await pool.query(
    `SELECT p.id, p.image_url, p.caption, p.created_at, u.nickname as user_name
     FROM photos p JOIN users u ON p.user_id = u.id
     ORDER BY p.created_at DESC LIMIT 8`
  );

  return {
    days_together: daysTogether,
    next_anniversary: nextAnniversary,
    latest_posts: posts as any[],
    recent_photos: photos as any[],
  };
}
