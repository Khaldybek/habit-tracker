import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { paginate, paginationValidation } from '../middleware/pagination.middleware';
import {
  createCheckIn,
  getCheckIns,
  getCheckIn,
  updateCheckIn,
  deleteCheckIn,
} from '../controllers/checkin.controller';

const router = Router();

// Валидация для создания/обновления чек-ина
const checkInValidation = [
  body('habitId')
    .optional()
    .isMongoId()
    .withMessage('Invalid habit ID'),
  body('date')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('status')
    .isBoolean()
    .withMessage('Status must be a boolean'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note must not exceed 500 characters'),
  body('mood')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Mood must be a number between 1 and 5'),
  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duration must be a positive integer'),
  body('location')
    .optional()
    .isObject()
    .withMessage('Location must be an object'),
  body('location.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('location.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
];

// Валидация ID чек-ина
const checkInIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid check-in ID'),
];

// Валидация параметров запроса
const checkInQueryValidation = [
  query('habitId')
    .optional()
    .isMongoId()
    .withMessage('Invalid habit ID'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
  query('status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean'),
  query('mood')
    .optional()
    .isIn(['great', 'good', 'neutral', 'bad', 'terrible'])
    .withMessage('Invalid mood value'),
];

// Маршруты
router.post(
  '/',
  authenticate,
  checkInValidation,
  validateRequest,
  createCheckIn
);

router.get(
  '/',
  authenticate,
  checkInQueryValidation,
  paginationValidation,
  validateRequest,
  paginate,
  getCheckIns
);

router.get(
  '/:id',
  authenticate,
  checkInIdValidation,
  validateRequest,
  getCheckIn
);

router.patch(
  '/:id',
  authenticate,
  checkInIdValidation,
  checkInValidation,
  validateRequest,
  updateCheckIn
);

router.delete(
  '/:id',
  authenticate,
  checkInIdValidation,
  validateRequest,
  deleteCheckIn
);

export default router; 