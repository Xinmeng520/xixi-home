import { Response } from "express";
import { AuthRequest } from "../types/index.js";
import * as postService from "../services/post.service.js";
import { success, fail } from "../utils/response.js";
import path from "path";

function getRelPath(filePath: string): string {
  const parts = filePath.split(/[\\/]/);
  return parts[parts.length - 3] + "/" + parts[parts.length - 2] + "/" + parts[parts.length - 1];
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
    if (!result) return fail(res, 1, "帖子不存在", 404);
    success(res, result);
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const { title, content, is_pinned } = req.body;
    if (!content) return fail(res, 1, "内容不能为空");
    const images: string[] = [];
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      for (const f of files) {
        images.push("/uploads/" + getRelPath(f.path));
      }
    }
    const id = await postService.createPost({
      title,
      content,
      author_id: req.user!.userId,
      images,
      is_pinned: is_pinned === "1" || is_pinned === 1 ? 1 : 0,
    });
    success(res, { id }, "发布成功");
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const { title, content, is_pinned } = req.body;
    if (!content) return fail(res, 1, "内容不能为空");
    const files = req.files as Express.Multer.File[];
    const newImages: string[] = [];
    if (files && files.length > 0) {
      for (const f of files) {
        newImages.push("/uploads/" + getRelPath(f.path));
      }
    }
    // retainedImages: URLs of existing images to keep (handles deletion on edit)
    let retainedImages: string[] = [];
    if (req.body.retainedImages) {
      const raw = req.body.retainedImages;
      retainedImages = Array.isArray(raw) ? raw : [raw];
    }
    await postService.updatePost(id, req.user!.userId, {
      title,
      content,
      images: (newImages.length > 0 || retainedImages.length > 0) ? [...retainedImages, ...newImages] : undefined,
      is_pinned: is_pinned === "1" || is_pinned === 1 ? 1 : 0,
    });
    success(res, null, "更新成功");
  } catch (err) {
    if ((err as Error).message.includes("无权")) {
      return fail(res, 403, (err as Error).message, 403);
    }
    fail(res, 1, (err as Error).message);
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    await postService.deletePost(id, req.user!.userId);
    success(res, null, "删除成功");
  } catch (err) {
    if ((err as Error).message.includes("无权")) {
      return fail(res, 403, (err as Error).message, 403);
    }
    fail(res, 1, (err as Error).message);
  }
}

export async function togglePin(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const is_pinned = await postService.togglePin(id);
    success(res, { is_pinned }, is_pinned ? "已置顶" : "已取消置顶");
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}

export async function toggleLike(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const result = await postService.toggleLike(id, req.user!.userId);
    success(res, result, result.liked ? "已点赞" : "已取消点赞");
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
    if (!content) return fail(res, 1, "评论内容不能为空");
    const commentId = await postService.addComment(id, req.user!.userId, content);
    success(res, { id: commentId }, "评论成功");
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}

export async function uploadImages(req: AuthRequest, res: Response) {
  try {
    const postId = Number(req.params.id);
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) return fail(res, 1, "请选择图片");
    const { pool } = await import("../config/db.js");
    for (const f of files) {
      const imageUrl = "/uploads/" + getRelPath(f.path);
      await pool.query(
        "INSERT INTO post_images (post_id, image_url, sort_order) VALUES (?, ?, ?)",
        [postId, imageUrl, 0]
      );
    }
    success(res, null, "上传成功");
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}
