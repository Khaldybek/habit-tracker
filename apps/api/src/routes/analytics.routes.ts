import { Router } from 'express';
import { query, param } from 'express-validator';
import { validateRequest } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { paginate, paginationValidation } from '../middleware/pagination.middleware';
import {
  getHabitStats,
  getUserStats,
  exportData,
} from '../controllers/analytics.controller';

const router = Router();

// Валидация параметров запроса
const dateRangeValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
  query('period')
    .optional()
    .isIn(['day', 'week', 'month'])
    .withMessage('Period must be one of: day, week, month'),
];

// Валидация ID привычки
const habitIdValidation = [
  param('habitId')
    .isMongoId()
    .withMessage('Invalid habit ID'),
];

// Валидация формата экспорта
const exportFormatValidation = [
  query('format')
    .optional()
    .isIn(['json', 'csv'])
    .withMessage('Format must be one of: json, csv'),
];

// Маршруты
router.get(
  '/habits/:habitId',
  authenticate,
  habitIdValidation,
  dateRangeValidation,
  validateRequest,
  getHabitStats
);

router.get(
  '/user',
  authenticate,
  dateRangeValidation,
  paginationValidation,
  validateRequest,
  paginate,
  getUserStats
);

router.get(
  '/export',
  authenticate,
  dateRangeValidation,
  exportFormatValidation,
  validateRequest,
  exportData
);

export default router; 