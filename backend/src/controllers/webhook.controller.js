import { PrismaClient } from '@prisma/client';
import { AuditService } from '../services/audit.service.js';
import { NotificationService } from '../services/notification.service.js';

const prisma = new PrismaClient();

export const WebhookController = {
  /**
   * Handle incoming results from n8n grading agent
   * Payload: { submissionId, results: [{ questionId, score, feedback }], secret }
   */
  async handleN8nGrading(req, res) {
    const { submissionId, results, secret } = req.body;

    // 1. Security Check
    if (secret !== process.env.N8N_WEBHOOK_SECRET) {
      console.warn(`[Webhook] Blocked unauthorized n8n attempt for submission: ${submissionId}`);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      console.log(`[Webhook] Receiving n8n grading results for submission: ${submissionId}`);

      // 2. Atomic update of all answers
      for (const resItem of results) {
        await prisma.answer.update({
          where: {
            submission_id_question_id: {
              submission_id: submissionId,
              question_id: resItem.questionId,
            },
          },
          data: {
            score: resItem.score,
            ai_feedback: resItem.feedback,
            status: 'EVALUATED',
          },
        });
      }

      // 3. Recalculate total score
      const allAnswers = await prisma.answer.findMany({
        where: { submission_id: submissionId },
        select: { score: true },
      });

      const totalScore = allAnswers.reduce((sum, a) => sum + (a.score || 0), 0);

      // 4. Update submission status
      const submission = await prisma.submission.update({
        where: { id: submissionId },
        data: {
          total_score: totalScore,
          status: 'GRADED',
        },
        include: { student: true, assignment: true },
      });

      // 5. Audit Logging
      await AuditService.logAction(
        'AI_GRADED',
        submission.student_id, // In this context, the actor is the "System" but we log against the submission
        submissionId,
        null,
        { agent: 'n8n_grading_agent', totalScore }
      );

      // 6. Notify Student (Optional - depends if release_marks_at is passed)
      await NotificationService.createNotification(
        submission.student_id,
        'SUBMISSION_CONFIRMED',
        'Grading Complete',
        `Your submission for "${submission.assignment.title}" has been processed by our advanced AI agent.`
      );

      return res.status(200).json({ success: true, totalScore });

    } catch (error) {
      console.error('[Webhook] n8n processing error:', error);
      return res.status(500).json({ error: 'Internal processing error' });
    }
  },
};
