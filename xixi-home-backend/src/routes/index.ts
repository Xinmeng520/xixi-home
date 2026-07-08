import { Router } from 'express';
import authRoutes from './auth.routes.js';
import anniversaryRoutes from './anniversary.routes.js';
import postRoutes from './post.routes.js';
import photoRoutes from './photo.routes.js';
import homeRoutes from './home.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/anniversaries', anniversaryRoutes);
router.use('/posts', postRoutes);
router.use('/photos', photoRoutes);
router.use('/home', homeRoutes);

export default router;
