import express from 'express';
import { TeacherController } from '../controllers/teacher.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireTeacher } from '../middlewares/role.middleware.js';

const router = express.Router();

// Apply auth and role checks to EVERY route in this file
router.use(requireAuth, requireTeacher);

// 1. Get overview of all assignments
router.get('/dashboard', TeacherController.getDashboard);

// 2. Get specific assignment stats & list of students who submitted
router.get('/assignments/:id', TeacherController.getAssignmentView);

// 3. Review a specific student's full submission
router.get('/submissions/:submissionId', TeacherController.getSubmissionReview);

// 4. HITL Override: Teacher manually changes an AI grade
router.patch('/submissions/:submissionId/answers/:answerId/override', TeacherController.overrideGrade);

// 5. Generate exam questions via AI
router.post('/generate-questions', TeacherController.generateExam);

// 6. Get ALL flagged submissions for HITL review
router.get('/flagged', TeacherController.getFlaggedSubmissions);

// 7. Approve AI decision (teacher agrees)
router.patch('/submissions/:submissionId/answers/:answerId/approve', TeacherController.approveAI);

// 8. Reject AI decision (teacher disagrees, forces manual review)
router.patch('/submissions/:submissionId/answers/:answerId/reject', TeacherController.rejectAI);

// 9. Generate viva questions for a flagged answer
router.post('/submissions/:submissionId/answers/:answerId/viva', TeacherController.generateViva);

// 10. Trigger external n8n grading agent
router.post('/submissions/:submissionId/trigger-n8n', TeacherController.triggerN8nGrading);

export default router;