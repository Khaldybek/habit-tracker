import { RequestHandler } from 'express';
import { NotificationService } from '../services/notification.service';
import { logger } from '../utils/logger';

export const getNotifications: RequestHandler = async (req, res) => {
  try {
    const { read } = req.query;
    const { pagination } = req;

    const { notifications, total } = await NotificationService.getByUserId(
      req.user._id,
      pagination?.page || 1,
      pagination?.limit || 10,
      read === 'true'
    );

    res.json({
      status: 'success',
      data: {
        items: notifications,
        pagination: {
          page: pagination?.page || 1,
          limit: pagination?.limit || 10,
          total,
          pages: Math.ceil(total / (pagination?.limit || 10))
        }
      }
    });
  } catch (error) {
    logger.error('Get notifications error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching notifications',
    });
  }
};

export const getUnreadCount: RequestHandler = async (req, res) => {
  try {
    const count = await NotificationService.getUnreadCount(req.user._id);

    res.json({
      status: 'success',
      data: {
        count,
      },
    });
  } catch (error) {
    logger.error('Get unread count error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching unread count',
    });
  }
};

export const markAsRead: RequestHandler = async (req, res) => {
  try {
    const notification = await NotificationService.markAsRead(req.params.id);

    if (!notification) {
      res.status(404).json({
        status: 'error',
        message: 'Notification not found',
      });
      return;
    }

    res.json({
      status: 'success',
      data: {
        notification,
      },
    });
  } catch (error) {
    logger.error('Mark notification as read error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error marking notification as read',
    });
  }
};

export const markAllAsRead: RequestHandler = async (req, res) => {
  try {
    await NotificationService.markAllAsRead(req.user._id);

    res.json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    logger.error('Mark all notifications as read error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error marking all notifications as read',
    });
  }
};

export const deleteNotification: RequestHandler = async (req, res) => {
  try {
    const notification = await NotificationService.delete(req.params.id);

    if (!notification) {
      res.status(404).json({
        status: 'error',
        message: 'Notification not found',
      });
      return;
    }

    res.json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    logger.error('Delete notification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting notification',
    });
  }
};

export const deleteAllNotifications: RequestHandler = async (req, res) => {
  try {
    await NotificationService.deleteAll(req.user._id);

    res.json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    logger.error('Delete all notifications error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting all notifications',
    });
  }
}; 