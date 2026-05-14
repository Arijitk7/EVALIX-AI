import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// FRAUD DETECTION SERVICE
// ============================================================================
export const FraudService = {

  /**
   * Analyze submission for fraud indicators
   * Returns an array of fraud flags
   */
  async detectFraud(submissionId, timingData, answers) {
    const flags = [];

    // 1. Suspicious Timing — completed too fast (< 60 seconds for descriptive)
    if (timingData) {
      const durationSeconds = timingData.durationSeconds || 0;
      const questionCount = answers.length;
      const avgSecondsPerQuestion = durationSeconds / Math.max(questionCount, 1);

      if (avgSecondsPerQuestion < 30 && questionCount > 1) {
        flags.push({
          type: 'SUSPICIOUS_TIMING',
          severity: 'HIGH',
          detail: `Average ${Math.round(avgSecondsPerQuestion)}s per question — abnormally fast`,
        });
      }
    }

    // 2. Check OCR inconsistency across multiple uploaded images
    const uploadAnswers = answers.filter(a => a.file_url && a.ocr_text);
    if (uploadAnswers.length > 1) {
      const wordCounts = uploadAnswers.map(a => a.ocr_text.split(/\s+/).length);
      const avg = wordCounts.reduce((s, n) => s + n, 0) / wordCounts.length;
      const variance = wordCounts.reduce((s, n) => s + Math.pow(n - avg, 2), 0) / wordCounts.length;
      
      if (variance > avg * avg * 2) {
        flags.push({
          type: 'WRITING_INCONSISTENCY',
          severity: 'MEDIUM',
          detail: 'High variance in writing volume across pages — possible proxy submission',
        });
      }
    }

    // 3. Multiple high-confidence answers with mismatched OCR quality
    const blurryAnswers = answers.filter(a => a.ocr_quality === 'poor' || a.ocr_quality === 'blurry');
    if (blurryAnswers.length > uploadAnswers.length * 0.5 && uploadAnswers.length > 0) {
      flags.push({
        type: 'IMAGE_QUALITY_ANOMALY',
        severity: 'LOW',
        detail: `${blurryAnswers.length}/${uploadAnswers.length} images have poor quality`,
      });
    }

    if (flags.length > 0) {
      await prisma.submission.update({
        where: { id: submissionId },
        data: { fraud_flags: flags },
      });
    }

    return flags;
  },
};
