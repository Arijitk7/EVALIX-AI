import express from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { NotificationService } from '../services/notification.service.js';

const router = express.Router();

// GET /api/notifications — User's notifications
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const notifications = await NotificationService.getUserNotifications(userId, limit);
    const unreadCount = await NotificationService.getUnreadCount(userId);
    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    console.error('[Notifications] Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    await NotificationService.markAsRead(req.params.id, req.user.id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all/all', requireAuth, async (req, res) => {
  try {
    await NotificationService.markAllAsRead(req.user.id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

export default router;
