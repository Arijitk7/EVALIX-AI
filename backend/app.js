import express from 'express';
import cors from 'cors';

// Import Routes
import { requireAuth } from './src/middlewares/auth.middleware.js';
import submitRoutes from './src/routes/submit.routes.js';
import uploadRoutes from './src/routes/upload.routes.js';
import authRoutes from './src/routes/auth.routes.js';
import assignmentRoutes from './src/routes/assignment.routes.js';
import teacherRoutes from './src/routes/teacher.routes.js';
import rubricRoutes from './src/routes/rubric.routes.js';
import notificationRoutes from './src/routes/notifications.routes.js';
import analyticsRoutes from './src/routes/analytics.routes.js';
import auditRoutes from './src/routes/audit.routes.js';
import webhookRoutes from './src/routes/webhook.routes.js';

const app = express();

// ============================================================================
// STRICT CORS CONFIGURATION
// ============================================================================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// Global Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================================
// MOUNT ROUTES
// ============================================================================
app.use('/api', uploadRoutes);
app.use('/api', submitRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/rubric', rubricRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/webhooks', webhookRoutes);

// ============================================================================
// HEALTH CHECK & ERROR HANDLING
// ============================================================================
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'Operational', 
    platform: 'EVALIX AI v2.0',
    features: [
      'dual-ai-consensus',
      'self-verification',
      'plagiarism-detection',
      'rag-retrieval',
      'viva-copilot',
      'explainable-grading',
      'confidence-scoring',
      'human-in-the-loop',
      'audit-trail',
      'brevo-notifications',
    ],
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;