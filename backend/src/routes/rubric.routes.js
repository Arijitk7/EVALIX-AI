import express from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireTeacher } from '../middlewares/role.middleware.js';
import { ragAgent } from '../agents/ragAgent.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/rubric/:assignmentId/docs — Teacher uploads context doc for RAG
router.post('/:assignmentId/docs', requireAuth, requireTeacher, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { content, docName } = req.body;
    
    if (!content || content.length < 10) {
      return res.status(400).json({ error: 'Document content is required' });
    }

    const chunkCount = await ragAgent.ingestDocument(assignmentId, content, docName || 'document');
    res.status(200).json({ success: true, chunksStored: chunkCount });
  } catch (error) {
    console.error('[Rubric] Doc ingest error:', error);
    res.status(500).json({ error: 'Failed to ingest document' });
  }
});

// GET /api/rubric/:assignmentId — Get rubric + context docs for an assignment
router.get('/:assignmentId', requireAuth, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const docs = await prisma.embeddingDoc.findMany({
      where: { assignment_id: assignmentId },
      select: { id: true, doc_name: true, chunk_index: true, created_at: true },
      distinct: ['doc_name'],
    });
    
    const questions = await prisma.question.findMany({
      where: { assignment_id: assignmentId },
      select: { id: true, question_text: true, rubric_items: true, max_marks: true },
    });

    res.status(200).json({ docs, questions });
  } catch (error) {
    console.error('[Rubric] Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch rubric' });
  }
});

export default router;
