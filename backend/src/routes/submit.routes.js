import express from 'express';
import { SubmitController } from '../controllers/submission.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireStudent } from '../middlewares/role.middleware.js';

const router = express.Router();

// SECURED: Only logged-in students can submit tests
router.post('/submit', requireAuth, requireStudent, SubmitController.handleSubmission);

export default router;