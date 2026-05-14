import { GoogleGenAI } from '@google/genai';
import { apiKeyManager } from '../utils/keyManager.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Viva Copilot Agent
 * Generates targeted viva voce questions based on student's weak areas.
 */
export const vivaAgent = async (question, studentAnswer, weaknesses, missingConcepts) => {
  console.log('  -> [Viva] Generating viva questions from weak areas...');

  const weakAreasSummary = [
    ...(weaknesses || []),
    ...(missingConcepts || []),
  ].slice(0, 5).join('; ');

  if (!weakAreasSummary) return [];

  const prompt = `You are an examiner preparing a viva voce oral examination.

ORIGINAL QUESTION: "${question}"
STUDENT ANSWER SUMMARY: "${(studentAnswer || '').substring(0, 300)}"
WEAK AREAS IDENTIFIED: "${weakAreasSummary}"

Generate 3-5 targeted follow-up viva questions that will probe the student's understanding of their weak areas.
Questions should be open-ended and intellectually challenging but fair.

Return ONLY a valid JSON array (no markdown, no code fences):
["Question 1?", "Question 2?", "Question 3?"]`;

  const maxAttempts = apiKeyManager.getTotalKeys();
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const ai = new GoogleGenAI({ apiKey: apiKeyManager.getCurrentKey() });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      const clean = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const questions = JSON.parse(clean);
      console.log(`  -> [Viva] ✅ Generated ${questions.length} viva questions`);
      return Array.isArray(questions) ? questions : [];
    } catch (error) {
      console.error(`[Viva] Attempt ${attempt} failed:`, error.message);
      if ((error.status === 429 || error.status === 503) && attempt < maxAttempts) {
        apiKeyManager.rotateKey();
        await delay(1000);
        continue;
      }
    }
  }
  return [];
};
