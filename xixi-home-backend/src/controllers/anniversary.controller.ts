import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as annService from '../services/anniversary.service.js';
import { success, fail } from '../utils/response.js';

export async function list(req: AuthRequest, res: Response) {
  try {
    const items = await annService.getList();
    success(res, items);
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const { title, date, is_recurring, icon } = req.body;
    if (!title || !date) {
      return fail(res, 1, '标题和日期不能为空');
    }
    const id = await annService.create({
      title,
      date,
      is_recurring: is_recurring !== undefined ? Number(is_recurring) : 1,
      icon,
      created_by: req.user!.userId,
    });
    success(res, { id }, '创建成功');
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const { title, date, is_recurring, icon } = req.body;
    if (!title || !date) {
      return fail(res, 1, '标题和日期不能为空');
    }
    await annService.update(id, {
      title,
      date,
      is_recurring: is_recurring !== undefined ? Number(is_recurring) : 1,
      icon,
    });
    success(res, null, '更新成功');
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    await annService.remove(id);
    success(res, null, '删除成功');
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}
