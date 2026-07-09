import { Response } from "express";
import { AuthRequest } from "../types/index.js";
import * as authService from "../services/auth.service.js";
import { success, fail } from "../utils/response.js";

function getRelPath(filePath: string): string {
  const parts = filePath.split(/[\\/]/);
  return parts[parts.length - 3] + "/" + parts[parts.length - 2] + "/" + parts[parts.length - 1];
}

export async function login(req: AuthRequest, res: Response) {
  try {
    const { username, password } = req.body;
    if (!username || password === undefined || password === null) {
      return fail(res, 1, "用户名和密码不能为空");
    }
    const result = await authService.login(username, password);
    success(res, result);
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}

export async function me(req: AuthRequest, res: Response) {
  try {
    const user = await authService.getMe(req.user!.userId);
    success(res, user);
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const { nickname, avatar } = req.body;
    const user = await authService.updateProfile(req.user!.userId, { nickname, avatar });
    success(res, user, "更新成功");
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}

export async function uploadAvatar(req: AuthRequest, res: Response) {
  try {
    if (!req.file) return fail(res, 1, "请选择头像图片");
    const avatarUrl = "/uploads/" + getRelPath(req.file.path);
    const user = await authService.updateProfile(req.user!.userId, { avatar: avatarUrl });
    success(res, { avatar: avatarUrl, user }, "头像上传成功");
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}

export async function changePassword(req: AuthRequest, res: Response) {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return fail(res, 1, "密码不能为空");
    }
    await authService.changePassword(req.user!.userId, oldPassword, newPassword);
    success(res, null, "密码修改成功");
  } catch (err) {
    fail(res, 1, (err as Error).message);
  }
}