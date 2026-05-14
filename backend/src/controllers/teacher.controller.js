import { TeacherRepository } from '../repositories/teacher.repository.js';
import { QuestionGeneratorAgent } from '../agents/generatorAgent.js';
import { AuditService } from '../services/audit.service.js';
import { vivaAgent } from '../agents/vivaAgent.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const TeacherController = {
  
  async getDashboard(req, res) {
    try {
      const teacherId = req.user.id;
      const searchQuery = req.query.search || '';
      const dashboardData = await TeacherRepository.getDashboardOverview(teacherId, searchQuery);
      return res.status(200).json(dashboardData);
    } catch (error) {
      console.error('[Teacher] Dashboard Error:', error);
      return res.status(500).json({ error: 'Failed to load dashboard overview' });
    }
  },

  async getAssignmentView(req, res) {
    try {
      const teacherId = req.user.id;
      const { id } = req.params;
      const data = await TeacherRepository.getAssignmentDashboard(id, teacherId);
      if (!data) return res.status(404).json({ error: 'Assignment not found or unauthorized' });
      return res.status(200).json(data);
    } catch (error) {
      console.error('[Teacher] Assignment View Error:', error);
      return res.status(500).json({ error: 'Failed to load assignment details' });
    }
  },

  async getSubmissionReview(req, res) {
    try {
      const { submissionId } = req.params;
      const submission = await TeacherRepository.getSubmissionDetails(submissionId);
      if (!submission) return res.status(404).json({ error: 'Submission not found' });

      // Log student viewed (teacher reviewing means result was seen)
      await AuditService.logAction('TEACHER_OVERRIDDEN', req.user.id, submissionId, submissionId, {
        action: 'viewed',
      });

      return res.status(200).json({ submission });
    } catch (error) {
      console.error('[Teacher] Submission Review Error:', error);
      return res.status(500).json({ error: 'Failed to load submission' });
    }
  },

  async overrideGrade(req, res) {
    try {
      const { submissionId, answerId } = req.params;
      const { newScore, teacherFeedback } = req.body;
      if (newScore === undefined) return res.status(400).json({ error: 'New score is required' });

      const result = await TeacherRepository.overrideAnswerScore(
        submissionId, answerId, parseFloat(newScore), teacherFeedback
      );

      // Audit log
      await AuditService.logAction('TEACHER_OVERRIDDEN', req.user.id, submissionId, answerId, {
        newScore: parseFloat(newScore),
        newTotalScore: result.newTotalScore,
        hasFeedback: !!teacherFeedback,
      });

      return res.status(200).json({
        message: 'Grade overridden successfully',
        newTotalScore: result.newTotalScore,
      });
    } catch (error) {
      console.error('[Teacher] Override Error:', error);
      return res.status(500).json({ error: 'Failed to override grade' });
    }
  },

  async generateExam(req, res) {
    try {
      const { syllabus, pyqs, instructions, marksDistribution } = req.body;
      if (!syllabus || !marksDistribution) {
        return res.status(400).json({ error: 'Syllabus and Marks Distribution are required.' });
      }
      const generatedQuestions = await QuestionGeneratorAgent.generateQuestions(
        syllabus, pyqs, instructions, marksDistribution
      );
      return res.status(200).json({ success: true, questions: generatedQuestions });
    } catch (error) {
      console.error('[Teacher] AI Generation Error:', error);
      return res.status(500).json({ error: 'Failed to generate questions. Please try again.' });
    }
  },

  // ============================================================================
  // NEW: Get all flagged submissions across all assignments
  // ============================================================================
  async getFlaggedSubmissions(req, res) {
    try {
      const teacherId = req.user.id;
      const { flagReason, page = 1 } = req.query;
      const take = 20;
      const skip = (parseInt(page) - 1) * take;

      const whereClause = {
        assignment: { teacher_id: teacherId },
        answers: { some: { is_flagged: true } },
      };

      if (flagReason) {
        whereClause.answers = { some: { is_flagged: true, flag_reason: flagReason } };
      }

      const flaggedSubmissions = await prisma.submission.findMany({
        where: whereClause,
        include: {
          student: { select: { name: true, email: true, avatar_url: true } },
          assignment: { select: { title: true, subject: true, id: true } },
          answers: {
            where: { is_flagged: true },
            select: {
              id: true,
              flag_reason: true,
              plagiarism_score: true,
              confidence_score: true,
              risk_level: true,
              gemini_score: true,
              llama_score: true,
              question: { select: { question_text: true } },
            },
          },
        },
        orderBy: { submitted_at: 'desc' },
        take,
        skip,
      });

      const total = await prisma.submission.count({ where: whereClause });

      return res.status(200).json({
        flaggedSubmissions,
        pagination: { total, page: parseInt(page), totalPages: Math.ceil(total / take) },
      });
    } catch (error) {
      console.error('[Teacher] Flagged Submissions Error:', error);
      return res.status(500).json({ error: 'Failed to load flagged submissions' });
    }
  },

  // ============================================================================
  // NEW: Approve AI Decision
  // ============================================================================
  async approveAI(req, res) {
    try {
      const { submissionId, answerId } = req.params;

      await prisma.answer.update({
        where: { id: answerId },
        data: { teacher_approved: true, is_flagged: false },
      });

      await AuditService.logAction('TEACHER_APPROVED', req.user.id, submissionId, answerId, {});

      return res.status(200).json({ message: 'AI decision approved' });
    } catch (error) {
      console.error('[Teacher] Approve AI Error:', error);
      return res.status(500).json({ error: 'Failed to approve AI decision' });
    }
  },

  // ============================================================================
  // NEW: Reject AI Decision
  // ============================================================================
  async rejectAI(req, res) {
    try {
      const { submissionId, answerId } = req.params;
      const { reason } = req.body;

      await prisma.answer.update({
        where: { id: answerId },
        data: { teacher_approved: false, teacher_feedback: reason || 'Flagged for manual review' },
      });

      await AuditService.logAction('TEACHER_REJECTED', req.user.id, submissionId, answerId, { reason });

      return res.status(200).json({ message: 'AI decision rejected, flagged for manual review' });
    } catch (error) {
      console.error('[Teacher] Reject AI Error:', error);
      return res.status(500).json({ error: 'Failed to reject AI decision' });
    }
  },

  // ============================================================================
  // NEW: Generate Viva Questions
  // ============================================================================
  async generateViva(req, res) {
    try {
      const { submissionId, answerId } = req.params;

      const answer = await prisma.answer.findUnique({
        where: { id: answerId },
        include: { question: true },
      });

      if (!answer) return res.status(404).json({ error: 'Answer not found' });

      const vivaQuestions = await vivaAgent(
        answer.question.question_text,
        answer.ocr_text || answer.typed_text,
        Array.isArray(answer.weaknesses) ? answer.weaknesses : [],
        Array.isArray(answer.missing_concepts) ? answer.missing_concepts : [],
      );

      await prisma.answer.update({
        where: { id: answerId },
        data: { viva_questions: vivaQuestions },
      });

      await AuditService.logAction('VIVA_GENERATED', req.user.id, submissionId, answerId, {
        questionsCount: vivaQuestions.length,
      });

      return res.status(200).json({ vivaQuestions });
    } catch (error) {
      console.error('[Teacher] Viva Generation Error:', error);
      return res.status(500).json({ error: 'Failed to generate viva questions' });
    }
  },

  // ============================================================================
  // NEW: Trigger External n8n Grading Agent
  // ============================================================================
  async triggerN8nGrading(req, res) {
    try {
      const { submissionId } = req.params;
      const n8nUrl = process.env.N8N_GRADING_WEBHOOK_URL;

      if (!n8nUrl) {
        return res.status(501).json({ error: 'n8n grading pipeline not configured on server' });
      }

      const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
        include: {
          student: true,
          assignment: { include: { questions: true } },
          answers: { include: { question: true } },
        },
      });

      if (!submission) return res.status(404).json({ error: 'Submission not found' });

      // Prepare payload for n8n
      const payload = {
        submissionId: submission.id,
        studentName: submission.student.name,
        assignmentTitle: submission.assignment.title,
        questions: submission.assignment.questions.map(q => {
          const ans = submission.answers.find(a => a.question_id === q.id);
          return {
            id: q.id,
            text: q.question_text,
            modelAnswer: q.model_answer,
            maxMarks: q.max_marks,
            studentAnswer: ans?.ocr_text || ans?.typed_text || '',
            fileUrl: ans?.file_url || null,
          };
        }),
        callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/webhooks/n8n/grading-result`,
        secret: process.env.N8N_WEBHOOK_SECRET,
      };

      // Async call to n8n (we don't wait for grading to finish)
      fetch(n8nUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(err => console.error('[Teacher] n8n Trigger failed:', err));

      // Update status to indicate external processing
      await prisma.submission.update({
        where: { id: submissionId },
        data: { status: 'UNDER_REVIEW' },
      });

      return res.status(202).json({ message: 'Grading triggered via n8n agent' });
    } catch (error) {
      console.error('[Teacher] n8n Trigger Error:', error);
      return res.status(500).json({ error: 'Failed to trigger n8n grading' });
    }
  },
};