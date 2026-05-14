import { SubmissionRepository } from '../repositories/submission.repository.js';
import { McqEvaluationService } from '../services/mcq.evaluator.js';
import { AiEvaluationService } from '../services/ai.evaluator.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const SubmitController = {
  async handleSubmission(req, res) {
    try {
      const { assignmentId, answers, timingData } = req.body;
      const studentId = req.user.id;

      if (!assignmentId || !answers || answers.length === 0) {
        return res.status(400).json({ error: "Missing assignment ID or answers." });
      }

      const assignment = await SubmissionRepository.getAssignmentWithQuestions(assignmentId);
      if (!assignment) return res.status(404).json({ error: "Assignment not found." });

      // Double-submission guard
      const existingSubmission = await SubmissionRepository.checkExistingSubmission(studentId, assignmentId);
      if (existingSubmission) {
        return res.status(400).json({ 
          error: "You have already submitted this assignment.",
          status: existingSubmission.status 
        });
      }

      // Build answer records supporting all modes
      const answersToCreate = answers.map(ans => ({
        question_id: ans.questionId,
        answer_mode: ans.answerMode || 'UPLOAD',
        // UPLOAD mode
        file_url: ans.fileUrl || null,
        // TYPED mode
        typed_text: ans.typedText || null,
        // CANVAS mode
        canvas_json: ans.canvasJson || null,
        canvas_png_url: ans.canvasPngUrl || null,
        // EQUATION
        equation_latex: ans.equationLatex || null,
        // MCQ
        mcq_selected: ans.selectedOption || null,
        status: 'PENDING',
      }));

      const submission = await prisma.submission.create({
        data: {
          student_id: studentId,
          assignment_id: assignmentId,
          status: 'PENDING',
          timing_data: timingData || null,
          answers: { create: answersToCreate },
        },
        include: { answers: true },
      });

      // Attach studentId to answers for plagiarism agent
      const answersWithStudent = answers.map(a => ({ ...a, studentId }));

      if (assignment.type === 'MCQ') {
        const finalScore = await McqEvaluationService.evaluate(submission.id, assignment, answers);
        return res.status(200).json({
          message: "MCQ Graded successfully.",
          status: "GRADED",
          score: finalScore,
        });
      } else {
        // DESCRIPTIVE / MIXED — background pipeline
        AiEvaluationService.evaluateBackground(submission.id, assignment, answersWithStudent, timingData)
          .catch(err => console.error("Critical AI Pipeline Failure:", err));

        return res.status(202).json({
          message: "Submission received. AI Evaluation is processing in the background.",
          status: "PENDING",
          submissionId: submission.id,
        });
      }

    } catch (error) {
      console.error("[Controller] Submission Error:", error);
      return res.status(500).json({ error: "Failed to process submission" });
    }
  }
};