import express from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/upload.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireStudent } from '../middlewares/role.middleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// SECURED: Only logged-in students can upload files
router.post('/upload', requireAuth, upload.single('examFile'), UploadController.handleFileUpload);

export default router;