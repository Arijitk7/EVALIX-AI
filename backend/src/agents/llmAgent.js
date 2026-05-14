import { GoogleGenAI } from '@google/genai';
import { apiKeyManager } from '../utils/keyManager.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 🌟 ADDED 'question' AS THE FIRST PARAMETER
export const llmAgent = async (question, studentAnswer, modelAnswer, maxMarks) => {
  console.log("-> [LLM Agent] Asking Gemini for detailed evaluation...");
  
  const prompt = `
    You are a rigorous but empathetic university professor evaluating a student's exam answer.
    
    REFERENCE MATERIAL:
    - Question Asked: "${question}"
    - Teacher's Gold Standard Answer: "${modelAnswer || 'No model answer provided. Grade based on absolute factual accuracy.'}"
    - Maximum Possible Marks: ${maxMarks}
    
    STUDENT'S SUBMISSION:
    "${studentAnswer}"

    YOUR TASK:
    Evaluate the student's answer against the Gold Standard to see if they accurately answered the specific Question Asked. Be objective. Do not penalize for poor grammar if the technical concepts are correct.
    
    You must return a single JSON object. The "feedback" string MUST be formatted using Markdown bullet points for readability.

    REQUIRED JSON FORMAT:
    {
      "score": <number between 0 and ${maxMarks}, allow decimals like 3.5>,
      "feedback": "Use exactly this structure:\\n\\n**✅ Strengths:**\\n* [Point 1]\\n* [Point 2]\\n\\n**❌ Missing Concepts:**\\n* [Point 1]\\n* [Point 2]\\n\\n**📈 How to Improve:**\\n* [Actionable advice]"
    }
    
    IMPORTANT: Output ONLY the raw JSON object. Do not wrap it in \`\`\`json markdown blocks.
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
      console.log(`✅ [LLM Agent] Grading complete using Key #${apiKeyManager.currentIndex + 1}!`);
      return JSON.parse(cleanJsonString);

    } catch (error) {
      console.error(`❌ [LLM Agent] Attempt ${attempt} Failed with Key #${apiKeyManager.currentIndex + 1}:`, error.message);
      
      if (error.status === 429 || error.status === 503 || error.status === 403) {
        if (attempt < maxAttempts) {
          apiKeyManager.rotateKey();
          await delay(1000); 
          continue;
        }
      }
      
      if (attempt === maxAttempts) {
        console.error("-> [LLM Agent] All keys exhausted.");
        return { score: 0, feedback: "⚠️ **Evaluation Error:** The AI grading servers are currently overloaded. Your teacher will review this manually." };
      }
    }
  }
};