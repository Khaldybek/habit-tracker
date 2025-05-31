import { Request, Response, NextFunction } from 'express';
import { query } from 'express-validator';
import { validate } from './validation.middleware';

// Валидация параметров пагинации
export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .matches(/^-?[a-zA-Z]+$/)
    .withMessage('Sort must be a field name with optional - prefix for descending order'),
];

// Middleware для обработки пагинации
export const paginate = (req: Request, res: Response, next: NextFunction): void => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sort = (req.query.sort as string) || '-createdAt';

  // Добавляем параметры пагинации в request
  req.pagination = {
    page,
    limit,
    skip: (page - 1) * limit,
    sort: sort.startsWith('-') 
      ? { [sort.substring(1)]: -1 }
      : { [sort]: 1 }
  };

  next();
};

// Расширяем тип Request для включения пагинации
declare global {
  namespace Express {
    interface Request {
      pagination?: {
        page: number;
        limit: number;
        skip: number;
        sort: Record<string, 1 | -1>;
      };
    }
  }
}

// Middleware для форматирования ответа с пагинацией
export const formatPaginatedResponse = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const originalJson = res.json;
  res.json = function(data: any) {
    if (req.pagination && Array.isArray(data)) {
      return originalJson.call(this, {
        status: 'success',
        data: {
          items: data,
          pagination: {
            page: req.pagination.page,
            limit: req.pagination.limit,
            total: data.length,
            pages: Math.ceil(data.length / req.pagination.limit)
          }
        }
      });
    }
    return originalJson.call(this, data);
  };
  next();
}; 