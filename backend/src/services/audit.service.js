import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// AUDIT SERVICE — Logs every action with actor + timestamp + metadata
// ============================================================================
export const AuditService = {

  async logAction(action, actorId, submissionId, targetId = null, metadata = {}) {
    try {
      // Ensure metadata is a perfectly serializable JSON object
      const safeMetadata = JSON.parse(JSON.stringify(metadata));
      await prisma.auditLog.create({
        data: {
          action,
          actor_id: actorId,
          submission_id: submissionId || null,
          target_id: targetId,
          metadata: safeMetadata,
        },
      });
    } catch (error) {
      // Audit failures should never break main flow
      console.error('[Audit] Failed to log action:', error.message);
    }
  },

  async getSubmissionAuditTrail(submissionId) {
    return await prisma.auditLog.findMany({
      where: { submission_id: submissionId },
      include: {
        actor: {
          select: { id: true, name: true, role: true, avatar_url: true },
        },
      },
      orderBy: { created_at: 'asc' },
    });
  },
};
