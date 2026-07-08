import { Request } from 'express';

export interface AuthUser {
  userId: number;
  username: string;
  role: number;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface UserRow {
  id: number;
  username: string;
  password: string;
  nickname: string;
  avatar: string | null;
  role: number;
  created_at: Date;
  updated_at: Date;
}

export interface AnniversaryRow {
  id: number;
  title: string;
  date: string;
  is_recurring: number;
  icon: string | null;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface PostRow {
  id: number;
  title: string | null;
  content: string;
  author_id: number;
  is_pinned: number;
  like_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface PostImageRow {
  id: number;
  post_id: number;
  image_url: string;
  sort_order: number;
}

export interface CommentRow {
  id: number;
  post_id: number;
  author_id: number;
  content: string;
  created_at: Date;
}

export interface LikeRow {
  id: number;
  post_id: number;
  user_id: number;
  created_at: Date;
}

export interface PhotoRow {
  id: number;
  user_id: number;
  image_url: string;
  caption: string | null;
  created_at: Date;
}

export interface PostDetail extends PostRow {
  images: PostImageRow[];
  comments: (CommentRow & { author_name: string; author_avatar: string | null })[];
  author_name: string;
  author_avatar: string | null;
}

export interface PostListItem extends PostRow {
  author_name: string;
  author_avatar: string | null;
  images: PostImageRow[];
  comment_count: number;
}
