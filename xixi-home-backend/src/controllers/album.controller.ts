import { Response } from "express";
import { AuthRequest } from "../types/index.js";
import * as albumService from "../services/album.service.js";
import { success, fail } from "../utils/response.js";

export async function list(req: AuthRequest, res: Response) {
  try {
    const result = await albumService.getList(req.user!.userId);
    success(res, result);
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}

export async function detail(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const result = await albumService.getById(id, req.user!.userId);
    if (!result) return fail(res, 1, "相册不存在", 404);
    success(res, result);
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const { name, description, cover_url } = req.body;
    if (!name || !name.trim()) return fail(res, 1, "相册名称不能为空");
    const id = await albumService.create({ name: name.trim(), description, cover_url, created_by: req.user!.userId });
    success(res, { id }, "创建成功");
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const { name, description, cover_url } = req.body;
    await albumService.update(id, req.user!.userId, { name: name?.trim(), description, cover_url });
    success(res, null, "更新成功");
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    await albumService.remove(id, req.user!.userId);
    success(res, null, "删除成功");
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}

export async function photos(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const result = await albumService.getPhotos(id, req.user!.userId);
    success(res, result);
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}