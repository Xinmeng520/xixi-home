import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { env } from "../config/env.js";

function createUploadMiddleware(subFolder: string) {
  const storage = multer.diskStorage({
    destination(req, file, cb) {
      const dateDir = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const dir = path.join(env.upload.dir, subFolder, dateDir);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename(req, file, cb) {
      const mimeToExt: Record<string, string> = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/gif": ".gif",
        "image/webp": ".webp",
        "image/bmp": ".bmp",
      };
      const origExt = path.extname(file.originalname).toLowerCase();
      const validExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
      const ext = mimeToExt[file.mimetype] || (validExts.includes(origExt) ? origExt : ".png");
      const finalExt = ext === ".jpeg" ? ".jpg" : ext;
      cb(null, uuidv4() + finalExt);
    },
  });

  const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("仅支持图片文件格式"));
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: env.upload.maxFileSize },
  });
}

export const uploadImage = {
  array: (field: string, maxCount: number) => createUploadMiddleware("posts").array(field, maxCount),
  single: (field: string) => createUploadMiddleware("posts").single(field),
};

export const uploadPhoto = {
  array: (field: string, maxCount: number) => createUploadMiddleware("photos").array(field, maxCount),
  single: (field: string) => createUploadMiddleware("photos").single(field),
};

export const uploadAvatar = {
  single: (field: string) => createUploadMiddleware("avatars").single(field),
};

// Multer error handler middleware
export function uploadErrorHandler(err: any, _req: any, res: any, next: any) {
  if (err) {
    const message = err.code === "LIMIT_FILE_SIZE"
      ? "文件过大，最大支持10MB"
      : err.code === "LIMIT_FILE_COUNT"
      ? "文件数量超出限制"
      : err.code === "LIMIT_UNEXPECTED_FILE"
      ? "意外的文件字段: " + err.field
      : err.message || "上传失败";
    res.status(400).json({ code: 400, message, data: null });
  } else {
    next();
  }
}
