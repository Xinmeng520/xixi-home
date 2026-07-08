import { Router } from 'express';
import * as photoCtrl from '../controllers/photo.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';

const router = Router();

router.get('/', authMiddleware, photoCtrl.list);
router.post('/', authMiddleware, uploadImage.array('photos', 9), photoCtrl.upload);
router.delete('/:id', authMiddleware, photoCtrl.remove);

export default router;
