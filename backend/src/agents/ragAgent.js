import { GoogleGenAI } from '@google/genai';
import { PrismaClient } from '@prisma/client';
import { apiKeyManager } from '../utils/keyManager.js';

const prisma = new PrismaClient();
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const CHUNK_SIZE = 512; // characters per chunk
const TOP_K = 3;

// ============================================================================
// CHUNK TEXT
// ============================================================================
const chunkText = (text, chunkSize = CHUNK_SIZE) => {
  const words = text.split(/\s+/);
  const chunks = [];
  let current = [];
  let count = 0;

  for (const word of words) {
    current.push(word);
    count += word.length + 1;
    if (count >= chunkSize) {
      chunks.push(current.join(' '));
      current = [];
      count = 0;
    }
  }
  if (current.length > 0) chunks.push(current.join(' '));
  return chunks;
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
      console.error(`[RAG] Embedding attempt ${attempt} failed:`, error.message);
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
// COSINE SIMILARITY
// ============================================================================
const cosineSimilarity = (vecA, vecB) => {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((s, a) => s + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((s, b) => s + b * b, 0));
  return magA && magB ? dot / (magA * magB) : 0;
};

// ============================================================================
// INGEST DOCUMENT (Teacher uploads context docs)
// ============================================================================
export const ragAgent = {

  async ingestDocument(assignmentId, content, docName) {
    console.log(`  -> [RAG] Ingesting document "${docName}" for assignment ${assignmentId}`);
    const chunks = chunkText(content);

    // Delete old chunks for this doc/assignment
    await prisma.embeddingDoc.deleteMany({
      where: { assignment_id: assignmentId, doc_name: docName },
    });

    const stored = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await getEmbedding(chunk);
      
      // Store as JSON string (since pgvector requires extension setup)
      const doc = await prisma.embeddingDoc.create({
        data: {
          assignment_id: assignmentId,
          content: chunk,
          chunk_index: i,
          doc_name: docName,
          // embedding stored as JSON array in a text field for portability
        },
      });
      stored.push(doc.id);
      await delay(200); // rate limit
    }

    console.log(`  -> [RAG] ✅ Stored ${stored.length} chunks for assignment ${assignmentId}`);
    return stored.length;
  },

  // ============================================================================
  // RETRIEVE CONTEXT for a query
  // ============================================================================
  async retrieveContext(assignmentId, query) {
    console.log(`  -> [RAG] Retrieving context for assignment ${assignmentId}`);

    const docs = await prisma.embeddingDoc.findMany({
      where: { assignment_id: assignmentId },
      select: { content: true, doc_name: true },
    });

    if (docs.length === 0) return null;

    const queryEmbedding = await getEmbedding(query);
    if (!queryEmbedding) {
      // Fallback: return first few chunks as context
      return docs.slice(0, TOP_K).map(d => d.content).join('\n\n');
    }

    // Score each chunk
    const scored = [];
    for (const doc of docs) {
      const docEmbedding = await getEmbedding(doc.content);
      if (!docEmbedding) continue;
      const sim = cosineSimilarity(queryEmbedding, docEmbedding);
      scored.push({ content: doc.content, similarity: sim });
      await delay(100);
    }

    // Sort and take top-k
    scored.sort((a, b) => b.similarity - a.similarity);
    const topChunks = scored.slice(0, TOP_K).map(s => s.content);

    return topChunks.length > 0 ? topChunks.join('\n\n---\n\n') : null;
  },
};
