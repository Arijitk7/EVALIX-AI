import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// NOTIFICATION SERVICE — In-App + Brevo Email
// ============================================================================

// Lazy-load Brevo to avoid startup failures if package isn't installed
let BrevoClient = null;
const getBrevoClient = async () => {
  if (!process.env.BREVO_API_KEY) return null;
  if (!BrevoClient) {
    try {
      const brevo = await import('@getbrevo/brevo');
      const apiInstance = new brevo.TransactionalEmailsApi();
      apiInstance.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
      BrevoClient = { api: apiInstance, brevo };
    } catch {
      console.warn('[Notifications] Brevo SDK not available. Email disabled.');
      return null;
    }
  }
  return BrevoClient;
};

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================
const EMAIL_TEMPLATES = {
  SIGNUP: {
    subject: 'Welcome to EVALIX AI 🎓',
    buildHtml: (data) => `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1e; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1a237e, #0d47a1); padding: 40px; text-align: center;">
          <img src="https://evalix-ai.vercel.app/favicon.jpeg" alt="EVALIX AI" style="width: 80px; border-radius: 50%; margin-bottom: 16px;" />
          <h1 style="color: #60a5fa; margin: 0; font-size: 28px;">Welcome to EVALIX AI</h1>
          <p style="color: #93c5fd; margin-top: 8px;">Trustworthy Autonomous Academic Intelligence</p>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 18px;">Hello, <strong style="color: #60a5fa;">${data.name}</strong>!</p>
          <p>Your account has been created successfully. You're now part of the future of AI-powered academic evaluation.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth" 
             style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
            Go to Dashboard →
          </a>
        </div>
      </div>`,
  },
  ASSIGNMENT_PUBLISHED: {
    subject: '📋 New Assignment: {title}',
    buildHtml: (data) => `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1e; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1a237e, #0d47a1); padding: 40px; text-align: center;">
          <h1 style="color: #60a5fa; margin: 0;">New Assignment Published</h1>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #60a5fa;">${data.title}</h2>
          <p><strong>Subject:</strong> ${data.subject}</p>
          <p><strong>Deadline:</strong> ${data.deadline}</p>
          <p><strong>Type:</strong> ${data.type}</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/student-dashboard" 
             style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
            View Assignment →
          </a>
        </div>
      </div>`,
  },
  SUBMISSION_CONFIRMED: {
    subject: '✅ Submission Received — {title}',
    buildHtml: (data) => `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1e; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #064e3b, #065f46); padding: 40px; text-align: center;">
          <h1 style="color: #34d399; margin: 0;">Submission Confirmed ✅</h1>
        </div>
        <div style="padding: 32px;">
          <p>Your submission for <strong style="color: #34d399;">${data.title}</strong> has been received and is being processed by our AI evaluation pipeline.</p>
          <p>You'll be notified when results are available.</p>
        </div>
      </div>`,
  },
  RESULT_PUBLISHED: {
    subject: '🎯 Your Results Are Ready — {title}',
    buildHtml: (data) => `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1e; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1e3a5f, #1a237e); padding: 40px; text-align: center;">
          <h1 style="color: #60a5fa; margin: 0;">Results Published 🎯</h1>
        </div>
        <div style="padding: 32px;">
          <p>Results for <strong style="color: #60a5fa;">${data.title}</strong> are now available.</p>
          <p style="font-size: 24px; color: #34d399; font-weight: 700;">Score: ${data.score}/${data.maxMarks}</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/student/results/${data.assignmentId}" 
             style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
            View Detailed Feedback →
          </a>
        </div>
      </div>`,
  },
};

// ============================================================================
// MAIN NOTIFICATION SERVICE
// ============================================================================
export const NotificationService = {

  // Create in-app notification
  async createInApp(userId, type, title, message, metadata = {}) {
    try {
      return await prisma.notification.create({
        data: { user_id: userId, type, title, message, metadata },
      });
    } catch (error) {
      console.error('[Notifications] Failed to create in-app notification:', error.message);
    }
  },

  // Send email via Brevo
  async sendEmail(toEmail, toName, templateType, data) {
    const client = await getBrevoClient();
    if (!client) return;

    const template = EMAIL_TEMPLATES[templateType];
    if (!template) return;

    try {
      const { brevo } = client;
      const sendSmtpEmail = new brevo.SendSmtpEmail();
      
      sendSmtpEmail.subject = template.subject.replace('{title}', data.title || '');
      sendSmtpEmail.htmlContent = template.buildHtml(data);
      sendSmtpEmail.sender = { 
        name: 'EVALIX AI', 
        email: process.env.BREVO_SENDER_EMAIL || 'noreply@evalix-ai.com' 
      };
      sendSmtpEmail.to = [{ email: toEmail, name: toName }];

      await client.api.sendTransacEmail(sendSmtpEmail);
      console.log(`  -> [Email] ✅ Sent ${templateType} email to ${toEmail}`);
    } catch (error) {
      console.error(`[Email] Failed to send ${templateType} email:`, error.message);
    }
  },

  // Get user notifications
  async getUserNotifications(userId, limit = 20) {
    return await prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  },

  // Mark as read
  async markAsRead(notificationId, userId) {
    return await prisma.notification.updateMany({
      where: { id: notificationId, user_id: userId },
      data: { is_read: true },
    });
  },

  // Mark all as read
  async markAllAsRead(userId) {
    return await prisma.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });
  },

  // Get unread count
  async getUnreadCount(userId) {
    return await prisma.notification.count({
      where: { user_id: userId, is_read: false },
    });
  },
};
