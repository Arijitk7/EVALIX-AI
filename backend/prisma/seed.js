import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create a dummy Question with a Rubric
  const question = await prisma.question.create({
    data: {
      exam_id: 'CS101-Midterm',
      question_text: 'Explain the principles of Object-Oriented Programming.',
      max_marks: 10,
      rubric_json: {
        concepts: [
          { name: 'Encapsulation', marks: 2.5 },
          { name: 'Inheritance', marks: 2.5 },
          { name: 'Polymorphism', marks: 2.5 },
          { name: 'Abstraction', marks: 2.5 }
        ]
      }
    }
  });

  // 2. Create a Model/Reference Answer for this question
  await prisma.referenceAnswer.create({
    data: {
      question_id: question.id,
      source: 'TEACHER',
      answer_text: 'Object-Oriented Programming (OOP) is based on four main principles. Encapsulation hides the internal state of objects. Abstraction hides complex implementation details. Inheritance allows a class to inherit properties from another class. Polymorphism allows objects to be treated as instances of their parent class.'
    }
  });

  // 3. Create a dummy User (Student)
  const user = await prisma.user.create({
    data: {
      clerk_id: `user_${Date.now()}`,
      role: 'STUDENT'
    }
  });

  console.log('✅ Seeding successful!');
  console.log(`\n📌 IMPORTANT - Save these IDs for testing:`);
  console.log(`Question ID: ${question.id}`);
  console.log(`User ID:     ${user.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });