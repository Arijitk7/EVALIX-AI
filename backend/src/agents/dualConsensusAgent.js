import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { apiKeyManager } from '../utils/keyManager.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// GEMINI EVALUATOR — Primary AI
// ============================================================================
const evaluateWithGemini = async (question, studentAnswer, modelAnswer, maxMarks, rubricItems, ragContext) => {
  const rubricSection = rubricItems?.length
    ? `\n\nRUBRIC (must follow strictly):\n${rubricItems.map(r => `- ${r.concept}: ${r.marks} marks (${r.weightage}% weight)`).join('\n')}`
    : '';

  const ragSection = ragContext
    ? `\n\nACADEMIC CONTEXT (retrieved from course materials):\n${ragContext}`
    : '';

  const prompt = `You are a rigorous, empathetic university professor performing explainable AI grading.

QUESTION: "${question}"
MODEL ANSWER: "${modelAnswer || 'Grade based on absolute factual accuracy.'}"
MAX MARKS: ${maxMarks}${rubricSection}${ragSection}

STUDENT ANSWER:
"${studentAnswer}"

Evaluate thoroughly. Return ONLY a raw JSON object (no markdown, no code fences):
{
  "score": <number 0-${maxMarks}, decimals allowed>,
  "confidence": <integer 0-100 representing your certainty>,
  "strengths": ["point1", "point2"],
  "weaknesses": ["point1", "point2"],
  "missing_concepts": ["concept1", "concept2"],
  "improvement_suggestions": ["suggestion1", "suggestion2"],
  "mark_breakdown": [
    { "item": "concept/criterion", "awarded": <marks>, "max": <max_for_this_item> }
  ],
  "feedback": "Markdown formatted summary with **Strengths**, **Missing Concepts**, **How to Improve** sections"
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
      return JSON.parse(clean);
    } catch (error) {
      console.error(`[DualConsensus] Gemini Attempt ${attempt} failed:`, error.message);
      if ((error.status === 429 || error.status === 503) && attempt < maxAttempts) {
        apiKeyManager.rotateKey();
        await delay(1000);
        continue;
      }
    }
  }
  return null;
};

// ============================================================================
// LLAMA (GROQ) EVALUATOR — Secondary AI
// ============================================================================
const evaluateWithLlama = async (question, studentAnswer, modelAnswer, maxMarks, rubricItems) => {
  try {
    if (!process.env.GROQ_API_KEY) return null;

    const client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });

    const rubricSection = rubricItems?.length
      ? `\nRUBRIC:\n${rubricItems.map(r => `- ${r.concept}: ${r.marks} marks`).join('\n')}`
      : '';

    const prompt = `You are an academic evaluator. Grade the student answer.
QUESTION: "${question}"
MODEL ANSWER: "${modelAnswer || 'Grade on factual accuracy.'}"
MAX MARKS: ${maxMarks}${rubricSection}
STUDENT ANSWER: "${studentAnswer}"

Return ONLY valid JSON (no markdown):
{"score": <0-${maxMarks}>, "confidence": <0-100>, "feedback": "brief evaluation"}`;

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const text = completion.choices[0]?.message?.content || '';
    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(clean);
  } catch (error) {
    console.error('[DualConsensus] Llama evaluation failed:', error.message);
    return null;
  }
};

// ============================================================================
// DUAL CONSENSUS ENGINE
// ============================================================================
export const dualConsensusAgent = async (question, studentAnswer, modelAnswer, maxMarks, rubricItems = [], ragContext = null) => {
  console.log('  -> [DualConsensus] Running parallel Gemini + Llama evaluation...');

  const MISMATCH_THRESHOLD_PERCENT = 0.20;

  const [geminiResult, llamaResult] = await Promise.all([
    evaluateWithGemini(question, studentAnswer, modelAnswer, maxMarks, rubricItems, ragContext),
    evaluateWithLlama(question, studentAnswer, modelAnswer, maxMarks, rubricItems),
  ]);

  const geminiScore = geminiResult?.score ?? null;
  const llamaScore = llamaResult?.score ?? null;

  let finalScore = geminiScore ?? 0;
  let isFlagged = false;
  let flagReason = null;
  let consensusConfidence = geminiResult?.confidence ?? 50;

  if (geminiScore !== null && llamaScore !== null) {
    const mismatch = Math.abs(geminiScore - llamaScore);
    const threshold = maxMarks * MISMATCH_THRESHOLD_PERCENT;
    
    if (mismatch > threshold) {
      isFlagged = true;
      flagReason = 'AI_DISAGREEMENT';
      finalScore = (geminiScore + llamaScore) / 2;
      consensusConfidence = Math.max(20, consensusConfidence - 30);
      console.log(`  -> [DualConsensus] ⚠️  Mismatch detected! Gemini=${geminiScore} Llama=${llamaScore} → Flagged`);
    } else {
      finalScore = (geminiScore + llamaScore) / 2;
      consensusConfidence = Math.min(100, consensusConfidence + 10);
    }
  } else if (geminiScore === null) {
    finalScore = 0;
    isFlagged = true;
    flagReason = 'LOW_CONFIDENCE';
    consensusConfidence = 0;
  }

  finalScore = Math.min(Math.max(0, finalScore), maxMarks);

  if (consensusConfidence < 70) {
    isFlagged = true;
    if (!flagReason) flagReason = 'LOW_CONFIDENCE';
  }

  return {
    finalScore: parseFloat(finalScore.toFixed(2)),
    geminiScore,
    llamaScore,
    confidenceScore: consensusConfidence,
    isFlagged,
    flagReason,
    strengths: geminiResult?.strengths || [],
    weaknesses: geminiResult?.weaknesses || [],
    missing_concepts: geminiResult?.missing_concepts || [],
    improvement_suggestions: geminiResult?.improvement_suggestions || [],
    mark_breakdown: geminiResult?.mark_breakdown || [],
    ai_feedback: geminiResult?.feedback || llamaResult?.feedback || 'Evaluation complete.',
  };
};
