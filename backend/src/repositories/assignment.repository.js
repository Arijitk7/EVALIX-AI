import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const AssignmentRepository = {
  
  async createAssignmentWithQuestions(teacherId, assignmentData) {
    const { 
      title, type, department, year, batch, subject, 
      start_time, end_time, release_marks_at, 
      questions 
    } = assignmentData;

    return await prisma.assignment.create({
      data: {
        teacher_id: teacherId,
        title,
        type,
        department, 
        year,       
        batch,      
        subject,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        release_marks_at: new Date(release_marks_at),
        questions: {
          create: questions.map(q => ({
            question_text: q.question_text,
            max_marks: q.max_marks,
            mcq_options: q.mcq_options || null,
            mcq_answer: q.mcq_answer || null,
            mcq_explanation: q.mcq_explanation || null,
            
            // 🌟 THE UPGRADE: Added image_url and model_answer (removed rubric_json)
            image_url: q.image_url || null,
            model_answer: q.model_answer || null
          }))
        }
      },
      include: {
        questions: true 
      }
    });
  },

async getAssignmentsForStudent(department, year, batch, studentId) {
    return await prisma.assignment.findMany({
      where: {
        department: department, 
        year: year,     
        batch: batch    
      },
      include: {
        teacher: { select: { name: true } },
        _count: { select: { questions: true } },
        
        // 🌟 ADD THIS BLOCK: Fetch the submission if this specific student has made one
        submissions: {
          where: { student_id: studentId },
          select: { id: true, status: true } // We only need to know it exists!
        }
      },
      orderBy: {
        end_time: 'asc' 
      }
    });
  },

  async getAssignmentForTestTaker(assignmentId) {
    return await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        teacher: { select: { name: true } },
        // Sanitized secure fetch (answers and model_answer stripped!)
        questions: {
          select: {
            id: true,
            question_text: true,
            max_marks: true,
            mcq_options: true,
            
            // 🌟 THE UPGRADE: We MUST include image_url so the student can see the diagram!
            image_url: true, 
          }
        }
      }
    });
  }
};