import { Router } from 'express';
import authRoutes from './auth.routes';
import habitRoutes from './habit.routes';
import checkinRoutes from './checkin.routes';
import analyticsRoutes from './analytics.routes';
import notificationRoutes from './notification.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
router.use('/auth', authRoutes);
router.use('/habits', habitRoutes);
router.use('/checkins', checkinRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);

// Add more routes here
// router.use('/analytics', analyticsRoutes);

export default router; 