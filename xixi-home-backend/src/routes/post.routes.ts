import { Router } from "express";
import * as postCtrl from "../controllers/post.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { uploadImage } from "../middleware/upload.js";

const router = Router();

router.get("/", authMiddleware, postCtrl.list);
router.get("/:id", authMiddleware, postCtrl.detail);
router.post("/", authMiddleware, uploadImage.array("images", 9), postCtrl.create);
router.put("/:id", authMiddleware, uploadImage.array("images", 9), postCtrl.update);
router.delete("/:id", authMiddleware, postCtrl.remove);
router.post("/:id/pin", authMiddleware, postCtrl.togglePin);
router.post("/:id/like", authMiddleware, postCtrl.toggleLike);
router.get("/:id/comments", authMiddleware, postCtrl.getComments);
router.post("/:id/comments", authMiddleware, postCtrl.addComment);

export default router;
