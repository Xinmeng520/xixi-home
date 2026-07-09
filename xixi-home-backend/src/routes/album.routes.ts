import { Router } from "express";
import * as albumCtrl from "../controllers/album.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/", authMiddleware, albumCtrl.list);
router.get("/:id", authMiddleware, albumCtrl.detail);
router.post("/", authMiddleware, albumCtrl.create);
router.put("/:id", authMiddleware, albumCtrl.update);
router.delete("/:id", authMiddleware, albumCtrl.remove);
router.get("/:id/photos", authMiddleware, albumCtrl.photos);

export default router;