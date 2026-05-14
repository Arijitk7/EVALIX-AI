import express from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/analytics/teacher/:assignmentId — Class analytics
router.get('/teacher/:assignmentId', requireAuth, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const submissions = await prisma.submission.findMany({
      where: { assignment_id: assignmentId, status: { in: ['GRADED', 'UNDER_REVIEW'] } },
      include: {
        student: { select: { name: true, id: true } },
        answers: {
          select: {
            score: true,
            question_id: true,
            confidence_score: true,
            plagiarism_score: true,
            risk_level: true,
            is_flagged: true,
            weaknesses: true,
            missing_concepts: true,
          },
        },
      },
    });

    const questions = await prisma.question.findMany({
      where: { assignment_id: assignmentId },
      select: { id: true, question_text: true, max_marks: true },
    });

    const totalStudents = submissions.length;
    const scores = submissions.map(s => s.total_score || 0);
    const avgScore = totalStudents > 0 ? scores.reduce((a, b) => a + b, 0) / totalStudents : 0;
    const maxScore = Math.max(...scores, 0);
    const minScore = Math.min(...scores, 0);

    const flaggedCount = submissions.filter(s => s.status === 'UNDER_REVIEW').length;
    const plagiarismAlerts = submissions.reduce((count, s) =>
      count + s.answers.filter(a => a.risk_level === 'HIGH' || a.risk_level === 'CRITICAL').length, 0);

    // Per-question analytics
    const questionAnalytics = questions.map(q => {
      const qAnswers = submissions.flatMap(s => s.answers.filter(a => a.question_id === q.id));
      const qScores = qAnswers.map(a => a.score || 0);
      const qAvg = qScores.length > 0 ? qScores.reduce((a, b) => a + b, 0) / qScores.length : 0;
      
      const allWeaknesses = qAnswers.flatMap(a => Array.isArray(a.weaknesses) ? a.weaknesses : []);
      const allMissing = qAnswers.flatMap(a => Array.isArray(a.missing_concepts) ? a.missing_concepts : []);
      
      return {
        questionId: q.id,
        questionText: q.question_text.substring(0, 80),
        maxMarks: q.max_marks,
        avgScore: parseFloat(qAvg.toFixed(2)),
        difficultyPercent: q.max_marks > 0 ? Math.round((1 - qAvg / q.max_marks) * 100) : 0,
        topWeaknesses: allWeaknesses.slice(0, 3),
        topMissingConcepts: allMissing.slice(0, 3),
      };
    });

    // Score distribution
    const distribution = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
    const totalMax = questions.reduce((s, q) => s + q.max_marks, 0);
    scores.forEach(score => {
      const pct = totalMax > 0 ? (score / totalMax) * 100 : 0;
      if (pct <= 20) distribution['0-20']++;
      else if (pct <= 40) distribution['21-40']++;
      else if (pct <= 60) distribution['41-60']++;
      else if (pct <= 80) distribution['61-80']++;
      else distribution['81-100']++;
    });

    res.status(200).json({
      summary: {
        totalStudents,
        avgScore: parseFloat(avgScore.toFixed(2)),
        maxScore,
        minScore,
        totalMaxMarks: totalMax,
        flaggedCount,
        plagiarismAlerts,
      },
      scoreDistribution: distribution,
      questionAnalytics,
      leaderboard: submissions
        .map(s => ({ name: s.student.name, score: s.total_score || 0 }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10),
    });
  } catch (error) {
    console.error('[Analytics] Teacher error:', error);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

// GET /api/analytics/student/:studentId — Student analytics across all assignments
router.get('/student/:studentId', requireAuth, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const submissions = await prisma.submission.findMany({
      where: { student_id: studentId, status: { in: ['GRADED', 'UNDER_REVIEW'] } },
      include: {
        assignment: { select: { title: true, subject: true, id: true, created_at: true } },
        answers: {
          select: {
            score: true,
            question_id: true,
            weaknesses: true,
            missing_concepts: true,
            improvement_suggestions: true,
            confidence_score: true,
          },
        },
      },
      orderBy: { submitted_at: 'asc' },
      take: 20,
    });

    const trend = submissions.map(s => ({
      title: s.assignment.title,
      subject: s.assignment.subject,
      score: s.total_score || 0,
      date: s.assignment.created_at,
    }));

    const allWeaknesses = submissions
      .flatMap(s => s.answers.flatMap(a => Array.isArray(a.weaknesses) ? a.weaknesses : []))
      .reduce((acc, w) => {
        acc[w] = (acc[w] || 0) + 1;
        return acc;
      }, {});

    const topWeakTopics = Object.entries(allWeaknesses)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));

    const avgScore = submissions.length > 0
      ? submissions.reduce((s, sub) => s + (sub.total_score || 0), 0) / submissions.length
      : 0;

    res.status(200).json({
      trend,
      topWeakTopics,
      avgScore: parseFloat(avgScore.toFixed(2)),
      totalSubmissions: submissions.length,
    });
  } catch (error) {
    console.error('[Analytics] Student error:', error);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

export default router;
