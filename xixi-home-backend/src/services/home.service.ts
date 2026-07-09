import { pool } from "../config/db.js";
import { env } from "../config/env.js";

// Parse date from various MySQL return types (Date object, ISO string, or "YYYY-DD-MM" string)
// Always returns a local Date at midnight with the correct calendar date
function parseDate(input: any): Date {
  if (!input) return new Date();
  let y: number, m: number, d: number;
  if (input instanceof Date) {
    // MySQL driver interprets DATE as UTC midnight. Shift to local midnight by adding tz offset.
    const offsetMs = input.getTimezoneOffset() * 60000;
    const local = new Date(input.getTime() + offsetMs);
    y = local.getFullYear();
    m = local.getMonth();
    d = local.getDate();
  } else {
    const str = String(input);
    // Handle both "YYYY-MM-DD" and "YYYY-MM-DDTHH:MM:SS.sssZ" formats
    const parts = str.slice(0, 10).split("-");
    y = Number(parts[0]);
    m = Number(parts[1]) - 1;
    d = Number(parts[2]);
  }
  return new Date(y, m, d);
}

function todayLocal(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

export async function getHomeData() {
  const relDate = parseDate(env.relationshipDate);
  const today = todayLocal();
  const daysTogether = daysBetween(relDate, today);

  // Anniversaries - find next upcoming one
  const [annRows] = await pool.query("SELECT * FROM anniversaries ORDER BY date ASC");
  const anniversaries = annRows as any[];
  let nextAnniversary: any = null;
  let minDays = Infinity;

  for (const ann of anniversaries) {
    const annDate = parseDate(ann.date);
    const thisYear = today.getFullYear();
    let nextOccurrence: Date;
    if (ann.is_recurring === 1) {
      nextOccurrence = new Date(thisYear, annDate.getMonth(), annDate.getDate());
      if (nextOccurrence.getTime() < today.getTime()) {
        nextOccurrence = new Date(thisYear + 1, annDate.getMonth(), annDate.getDate());
      }
    } else {
      nextOccurrence = annDate;
    }
    const daysLeft = daysBetween(today, nextOccurrence);
    if (daysLeft >= 0 && daysLeft < minDays) {
      minDays = daysLeft;
      nextAnniversary = { title: ann.title, date: ann.date, days_left: daysLeft, is_recurring: ann.is_recurring };
    }
  }

  // Posts
  const [posts] = await pool.query(
    `SELECT p.id, p.title, p.content, p.like_count, p.is_pinned, p.created_at,
            u.id as author_id, u.nickname as author_nickname, u.avatar as author_avatar,
            (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count
     FROM posts p JOIN users u ON p.author_id = u.id
     ORDER BY p.is_pinned DESC, p.created_at DESC LIMIT 5`
  );
  const postIds = (posts as any[]).map((p) => p.id);
  let imagesMap: Record<number, any[]> = {};
  if (postIds.length > 0) {
    const placeholders = postIds.map(() => "?").join(",");
    const [imgs] = await pool.query(
      `SELECT post_id, image_url FROM post_images WHERE post_id IN (${placeholders}) ORDER BY sort_order ASC`,
      postIds
    );
    for (const img of imgs as any[]) {
      if (!imagesMap[img.post_id]) imagesMap[img.post_id] = [];
      imagesMap[img.post_id].push({ image_url: img.image_url });
    }
  }
  const latestPosts = (posts as any[]).map((p: any) => ({
    id: p.id, title: p.title, content: p.content, is_pinned: p.is_pinned,
    like_count: p.like_count, comment_count: p.comment_count, created_at: p.created_at,
    is_liked: false, author: { id: p.author_id, nickname: p.author_nickname, avatar: p.author_avatar },
    images: imagesMap[p.id] || [],
  }));

  // Photos
  const [photos] = await pool.query(
    `SELECT p.id, p.image_url, p.caption, p.created_at, u.id as user_id, u.nickname as user_nickname
     FROM photos p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC LIMIT 8`
  );
  const recentPhotos = (photos as any[]).map((p: any) => ({
    id: p.id, image_url: p.image_url, caption: p.caption, created_at: p.created_at,
    user: { id: p.user_id, nickname: p.user_nickname },
  }));

  return { days_together: daysTogether, next_anniversary: nextAnniversary, latest_posts: latestPosts, recent_photos: recentPhotos };
}
