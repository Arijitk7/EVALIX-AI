import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const TeacherRepository = {
  // 1. Get all assignments created by this teacher
  async getDashboardOverview(teacherId, searchQuery = "") {
    const now = new Date();

    // KPI 1: Active Assignments (Deadline in the future)
    const activeAssignments = await prisma.assignment.count({
      where: {
        teacher_id: teacherId,
        end_time: { gt: now },
      },
    });

    // KPI 2: Pending Evaluations (Submissions waiting for AI or Teacher)
    const pendingEvaluations = await prisma.submission.count({
      where: {
        assignment: { teacher_id: teacherId },
        status: "PENDING",
      },
    });

    // KPI 3: Average Class Performance (%)
    const gradedSubmissions = await prisma.submission.findMany({
      where: {
        assignment: { teacher_id: teacherId },
        status: "GRADED",
      },
      include: {
        assignment: { include: { questions: true } },
      },
    });

    let totalPercentage = 0;
    if (gradedSubmissions.length > 0) {
      gradedSubmissions.forEach((sub) => {
        // Calculate max possible marks for the assignment
        const maxMarks = sub.assignment.questions.reduce(
          (sum, q) => sum + q.max_marks,
          0,
        );
        const score = sub.total_score || 0;
        const percentage = maxMarks > 0 ? (score / maxMarks) * 100 : 0;
        totalPercentage += percentage;
      });
    }
    const avgPerformance =
      gradedSubmissions.length > 0
        ? Math.round(totalPercentage / gradedSubmissions.length)
        : 0;

    // 4. The Recent Assignments List (with Search Support!)
    const recentAssignments = await prisma.assignment.findMany({
      where: {
        teacher_id: teacherId,
        // If a search query is passed, filter by title
        title: { contains: searchQuery, mode: "insensitive" },
      },
      orderBy: { created_at: "desc" },
      take: 10, // Keep the dashboard clean, show latest 10
      include: {
        _count: { select: { submissions: true } },
      },
    });

    return {
      activeAssignments,
      pendingEvaluations,
      avgPerformance,
      recentAssignments,
    };
  },

  // 2. Get detailed stats for a specific assignment
  async getAssignmentDashboard(assignmentId, teacherId) {
    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, teacher_id: teacherId },
      include: {
        questions: true,
        submissions: {
          include: {
            student: { select: { name: true, email: true } },
          },
        },
      },
    });

    if (!assignment) return null;

    // Calculate aggregate stats
    const gradedSubmissions = assignment.submissions.filter(
      (s) => s.status === "GRADED",
    );
    const averageScore =
      gradedSubmissions.length > 0
        ? gradedSubmissions.reduce(
            (acc, curr) => acc + (curr.total_score || 0),
            0,
          ) / gradedSubmissions.length
        : 0;

    const totalMarks = assignment.questions.reduce((sum, q) => sum + (q.max_marks || 0), 0);

    return {
      assignmentInfo: {
        id: assignment.id,
        title: assignment.title,
        subject: assignment.subject,
        type: assignment.type,
        department: assignment.department,
        year: assignment.year,
        batch: assignment.batch,
        deadline: assignment.end_time,
        release_marks_at: assignment.release_marks_at,
        total_marks: totalMarks
      },
      stats: {
        totalSubmissions: assignment.submissions.length,
        gradedSubmissions: gradedSubmissions.length,
        averageScore: averageScore.toFixed(2),
      },
      submissions: assignment.submissions,
    };
  },

  // 3. Get a single submission with all its answers (for the Teacher to review)
  async getSubmissionDetails(submissionId) {
    return await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        student: { select: { name: true, email: true } },
        answers: {
          include: {
            question: true, // Include the question to show the teacher what was asked!
          },
        },
      },
    });
  },

  // 4. THE OVERRIDE ENGINE: Let a teacher manually change a grade
 async overrideAnswerScore(submissionId, answerId, newScore, teacherFeedback) {
    // A. Update the specific answer (Using the newly optimized flat columns!)
    const updatedAnswer = await prisma.answer.update({
      where: { id: answerId },
      data: {
        score: newScore,
        // 🌟 FIX: Directly assign the string instead of wrapping it in a JSON object
        teacher_feedback: teacherFeedback, 
      },
    });

    // B. Recalculate the Total Score for the entire Submission
    const allAnswers = await prisma.answer.findMany({
      where: { submission_id: submissionId },
      select: { score: true } // Optimization: Only fetch the scores to save memory
    });

    const newTotalScore = allAnswers.reduce(
      (acc, curr) => acc + (curr.score || 0),
      0,
    );

    // C. Save the new total score
    await prisma.submission.update({
      where: { id: submissionId },
      data: { total_score: newTotalScore },
    });

    return { newTotalScore, updatedAnswer };
  }
};
