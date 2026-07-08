import { Router } from 'express';
import * as homeCtrl from '../controllers/home.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, homeCtrl.home);

export default router;
