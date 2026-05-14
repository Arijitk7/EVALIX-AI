import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireStudent, requireTeacher } from '../middlewares/role.middleware.js';
import { AssignmentController } from '../controllers/assignment.controller.js';

const router = Router();

// Notice the double middleware: Must be logged in AND must be a teacher
router.post('/', requireAuth, requireTeacher, AssignmentController.create);

router.get('/student', requireAuth, requireStudent, AssignmentController.getStudentAssignments);

router.get('/:id', requireAuth, AssignmentController.getAssignmentById);

// Add this right below your other student routes:
router.get('/:id/result', requireAuth, requireStudent, AssignmentController.getSubmissionResult);

export default router;