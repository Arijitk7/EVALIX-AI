import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { AuthController } from '../controllers/auth.controller.js';

const router = Router();

// POST /api/auth/sync
router.post('/sync', requireAuth, AuthController.syncUser);

export default router;