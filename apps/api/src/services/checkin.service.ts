import { CheckIn, ICheckIn } from '../models/CheckIn';
import { Habit } from '../models/Habit';
import { logger } from '../utils/logger';

export class CheckInService {
  static async create(data: Partial<ICheckIn>): Promise<ICheckIn> {
    try {
      const checkIn = new CheckIn(data);
      await checkIn.save();
      return checkIn;
    } catch (error) {
      logger.error('Error creating check-in:', error);
      throw error;
    }
  }

  static async getById(id: string): Promise<ICheckIn | null> {
    try {
      return await CheckIn.findById(id).populate('habitId');
    } catch (error) {
      logger.error('Error getting check-in by ID:', error);
      throw error;
    }
  }

  static async getByUserId(userId: string): Promise<ICheckIn[]> {
    try {
      return await CheckIn.find({ userId }).populate('habitId').sort({ date: -1 });
    } catch (error) {
      logger.error('Error getting check-ins by user ID:', error);
      throw error;
    }
  }

  static async getByHabitId(habitId: string): Promise<ICheckIn[]> {
    try {
      return await CheckIn.find({ habitId }).populate('habitId').sort({ date: -1 });
    } catch (error) {
      logger.error('Error getting check-ins by habit ID:', error);
      throw error;
    }
  }

  static async getByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<ICheckIn[]> {
    try {
      return await CheckIn.find({
        userId,
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      })
        .populate('habitId')
        .sort({ date: -1 });
    } catch (error) {
      logger.error('Error getting check-ins by date range:', error);
      throw error;
    }
  }

  static async update(id: string, data: Partial<ICheckIn>): Promise<ICheckIn | null> {
    try {
      return await CheckIn.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      }).populate('habitId');
    } catch (error) {
      logger.error('Error updating check-in:', error);
      throw error;
    }
  }

  static async delete(id: string): Promise<ICheckIn | null> {
    try {
      return await CheckIn.findByIdAndDelete(id);
    } catch (error) {
      logger.error('Error deleting check-in:', error);
      throw error;
    }
  }

  static async updateHabitStats(habitId: string | { _id: string }): Promise<void> {
    try {
      // Извлекаем ID привычки, если передан объект
      const actualHabitId = typeof habitId === 'string' ? habitId : habitId._id;
      logger.info('Updating habit stats for habit ID:', actualHabitId);

      const habit = await Habit.findById(actualHabitId);
      if (!habit) {
        logger.warn(`Habit not found for ID: ${actualHabitId}`);
        return;
      }

      const checkIns = await CheckIn.find({ habitId: actualHabitId });
      const totalCheckIns = checkIns.length;
      const completedCheckIns = checkIns.filter(checkIn => checkIn.status).length;
      const completionRate = totalCheckIns > 0 ? (completedCheckIns / totalCheckIns) * 100 : 0;

      const streak = this.calculateStreak(checkIns);
      const longestStreak = this.calculateLongestStreak(checkIns);

      logger.info('Updating habit stats:', {
        habitId: actualHabitId,
        totalCheckIns,
        completedCheckIns,
        completionRate,
        streak,
        longestStreak
      });

      await Habit.findByIdAndUpdate(actualHabitId, {
        stats: {
          totalCheckIns,
          completedCheckIns,
          completionRate,
          currentStreak: streak,
          longestStreak,
        },
      });

      logger.info('Habit stats updated successfully');
    } catch (error) {
      logger.error('Error updating habit stats:', error);
      throw error;
    }
  }

  private static calculateStreak(checkIns: ICheckIn[]): number {
    if (checkIns.length === 0) return 0;

    const sortedCheckIns = [...checkIns].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
    let streak = 0;
    let currentDate = new Date();

    for (const checkIn of sortedCheckIns) {
      if (!checkIn.status) break;

      const checkInDate = new Date(checkIn.date);
      const diffDays = Math.floor((currentDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0 || diffDays === 1) {
        streak++;
        currentDate = checkInDate;
      } else {
        break;
      }
    }

    return streak;
  }

  private static calculateLongestStreak(checkIns: ICheckIn[]): number {
    if (checkIns.length === 0) return 0;

    const sortedCheckIns = [...checkIns].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
    let currentStreak = 0;
    let longestStreak = 0;
    let lastDate: Date | null = null;

    for (const checkIn of sortedCheckIns) {
      if (!checkIn.status) {
        currentStreak = 0;
        lastDate = null;
        continue;
      }

      const checkInDate = new Date(checkIn.date);
      if (lastDate) {
        const diffDays = Math.floor((checkInDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }

      longestStreak = Math.max(longestStreak, currentStreak);
      lastDate = checkInDate;
    }

    return longestStreak;
  }
} 