import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const SubmissionRepository = {
  
  async getAssignmentWithQuestions(assignmentId) {
    return await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { questions: true }
    });
  },

  async checkExistingSubmission(studentId, assignmentId) {
    return await prisma.submission.findUnique({
      where: {
        assignment_id_student_id: {
          assignment_id: assignmentId,
          student_id: studentId
        }
      }
    });
  },

  async createPendingSubmission(studentId, assignmentId, answers) {
    return await prisma.submission.create({
      data: {
        student_id: studentId,
        assignment_id: assignmentId,
        status: 'PENDING',
        answers: {
          create: answers.map(ans => ({
            question_id: ans.questionId,
            file_url: ans.fileUrl || null,
            mcq_selected: ans.selectedOption || null,
            status: 'PENDING'
          }))
        }
      },
      include: { answers: true }
    });
  },

  async updateAnswerResult(submissionId, questionId, cleanText, score, feedbackString) {
    await prisma.answer.update({
      where: { submission_id_question_id: { submission_id: submissionId, question_id: questionId } },
      data: {
        ocr_text: cleanText,
        score: score,
        ai_feedback: feedbackString, 
        status: 'EVALUATED'
      }
    });
  },

  async markAnswerFailed(submissionId, questionId) {
    await prisma.answer.update({
      where: { submission_id_question_id: { submission_id: submissionId, question_id: questionId } },
      data: { status: 'FAILED' }
    });
  },

  async finalizeSubmissionScore(submissionId, totalScore) {
    await prisma.submission.update({
      where: { id: submissionId },
      data: { total_score: totalScore, status: 'GRADED' }
    });
  },

  async getStudentSubmissionResult(assignmentId, studentId) {
    return await prisma.submission.findUnique({
      where: {
        assignment_id_student_id: {
          assignment_id: assignmentId,
          student_id: studentId
        }
      },
      include: {
        assignment: {
          include: {
            // Now that the test is over, it is safe to send the questions WITH the model_answer
            questions: true 
          }
        },
        answers: true
      }
    });
  }

};