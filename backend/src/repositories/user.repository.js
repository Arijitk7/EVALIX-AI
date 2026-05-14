import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const UserRepository = {
  async syncUser(id, email, name, role, department) {
    return await prisma.user.upsert({
      where: { id },
      update: { 
        email, 
        name,
        department,
        role 
      }, 
      create: { 
        id, 
        email, 
        name, 
        role,
        department 
      }
    });
  }
};