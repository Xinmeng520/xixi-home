import { Router } from 'express';
import * as authCtrl from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/login', authCtrl.login);
router.get('/me', authMiddleware, authCtrl.me);
router.put('/password', authMiddleware, authCtrl.changePassword);

export default router;
