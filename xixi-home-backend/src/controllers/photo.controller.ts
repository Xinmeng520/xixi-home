import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as photoService from '../services/photo.service.js';
import { success, fail } from '../utils/response.js';

export async function list(req: AuthRequest, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 12;
    const result = await photoService.getList(page, pageSize);
    success(res, result);
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}

export async function upload(req: AuthRequest, res: Response) {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return fail(res, 1, '请选择要上传的照片');
    }
    const { caption } = req.body;
    const base = req.protocol + '://' + req.get('host');
    const ids: number[] = [];
    for (const f of files) {
      const url = base + '/uploads/' + f.path.replace(/\\/g, '/');
      const id = await photoService.createPhoto(req.user!.userId, url, caption);
      ids.push(id);
    }
    success(res, { ids }, '上传成功');
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    await photoService.deletePhoto(id, req.user!.userId);
    success(res, null, '删除成功');
  } catch (err) {
    if ((err as Error).message.includes('无权')) {
      return fail(res, 403, (err as Error).message, 403);
    }
    fail(res, 1, (err as Error).message);
  }
}
