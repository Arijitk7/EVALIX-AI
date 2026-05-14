import { GoogleGenAI } from '@google/genai';
import { apiKeyManager } from '../utils/keyManager.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const QuestionGeneratorAgent = {
  async generateQuestions(syllabus, pyqs, instructions, marksDistribution) {
    console.log("-> [Generator Agent] Crafting new questions...");

    const prompt = `
      You are an elite academic curriculum designer and expert exam setter.
      Your objective is to generate highly rigorous, novel exam questions based on the provided syllabus. 
      You must match the structural style and cognitive difficulty of the Previous Year Questions (PYQs).

      CONTEXT:
      1. Syllabus Topics: "${syllabus}"
      2. PYQ Reference (Match this style): "${pyqs}"
      3. Teacher's Custom Instructions: "${instructions}"
      4. Target Marks Distribution: "${marksDistribution}"

      STRICT RULES:
      - Do not generate generic definition questions unless requested. Focus on application, analysis, and evaluation.
      - The 'model_answer' must be highly detailed, structured, and serve as a perfect grading rubric.
      - Output ONLY a valid JSON array. No markdown blocks, no introductory text.

      REQUIRED JSON FORMAT:
      [
        {
          "marks": <integer>,
          "question_text": "<Clear, unambiguous question>",
          "model_answer": "<A comprehensive, step-by-step ideal answer covering all key concepts required for full marks>"
        }
      ]
    `;

    const maxAttempts = apiKeyManager.getTotalKeys();

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const currentKey = apiKeyManager.getCurrentKey();
        const ai = new GoogleGenAI({ apiKey: currentKey });

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        const cleanJsonString = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        console.log(`✅ [Generator Agent] Success using Key #${apiKeyManager.currentIndex + 1}!`);
        return JSON.parse(cleanJsonString);

      } catch (error) {
        console.error(`❌ [Generator Agent] Attempt ${attempt} Failed with Key #${apiKeyManager.currentIndex + 1}:`, error.message);
        
        if (error.status === 429 || error.status === 503 || error.status === 403) {
          if (attempt < maxAttempts) {
            apiKeyManager.rotateKey();
            await delay(1000); 
            continue;
          }
        }
        
        if (attempt === maxAttempts) {
          throw new Error("All AI API keys are exhausted or servers are busy. Please try again later.");
        }
      }
    }
  }
};