import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { User } from '../models/User';
import { logger } from '../utils/logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        status: 'error',
        message: 'No token provided',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as { id: string };

    // Get user from database
    User.findById(decoded.id)
      .select('-passwordHash')
      .then((user) => {
        if (!user) {
          res.status(401).json({
            status: 'error',
            message: 'User not found',
          });
          return;
        }

        // Attach user to request
        req.user = user;
        next();
      })
      .catch((error) => {
        logger.error('Authentication error:', error);
        res.status(401).json({
          status: 'error',
          message: 'Invalid token',
        });
      });
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Invalid token',
    });
  }
};

export const refreshToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(401).json({
        status: 'error',
        message: 'No refresh token provided',
      });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { id: string };

    // Get user from database
    User.findById(decoded.id)
      .select('-passwordHash')
      .then((user) => {
        if (!user) {
          res.status(401).json({
            status: 'error',
            message: 'User not found',
          });
          return;
        }

        // Generate new access token
        const signOptions: SignOptions = {
          expiresIn: config.jwt.expiresIn,
        };

        const accessToken = jwt.sign(
          { id: user._id },
          config.jwt.secret,
          signOptions
        );

        res.json({
          status: 'success',
          data: {
            accessToken,
            user,
          },
        });
      })
      .catch((error) => {
        logger.error('Token refresh error:', error);
        res.status(401).json({
          status: 'error',
          message: 'Invalid refresh token',
        });
      });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Invalid refresh token',
    });
  }
}; 