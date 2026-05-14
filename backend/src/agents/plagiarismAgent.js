import { GoogleGenAI } from '@google/genai';
import { PrismaClient } from '@prisma/client';
import { apiKeyManager } from '../utils/keyManager.js';

const prisma = new PrismaClient();
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// COSINE SIMILARITY (for comparing embedding vectors)
// ============================================================================
const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return magA && magB ? dotProduct / (magA * magB) : 0;
};

// ============================================================================
// GENERATE EMBEDDING
// ============================================================================
const getEmbedding = async (text) => {
  const maxAttempts = apiKeyManager.getTotalKeys();
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const ai = new GoogleGenAI({ apiKey: apiKeyManager.getCurrentKey() });
      const result = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: text,
      });
      return result.embeddings?.[0]?.values || null;
    } catch (error) {
      console.error(`[Plagiarism] Embedding attempt ${attempt} failed:`, error.message);
      if (attempt < maxAttempts) {
        apiKeyManager.rotateKey();
        await delay(500);
        continue;
      }
    }
  }
  return null;
};

// ============================================================================
// AI GENERATION DETECTION
// ============================================================================
const detectAIGenerated = async (text) => {
  try {
    const ai = new GoogleGenAI({ apiKey: apiKeyManager.getCurrentKey() });
    const prompt = `Analyze this text and determine if it was AI-generated or written by a human student.

TEXT: "${text.substring(0, 800)}"

Return ONLY valid JSON (no markdown):
{"ai_generated": <boolean>, "confidence": <0-100>, "reason": "brief explanation"}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const clean = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return { ai_generated: false, confidence: 0, reason: 'Detection unavailable' };
  }
};

// ============================================================================
// MAIN PLAGIARISM AGENT
// ============================================================================
export const plagiarismAgent = async (assignmentId, questionId, studentId, studentAnswerText) => {
  console.log('  -> [Plagiarism] Running academic integrity check...');

  if (!studentAnswerText || studentAnswerText.length < 50) {
    return { plagiarismScore: 0, riskLevel: 'LOW', aiGenerated: false, similarStudents: [] };
  }

  try {
    // 1. Get all OTHER student answers for same question
    const otherAnswers = await prisma.answer.findMany({
      where: {
        question_id: questionId,
        submission: {
          assignment_id: assignmentId,
          student_id: { not: studentId },
        },
        ocr_text: { not: null },
      },
      select: {
        id: true,
        ocr_text: true,
        typed_text: true,
        submission: { select: { student_id: true } },
      },
      take: 50, // check against max 50 peers
    });

    let maxSimilarity = 0;
    const similarStudents = [];

    if (otherAnswers.length > 0) {
      // Generate embedding for current student's answer
      const studentEmbedding = await getEmbedding(studentAnswerText);

      if (studentEmbedding) {
        for (const other of otherAnswers) {
          const otherText = other.ocr_text || other.typed_text;
          if (!otherText || otherText.length < 50) continue;

          const otherEmbedding = await getEmbedding(otherText);
          if (!otherEmbedding) continue;

          const similarity = cosineSimilarity(studentEmbedding, otherEmbedding);
          const simPercent = Math.round(similarity * 100);

          if (simPercent > 60) {
            similarStudents.push({
              studentId: other.submission.student_id,
              similarity: simPercent,
            });
          }
          if (simPercent > maxSimilarity) maxSimilarity = simPercent;
        }
      }
    }

    // 2. AI Generation Detection
    const aiDetection = await detectAIGenerated(studentAnswerText);

    // 3. Calculate risk level
    let riskLevel = 'LOW';
    let plagiarismScore = maxSimilarity;

    if (aiDetection.ai_generated && aiDetection.confidence > 70) {
      plagiarismScore = Math.max(plagiarismScore, 75);
    }

    if (plagiarismScore >= 85) riskLevel = 'CRITICAL';
    else if (plagiarismScore >= 70) riskLevel = 'HIGH';
    else if (plagiarismScore >= 50) riskLevel = 'MEDIUM';
    else riskLevel = 'LOW';

    console.log(`  -> [Plagiarism] Score: ${plagiarismScore}%, Risk: ${riskLevel}, AI-Generated: ${aiDetection.ai_generated}`);

    return {
      plagiarismScore,
      riskLevel,
      aiGenerated: aiDetection.ai_generated,
      similarStudents: similarStudents.slice(0, 5),
      aiDetectionConfidence: aiDetection.confidence,
    };
  } catch (error) {
    console.error('[Plagiarism] Error during check:', error.message);
    return { plagiarismScore: 0, riskLevel: 'LOW', aiGenerated: false, similarStudents: [] };
  }
};
