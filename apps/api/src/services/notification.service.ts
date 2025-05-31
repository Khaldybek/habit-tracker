import { Notification, INotification } from '../models/Notification';
import { User } from '../models/User';
import { Habit } from '../models/Habit';
import { CheckIn } from '../models/CheckIn';
import { logger } from '../utils/logger';

interface NotificationQuery {
  userId: string;
  read?: boolean;
}

interface CreateNotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export class NotificationService {
  static async createNotification(data: CreateNotificationData): Promise<INotification> {
    const notification = new Notification({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data || {},
    });

    await notification.save();
    return notification;
  }

  static async getByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10,
    read?: boolean
  ): Promise<{ notifications: INotification[]; total: number }> {
    const query: any = { userId };
    if (read !== undefined) {
      query.read = read;
    }

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { notifications, total };
  }

  static async markAsRead(id: string): Promise<INotification | null> {
    return Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );
  }

  static async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );
  }

  static async delete(id: string): Promise<INotification | null> {
    return Notification.findByIdAndDelete(id);
  }

  static async deleteAll(userId: string): Promise<void> {
    await Notification.deleteMany({ userId });
  }

  static async getUnreadCount(userId: string): Promise<number> {
    return Notification.countDocuments({ userId, read: false });
  }

  // Helper methods for specific notification types
  static async createReminderNotification(habit: any, userId: string): Promise<void> {
    try {
      await this.createNotification(
        {
          userId,
          type: 'reminder',
          title: 'Habit Reminder',
          message: `Don't forget to complete your habit: ${habit.title}`,
          data: { habitId: habit._id }
        }
      );
    } catch (error) {
      logger.error('Create reminder notification error:', error);
      throw error;
    }
  }

  static async createStreakNotification(
    habit: any,
    streak: number,
    userId: string
  ): Promise<void> {
    try {
      await this.createNotification(
        {
          userId,
          type: 'streak',
          title: 'Streak Achievement!',
          message: `Congratulations! You've maintained a ${streak}-day streak for ${habit.title}`,
          data: { habitId: habit._id, streak }
        }
      );
    } catch (error) {
      logger.error('Create streak notification error:', error);
      throw error;
    }
  }

  static async createAchievementNotification(
    achievement: string,
    userId: string
  ): Promise<void> {
    try {
      await this.createNotification(
        {
          userId,
          type: 'achievement',
          title: 'New Achievement!',
          message: `You've earned a new achievement: ${achievement}`,
          data: { achievement }
        }
      );
    } catch (error) {
      logger.error('Create achievement notification error:', error);
      throw error;
    }
  }
} 