import { SubmissionRepository } from '../repositories/submission.repository.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const McqEvaluationService = {
  
  async evaluate(submissionId, assignment, studentAnswers) {
    if (!Array.isArray(studentAnswers)) {
      throw new Error("Student answers must be an iterable array.");
    }
    let totalScore = 0;

    for (const answer of studentAnswers) {
      // Find the correct question from the assignment data
      const dbQuestion = assignment.questions.find(q => q.id === answer.questionId);
      
      if (!dbQuestion) continue;

      // Check if correct
      let isCorrect = false;
      if (answer.selectedOption === dbQuestion.mcq_answer) {
        totalScore += dbQuestion.max_marks;
        isCorrect = true;
      }

      // Update individual answer record
      await prisma.answer.update({
        where: { 
          submission_id_question_id: { submission_id: submissionId, question_id: dbQuestion.id } 
        },
        data: {
          score: isCorrect ? dbQuestion.max_marks : 0,
          status: 'EVALUATED'
        }
      });
    }

    // Finalize the overall submission score
    await SubmissionRepository.finalizeSubmissionScore(submissionId, totalScore);
    return totalScore;
  }
};