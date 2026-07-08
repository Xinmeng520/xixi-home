import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('Error:', err.message);
  res.status(500).json({ code: 500, message: err.message || '服务器内部错误', data: null });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ code: 404, message: '接口不存在', data: null });
}
