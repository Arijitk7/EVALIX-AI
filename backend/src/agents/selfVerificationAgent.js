import { GoogleGenAI } from '@google/genai';
import { apiKeyManager } from '../utils/keyManager.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Self-Verification Agent
 * Second AI pass that checks for: missed rubric points, hallucinations, missing deductions
 * Can revise score upward or downward by up to 15%
 */
export const selfVerificationAgent = async (question, studentAnswer, modelAnswer, maxMarks, initialEvaluation, rubricItems = []) => {
  console.log('  -> [SelfVerify] Running second-pass self-verification...');

  const rubricSection = rubricItems?.length
    ? `\nRUBRIC:\n${rubricItems.map(r => `- ${r.concept}: ${r.marks} marks`).join('\n')}`
    : '';

  const prompt = `You are a senior examiner reviewing another AI's grading for quality control.

QUESTION: "${question}"
MODEL ANSWER: "${modelAnswer || 'No model answer. Grade on factual accuracy.'}"
MAX MARKS: ${maxMarks}${rubricSection}

STUDENT ANSWER: "${studentAnswer}"

INITIAL AI EVALUATION:
- Score Awarded: ${initialEvaluation.finalScore}/${maxMarks}
- Strengths Identified: ${JSON.stringify(initialEvaluation.strengths)}
- Weaknesses: ${JSON.stringify(initialEvaluation.weaknesses)}
- Missing Concepts: ${JSON.stringify(initialEvaluation.missing_concepts)}
- Mark Breakdown: ${JSON.stringify(initialEvaluation.mark_breakdown)}

YOUR TASK: Critically review the initial evaluation. Check for:
1. Did the AI miss any rubric points the student actually addressed?
2. Did the AI hallucinate strengths that aren't in the answer?
3. Are there missing deductions for incorrect information?
4. Is the score proportional to the rubric?

Return ONLY valid JSON (no markdown):
{
  "verified_score": <revised score 0-${maxMarks}>,
  "score_adjusted": <boolean - was the score changed?>,
  "adjustment_reason": "<why score was changed, or 'Score verified as accurate'>",
  "additional_strengths": ["any missed strengths"],
  "additional_weaknesses": ["any missed weaknesses"],
  "verification_notes": "Brief verification summary"
}`;

  const maxAttempts = apiKeyManager.getTotalKeys();
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const ai = new GoogleGenAI({ apiKey: apiKeyManager.getCurrentKey() });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      const clean = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(clean);

      // Clamp: self-verification can only move score by max 15% of max marks
      const maxAdjustment = maxMarks * 0.15;
      const diff = result.verified_score - initialEvaluation.finalScore;
      
      let finalVerifiedScore = initialEvaluation.finalScore;
      if (Math.abs(diff) <= maxAdjustment) {
        finalVerifiedScore = result.verified_score;
      } else {
        finalVerifiedScore = initialEvaluation.finalScore + Math.sign(diff) * maxAdjustment;
      }
      
      finalVerifiedScore = Math.min(Math.max(0, finalVerifiedScore), maxMarks);

      console.log(`  -> [SelfVerify] ✅ Verified. Adjusted: ${result.score_adjusted}. Final: ${parseFloat(finalVerifiedScore.toFixed(2))}`);
      return {
        verified_score: parseFloat(finalVerifiedScore.toFixed(2)),
        score_adjusted: result.score_adjusted,
        adjustment_reason: result.adjustment_reason,
        additional_strengths: result.additional_strengths || [],
        additional_weaknesses: result.additional_weaknesses || [],
        verification_notes: result.verification_notes,
      };
    } catch (error) {
      console.error(`[SelfVerify] Attempt ${attempt} failed:`, error.message);
      if ((error.status === 429 || error.status === 503) && attempt < maxAttempts) {
        apiKeyManager.rotateKey();
        await delay(1000);
        continue;
      }
    }
  }

  // Fallback: return initial score as verified
  return {
    verified_score: initialEvaluation.finalScore,
    score_adjusted: false,
    adjustment_reason: 'Self-verification unavailable — initial score retained',
    additional_strengths: [],
    additional_weaknesses: [],
    verification_notes: 'Could not verify',
  };
};
