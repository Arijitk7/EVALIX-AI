import { AssignmentRepository } from '../repositories/assignment.repository.js';
import { SubmissionRepository } from '../repositories/submission.repository.js';

export const AssignmentController = {
  
  async create(req, res) {
    try {
      const teacherId = req.user.id; 
      const assignmentData = req.body;

      if (!assignmentData.questions || assignmentData.questions.length === 0) {
        return res.status(400).json({ error: "An assignment must have at least one question." });
      }

      const newAssignment = await AssignmentRepository.createAssignmentWithQuestions(teacherId, assignmentData);

      console.log(`✅ [Assignment] Created successfully: ${newAssignment.title}`);
      
      return res.status(201).json({ 
        success: true, 
        message: "Assignment created successfully",
        assignment: newAssignment 
      });

    } catch (error) {
      console.error("❌ [Assignment] Creation Error:", error);
      return res.status(500).json({ success: false, error: "Failed to create assignment" });
    }
  },

  async getStudentAssignments(req, res) {
    try {
      // 1. Get Department securely from the Supabase JWT token
      const department = req.user.user_metadata?.department;

      // 2. Get Year and Batch dynamically from the URL query params
      // Example URL: /api/assignments/student?year=BTECH_YEAR_1&batch=BATCH_1
      const { year, batch } = req.query; 

      if (!department) {
        return res.status(400).json({ success: false, error: "Student profile is missing a department." });
      }

      if (!year || !batch) {
        return res.status(400).json({ 
          success: false, 
          error: "Please select your current Year and Batch from the dashboard to view assignments." 
        });
      }

      const assignments = await AssignmentRepository.getAssignmentsForStudent(department, year, batch);

      return res.status(200).json({ 
        success: true, 
        count: assignments.length,
        assignments: assignments 
      });

    } catch (error) {
      console.error("❌ [Assignment] Fetch Error:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch assignments" });
    }
  },

  async getAssignmentById(req, res) {
    try {
      const { id } = req.params;
      const assignment = await AssignmentRepository.getAssignmentForTestTaker(id);

      if (!assignment) {
        return res.status(404).json({ success: false, error: "Assignment not found" });
      }

      // TIME-LOCK SECURITY
      const now = new Date();
      if (now < assignment.start_time) {
        return res.status(403).json({ 
          success: false, 
          error: "This assignment has not started yet." 
        });
      }

      return res.status(200).json({ success: true, assignment });

    } catch (error) {
      console.error("❌ [Assignment] Fetch By ID Error:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch assignment details" });
    }
  },

  // Add this inside AssignmentController
  async getSubmissionResult(req, res) {
    try {
      const { id } = req.params; // The Assignment ID
      const studentId = req.user.id;

      const submission = await SubmissionRepository.getStudentSubmissionResult(id, studentId);

      if (!submission) {
        return res.status(404).json({ success: false, error: "Submission not found." });
      }

      // 🛡️ TIME-LOCK SECURITY: Prevent students from seeing results too early
      const now = new Date();
      if (now < new Date(submission.assignment.release_marks_at)) {
        return res.status(403).json({ 
          success: false, 
          error: "Results are not released yet. Please check back later." 
        });
      }

      return res.status(200).json({ success: true, submission });

    } catch (error) {
      console.error("❌ [Student Result] Fetch Error:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch results." });
    }
  }
};