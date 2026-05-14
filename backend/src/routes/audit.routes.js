import express from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { AuditService } from '../services/audit.service.js';

const router = express.Router();

// GET /api/audit/:submissionId — Teacher views full audit trail
router.get('/:submissionId', requireAuth, async (req, res) => {
  try {
    const trail = await AuditService.getSubmissionAuditTrail(req.params.submissionId);
    res.status(200).json({ trail });
  } catch (error) {
    console.error('[Audit] Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch audit trail' });
  }
});

export default router;
