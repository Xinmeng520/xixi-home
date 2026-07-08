import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as homeService from '../services/home.service.js';
import { success, fail } from '../utils/response.js';

export async function home(req: AuthRequest, res: Response) {
  try {
    const data = await homeService.getHomeData();
    success(res, data);
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}
