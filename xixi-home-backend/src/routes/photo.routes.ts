import { Router } from "express";
import * as photoCtrl from "../controllers/photo.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { uploadPhoto } from "../middleware/upload.js";

const router = Router();

router.get("/", authMiddleware, photoCtrl.list);
router.post("/", authMiddleware, uploadPhoto.array("images", 9), photoCtrl.upload);
router.delete("/:id", authMiddleware, photoCtrl.remove);

export default router;
