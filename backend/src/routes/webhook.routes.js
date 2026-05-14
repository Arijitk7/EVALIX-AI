import express from 'express';
import { WebhookController } from '../controllers/webhook.controller.js';

const router = express.Router();

/**
 * n8n Webhook Endpoint
 * Receives external grading results from the n8n agent pipeline.
 * Securely updates the submission status and scores.
 */
router.post('/n8n/grading-result', WebhookController.handleN8nGrading);

export default router;
