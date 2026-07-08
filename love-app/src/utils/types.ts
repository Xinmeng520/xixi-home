export interface User { id: number; username: string; nickname: string; }
export interface Anniversary { id: number; title: string; date: string; is_recurring: number; days_left?: number; }
export interface PostAuthor { id: number; nickname: string; }
export interface PostImage { image_url: string; }
export interface Post { id: number; title: string; content: string; is_pinned: number; like_count: number; comment_count: number; author: PostAuthor; images: PostImage[]; created_at: string; is_liked?: boolean; }
export interface Photo { id: number; image_url: string; caption: string; user: PostAuthor; }
export interface HomeData { days_together: number; next_anniversary: { title: string; date: string; days_left: number; } | null; recent_photos: Photo[]; latest_posts: Post[]; }
