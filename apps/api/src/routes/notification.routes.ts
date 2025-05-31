import { Router } from 'express';
import { param, query } from 'express-validator';
import { validateRequest } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { paginate, paginationValidation } from '../middleware/pagination.middleware';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from '../controllers/notification.controller';

const router = Router();

// Валидация ID уведомления
const notificationIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid notification ID'),
];

// Валидация параметров запроса
const notificationQueryValidation = [
  query('read')
    .optional()
    .isBoolean()
    .withMessage('Read must be a boolean'),
];

// Маршруты
router.get(
  '/',
  authenticate,
  notificationQueryValidation,
  paginationValidation,
  validateRequest,
  paginate,
  getNotifications
);

router.get(
  '/unread/count',
  authenticate,
  getUnreadCount
);

router.patch(
  '/read/all',
  authenticate,
  markAllAsRead
);

router.patch(
  '/:id/read',
  authenticate,
  notificationIdValidation,
  validateRequest,
  markAsRead
);

router.delete(
  '/all',
  authenticate,
  deleteAllNotifications
);

router.delete(
  '/:id',
  authenticate,
  notificationIdValidation,
  validateRequest,
  deleteNotification
);

export default router; 