import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as postService from '../services/post.service.js';
import { success, fail } from '../utils/response.js';
import { env } from '../config/env.js';

function getBaseUrl(req: AuthRequest) {
  return req.protocol + '://' + req.get('host');
}

export async function list(req: AuthRequest, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const result = await postService.getList(page, pageSize);
    success(res, result);
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}

export async function detail(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const result = await postService.getDetail(id);
    if (!result) return fail(res, 1, '帖子不存在', 404);
    success(res, result);
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const { title, content } = req.body;
    if (!content) return fail(res, 1, '内容不能为空');
    const images: string[] = [];
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      const base = getBaseUrl(req);
      for (const f of files) {
        images.push(base + '/uploads/' + f.path.replace(/\\/g, '/'));
      }
    }
    const id = await postService.createPost({
      title,
      content,
      author_id: req.user!.userId,
      images,
    });
    success(res, { id }, '发布成功');
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const { title, content } = req.body;
    if (!content) return fail(res, 1, '内容不能为空');
    await postService.updatePost(id, req.user!.userId, { title, content });
    success(res, null, '更新成功');
  } catch (err) {
    if ((err as Error).message.includes('无权')) {
      return fail(res, 403, (err as Error).message, 403);
    }
    fail(res, 1, (err as Error).message);
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    await postService.deletePost(id, req.user!.userId);
    success(res, null, '删除成功');
  } catch (err) {
    if ((err as Error).message.includes('无权')) {
      return fail(res, 403, (err as Error).message, 403);
    }
    fail(res, 1, (err as Error).message);
  }
}

export async function togglePin(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const is_pinned = await postService.togglePin(id);
    success(res, { is_pinned }, is_pinned ? '已置顶' : '已取消置顶');
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}

export async function toggleLike(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const result = await postService.toggleLike(id, req.user!.userId);
    success(res, result, result.liked ? '已点赞' : '已取消点赞');
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}

export async function getComments(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const result = await postService.getComments(id);
    success(res, result);
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}

export async function addComment(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const { content } = req.body;
    if (!content) return fail(res, 1, '评论内容不能为空');
    const commentId = await postService.addComment(id, req.user!.userId, content);
    success(res, { id: commentId }, '评论成功');
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}
