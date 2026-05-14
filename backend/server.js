// 1. MUST BE THE VERY FIRST LINE. Guarantees process.env is loaded before anything else!
import 'dotenv/config'; 

import app from './app.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 2. Render will automatically assign a PORT in production (usually 10000)
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  // Removed "http://localhost" because in production, it's hosted on a real domain!
  console.log(`🚀 API Server running smoothly on port ${PORT}`);
});

// Graceful shutdown logic
const gracefulShutdown = async (signal) => {
  console.log(`\n🔄 Received ${signal}. Shutting down gracefully...`);
  
  // 1. Stop accepting new HTTP requests
  server.close(async () => {
    console.log('🛑 HTTP server closed.');
    
    try {
      // 2. Disconnect Prisma safely from Supabase
      await prisma.$disconnect();
      console.log('🗄️ Prisma database connection closed cleanly.');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error during database disconnection:', err);
      process.exit(1);
    }
  });

  // Force close if it takes too long (10 seconds max)
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals from Render (SIGTERM) or your local terminal (SIGINT / Ctrl+C)
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));