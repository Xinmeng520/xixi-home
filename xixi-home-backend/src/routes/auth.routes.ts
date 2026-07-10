import { Router } from "express";
import * as authCtrl from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { uploadImage, uploadAvatar, uploadErrorHandler } from "../middleware/upload.js";

const router = Router();

router.post("/login", authCtrl.login);
router.get("/me", authMiddleware, authCtrl.me);
router.put("/profile", authMiddleware, authCtrl.updateProfile);
router.post("/avatar", authMiddleware, uploadAvatar.single("avatar"), uploadErrorHandler, authCtrl.uploadAvatar);
router.post("/avatar-base64", authMiddleware, authCtrl.uploadAvatarBase64);
router.put("/password", authMiddleware, authCtrl.changePassword);

export default router;
