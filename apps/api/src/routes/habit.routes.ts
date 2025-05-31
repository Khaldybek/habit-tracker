import { Router } from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { paginate, paginationValidation } from '../middleware/pagination.middleware';
import {
  createHabit,
  getHabits,
  getHabit,
  updateHabit,
  deleteHabit,
} from '../controllers/habit.controller';

const router = Router();

// Валидация для создания/обновления привычки
const habitValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('category')
    .optional()
    .isIn(['health', 'fitness', 'learning', 'productivity', 'mindfulness', 'other'])
    .withMessage('Invalid category'),
  body('frequency')
    .isObject()
    .withMessage('Frequency must be an object'),
  body('frequency.type')
    .isIn(['daily', 'weekly', 'monthly'])
    .withMessage('Invalid frequency type'),
  body('frequency.times')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Frequency times must be a positive integer'),
  body('frequency.days')
    .optional()
    .isArray()
    .withMessage('Frequency days must be an array'),
  body('frequency.days.*')
    .optional()
    .isInt({ min: 0, max: 6 })
    .withMessage('Invalid day number'),
  body('target')
    .optional()
    .isObject()
    .withMessage('Target must be an object'),
  body('target.type')
    .optional()
    .isIn(['boolean', 'number', 'duration'])
    .withMessage('Invalid target type'),
  body('target.value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Target value must be a non-negative number'),
  body('target.unit')
    .optional()
    .isString()
    .withMessage('Target unit must be a string'),
  body('reminderEnabled')
    .optional()
    .isBoolean()
    .withMessage('Reminder enabled must be a boolean'),
  body('reminderTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid reminder time format (HH:mm)'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string'),
];

// Валидация ID привычки
const habitIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid habit ID'),
];

// Маршруты
router.post(
  '/',
  authenticate,
  habitValidation,
  validateRequest,
  createHabit
);

router.get(
  '/',
  authenticate,
  paginationValidation,
  paginate,
  getHabits
);

router.get(
  '/:id',
  authenticate,
  habitIdValidation,
  validateRequest,
  getHabit
);

router.patch(
  '/:id',
  authenticate,
  habitIdValidation,
  habitValidation,
  validateRequest,
  updateHabit
);

router.delete(
  '/:id',
  authenticate,
  habitIdValidation,
  validateRequest,
  deleteHabit
);

export default router; 