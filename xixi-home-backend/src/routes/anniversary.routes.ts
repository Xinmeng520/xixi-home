import { Router } from 'express';
import * as annCtrl from '../controllers/anniversary.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, annCtrl.list);
router.post('/', authMiddleware, annCtrl.create);
router.put('/:id', authMiddleware, annCtrl.update);
router.delete('/:id', authMiddleware, annCtrl.remove);

export default router;
