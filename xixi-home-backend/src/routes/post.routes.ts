import { Router } from "express";
import * as postCtrl from "../controllers/post.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { uploadImage, uploadErrorHandler } from "../middleware/upload.js";

const router = Router();

router.get("/", authMiddleware, postCtrl.list);
router.get("/:id", authMiddleware, postCtrl.detail);
// Create post - supports both JSON (mini-program) and FormData (H5 with images)
router.post("/", authMiddleware, uploadImage.array("images", 9), uploadErrorHandler, postCtrl.create);
// Update post - supports both JSON (mini-program) and FormData (H5 with images)
router.put("/:id", authMiddleware, uploadImage.array("images", 9), uploadErrorHandler, postCtrl.update);
router.delete("/:id", authMiddleware, postCtrl.remove);
router.post("/:id/pin", authMiddleware, postCtrl.togglePin);
router.post("/:id/like", authMiddleware, postCtrl.toggleLike);
router.get("/:id/comments", authMiddleware, postCtrl.getComments);
router.post("/:id/comments", authMiddleware, postCtrl.addComment);
// Dedicated image upload for mini-program (after post creation)
router.post("/:id/images", authMiddleware, uploadImage.array("images", 9), uploadErrorHandler, postCtrl.uploadImages);

export default router;
