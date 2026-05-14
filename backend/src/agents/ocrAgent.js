import { GoogleGenAI } from '@google/genai';
import { apiKeyManager } from '../utils/keyManager.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Enhanced OCR Agent with blur detection and structured JSON output
 */
export const ocrAgent = async (imageUrl) => {
  console.log(`  -> [OCR Agent] Processing image: ${imageUrl}`);

  // Fetch image and convert to base64
  let imageBase64;
  let mimeType = 'image/jpeg';

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
    
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    mimeType = contentType.split(';')[0].trim();
    
    const arrayBuffer = await response.arrayBuffer();
    imageBase64 = Buffer.from(arrayBuffer).toString('base64');
  } catch (fetchError) {
    console.error('[OCR] Image fetch failed:', fetchError.message);
    return { ocrText: '', error: 'Failed to load image for OCR.', ocrQuality: 'unknown', structuredAnswers: {} };
  }

  const prompt = `You are an advanced handwriting recognition and document analysis system.

Analyze this exam answer sheet image and:
1. Assess image quality (blur, skew, lighting)
2. Extract ALL text from the image (including diagrams labeled with text, equations, numbered answers)
3. Try to identify question numbers and segment answers

Return ONLY valid JSON (no markdown):
{
  "ocrQuality": "good" | "blurry" | "skewed" | "poor",
  "qualityNote": "brief description of image quality",
  "fullText": "all text extracted from the image",
  "structuredAnswers": {
    "Q1": "answer text if identifiable",
    "Q2": "answer text if identifiable"
  },
  "hasFormulas": <boolean>,
  "hasDiagrams": <boolean>,
  "formulasText": "any mathematical formulas found"
}`;

  const maxAttempts = apiKeyManager.getTotalKeys();

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const currentKey = apiKeyManager.getCurrentKey();
      const ai = new GoogleGenAI({ apiKey: currentKey });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: imageBase64,
                },
              },
              { text: prompt },
            ],
          },
        ],
      });

      const clean = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(clean);

      console.log(`  -> [OCR] ✅ Quality: ${result.ocrQuality}. Characters extracted: ${result.fullText?.length || 0}`);

      return {
        ocrText: result.fullText || '',
        ocrQuality: result.ocrQuality || 'good',
        qualityNote: result.qualityNote || '',
        structuredAnswers: result.structuredAnswers || {},
        hasFormulas: result.hasFormulas || false,
        hasDiagrams: result.hasDiagrams || false,
        formulasText: result.formulasText || '',
        error: null,
      };

    } catch (error) {
      console.error(`[OCR] Attempt ${attempt} failed with Key #${apiKeyManager.currentIndex + 1}:`, error.message);

      if (error.status === 429 || error.status === 503 || error.status === 403) {
        if (attempt < maxAttempts) {
          apiKeyManager.rotateKey();
          await delay(1000);
          continue;
        }
      }

      if (attempt === maxAttempts) {
        return { 
          ocrText: '', 
          error: 'OCR extraction failed. The AI vision servers are overloaded.', 
          ocrQuality: 'unknown',
          structuredAnswers: {},
        };
      }
    }
  }
};