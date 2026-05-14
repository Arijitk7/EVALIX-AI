import { PrismaClient } from '@prisma/client';
import { ocrAgent } from '../agents/ocrAgent.js';
import { dualConsensusAgent } from '../agents/dualConsensusAgent.js';
import { selfVerificationAgent } from '../agents/selfVerificationAgent.js';
import { plagiarismAgent } from '../agents/plagiarismAgent.js';
import { ragAgent } from '../agents/ragAgent.js';
import { vivaAgent } from '../agents/vivaAgent.js';
import { AuditService } from './audit.service.js';
import { NotificationService } from './notification.service.js';
import { FraudService } from './fraud.service.js';

const prisma = new PrismaClient();

const cleanText = (rawText) => {
  if (!rawText) return '';
  return rawText.replace(/\s+/g, ' ').trim();
};

// ============================================================================
// FULL AI EVALUATION PIPELINE
// ============================================================================
export const AiEvaluationService = {

  async evaluateBackground(submissionId, assignment, studentAnswers, timingData = null) {
    console.log(`\n🚀 [Pipeline] Full AI evaluation started for Submission: ${submissionId}`);
    let totalCalculatedScore = 0;
    const allAnswerData = []; // collect for fraud detection

    for (const answer of studentAnswers) {
      try {
        const dbQuestion = assignment.questions.find(q => q.id === answer.questionId);
        if (!dbQuestion) continue;

        const answerMode = answer.answerMode || 'UPLOAD';
        let studentAnswerText = '';
        let ocrQuality = 'good';

        console.log(`\n  📝 [Pipeline] Processing Q${dbQuestion.question_text.substring(0, 30)}... Mode: ${answerMode}`);

        // ====================================================================
        // STEP 1: EXTRACT ANSWER TEXT BY MODE
        // ====================================================================
        if (answerMode === 'UPLOAD' && answer.fileUrl) {
          const ocrResult = await ocrAgent(answer.fileUrl);
          if (ocrResult.error) {
            await prisma.answer.update({
              where: { submission_id_question_id: { submission_id: submissionId, question_id: dbQuestion.id } },
              data: { status: 'FAILED', is_flagged: true, flag_reason: 'OCR_UNCERTAIN' },
            });
            continue;
          }
          studentAnswerText = cleanText(ocrResult.ocrText);
          ocrQuality = ocrResult.ocrQuality;
        } else if (answerMode === 'TYPED' && answer.typedText) {
          studentAnswerText = cleanText(answer.typedText);
        } else if (answerMode === 'CANVAS') {
          // Canvas answers are described by the export PNG via OCR
          if (answer.canvasPngUrl) {
            const ocrResult = await ocrAgent(answer.canvasPngUrl);
            studentAnswerText = ocrResult.ocrText ? cleanText(ocrResult.ocrText) : '[Canvas diagram submitted]';
            ocrQuality = ocrResult.ocrQuality;
          } else {
            studentAnswerText = '[Canvas diagram submitted — no text extraction possible]';
          }
        } else if (answerMode === 'MIXED') {
          const parts = [];
          if (answer.typedText) parts.push(cleanText(answer.typedText));
          if (answer.equationLatex) parts.push(`[Equation: ${answer.equationLatex}]`);
          if (answer.fileUrl) {
            const ocrResult = await ocrAgent(answer.fileUrl);
            if (ocrResult.ocrText) parts.push(cleanText(ocrResult.ocrText));
          }
          studentAnswerText = parts.join('\n\n');
        }

        if (!studentAnswerText) {
          console.warn(`  -> [Pipeline] No answer text for Q ${dbQuestion.id} — skipping`);
          continue;
        }

        // ====================================================================
        // STEP 2: RAG CONTEXT RETRIEVAL
        // ====================================================================
        let ragContext = null;
        try {
          ragContext = await ragAgent.retrieveContext(assignment.id, dbQuestion.question_text + ' ' + studentAnswerText.substring(0, 200));
        } catch {
          console.warn('  -> [RAG] Context retrieval skipped');
        }

        // ====================================================================
        // STEP 3: DUAL CONSENSUS EVALUATION (Gemini + Llama)
        // ====================================================================
        const rubricItems = dbQuestion.rubric_items || [];
        const evalResult = await dualConsensusAgent(
          dbQuestion.question_text,
          studentAnswerText,
          dbQuestion.model_answer,
          dbQuestion.max_marks,
          rubricItems,
          ragContext
        );

        // ====================================================================
        // STEP 4: SELF-VERIFICATION
        // ====================================================================
        const verifyResult = await selfVerificationAgent(
          dbQuestion.question_text,
          studentAnswerText,
          dbQuestion.model_answer,
          dbQuestion.max_marks,
          evalResult,
          rubricItems
        );

        const finalScore = Math.min(Math.max(0, verifyResult.verified_score), dbQuestion.max_marks);

        // ====================================================================
        // STEP 5: PLAGIARISM DETECTION
        // ====================================================================
        const plagResult = await plagiarismAgent(
          assignment.id,
          dbQuestion.id,
          answer.studentId || submissionId,
          studentAnswerText
        );

        // Flag if plagiarism score > 70
        let isFlagged = evalResult.isFlagged;
        let flagReason = evalResult.flagReason;

        if (plagResult.plagiarismScore > 70) {
          isFlagged = true;
          flagReason = 'PLAGIARISM';
        }
        if (plagResult.aiGenerated) {
          isFlagged = true;
          flagReason = flagReason || 'AI_GENERATED_TEXT';
        }
        if (ocrQuality === 'poor' || ocrQuality === 'blurry') {
          isFlagged = true;
          flagReason = flagReason || 'OCR_UNCERTAIN';
        }

        // ====================================================================
        // STEP 6: VIVA COPILOT (if flagged or weak areas found)
        // ====================================================================
        let vivaQuestions = [];
        const hasWeakAreas = (evalResult.weaknesses?.length || evalResult.missing_concepts?.length);
        if (hasWeakAreas || isFlagged) {
          vivaQuestions = await vivaAgent(
            dbQuestion.question_text,
            studentAnswerText,
            evalResult.weaknesses,
            evalResult.missing_concepts
          );
        }

        totalCalculatedScore += finalScore;
        allAnswerData.push({ ...answer, ocr_text: studentAnswerText, ocr_quality: ocrQuality });

        // ====================================================================
        // STEP 7: UPDATE ANSWER IN DB
        // ====================================================================
        await prisma.answer.update({
          where: { submission_id_question_id: { submission_id: submissionId, question_id: dbQuestion.id } },
          data: {
            ocr_text: studentAnswerText,
            ocr_quality: ocrQuality,
            gemini_score: evalResult.geminiScore,
            llama_score: evalResult.llamaScore,
            score: finalScore,
            confidence_score: evalResult.confidenceScore,
            plagiarism_score: plagResult.plagiarismScore,
            risk_level: plagResult.riskLevel,
            ai_generated: plagResult.aiGenerated,
            is_flagged: isFlagged,
            flag_reason: isFlagged ? flagReason : null,
            self_verified: true,
            ai_feedback: evalResult.ai_feedback,
            strengths: evalResult.strengths,
            weaknesses: evalResult.weaknesses,
            missing_concepts: evalResult.missing_concepts,
            improvement_suggestions: evalResult.improvement_suggestions,
            mark_breakdown: evalResult.mark_breakdown,
            viva_questions: vivaQuestions.length > 0 ? vivaQuestions : null,
            status: isFlagged ? 'FLAGGED' : 'EVALUATED',
          },
        });

        // ====================================================================
        // STEP 8: AUDIT LOG
        // ====================================================================
        await AuditService.logAction('AI_GRADED', submissionId, submissionId, dbQuestion.id, {
          score: finalScore,
          confidence: evalResult.confidenceScore,
          plagiarismScore: plagResult.plagiarismScore,
          selfVerified: true,
          isFlagged,
        });

        console.log(`  ✅ [Pipeline] Q evaluated. Score: ${finalScore}/${dbQuestion.max_marks}, Confidence: ${evalResult.confidenceScore}%, Plagiarism: ${plagResult.plagiarismScore}%`);

      } catch (error) {
        console.error(`  ❌ [Pipeline] Failed for Q ${answer.questionId}:`, error.message);
        await prisma.answer.update({
          where: { submission_id_question_id: { submission_id: submissionId, question_id: answer.questionId } },
          data: { status: 'FAILED' },
        });
      }
    }

    // ========================================================================
    // FINALIZE SUBMISSION
    // ========================================================================
    
    // Fraud detection across all answers
    try {
      await FraudService.detectFraud(submissionId, timingData, allAnswerData);
    } catch {}

    // Check if any answers are flagged → set submission to UNDER_REVIEW
    const flaggedCount = await prisma.answer.count({
      where: { submission_id: submissionId, is_flagged: true },
    });

    const submissionStatus = flaggedCount > 0 ? 'UNDER_REVIEW' : 'GRADED';

    await prisma.submission.update({
      where: { id: submissionId },
      data: { total_score: totalCalculatedScore, status: submissionStatus },
    });

    // Notify student of result
    try {
      const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
        include: {
          student: { select: { email: true, name: true, id: true } },
          assignment: { select: { title: true, id: true } },
        },
      });

      if (submission?.student) {
        const totalMaxMarks = assignment.questions.reduce((s, q) => s + q.max_marks, 0);
        
        await NotificationService.createInApp(
          submission.student.id,
          'RESULT_PUBLISHED',
          `Results Ready: ${submission.assignment.title}`,
          `Your score: ${totalCalculatedScore.toFixed(1)}/${totalMaxMarks}`,
          { assignmentId: submission.assignment.id }
        );

        await NotificationService.sendEmail(
          submission.student.email,
          submission.student.name,
          'RESULT_PUBLISHED',
          {
            title: submission.assignment.title,
            score: totalCalculatedScore.toFixed(1),
            maxMarks: totalMaxMarks,
            assignmentId: submission.assignment.id,
          }
        );
      }
    } catch (notifErr) {
      console.error('[Pipeline] Notification error (non-critical):', notifErr.message);
    }

    console.log(`\n🎉 [Pipeline] Complete for ${submissionId}. Total: ${totalCalculatedScore}, Status: ${submissionStatus}`);
  },
};