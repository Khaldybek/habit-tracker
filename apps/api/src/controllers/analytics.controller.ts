import { Request, Response, NextFunction } from 'express';
import { CheckIn } from '../models/CheckIn';
import { Habit } from '../models/Habit';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { Types } from 'mongoose';
import { format } from 'date-fns';

export const getHabitStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { habitId } = req.params;
    const { startDate, endDate, period = 'week' } = req.query;
    const userId = req.user._id;

    // Validate habit ownership
    const habit = await Habit.findOne({
      _id: habitId,
      userId: req.user._id,
    });

    if (!habit) {
      res.status(404).json({
        status: 'error',
        message: 'Habit not found',
      });
      return;
    }

    // Build date range query
    const dateQuery: any = {
      habitId: new Types.ObjectId(habitId),
      userId: new Types.ObjectId(userId),
    };

    if (startDate && endDate) {
      dateQuery.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    // Get check-ins
    const checkIns = await CheckIn.find(dateQuery).sort({ date: 1 });

    // Calculate statistics
    const total = checkIns.length;
    const completed = checkIns.filter(checkIn => checkIn.status).length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    // Calculate streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < checkIns.length; i++) {
      if (checkIns[i].status) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        if (i === checkIns.length - 1) {
          currentStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    }

    // Calculate mood statistics
    const moodStats = checkIns.reduce((acc: any, checkIn) => {
      if (checkIn.mood) {
        acc.total += checkIn.mood;
        acc.count++;
      }
      return acc;
    }, { total: 0, count: 0 });

    const averageMood = moodStats.count > 0 ? moodStats.total / moodStats.count : null;

    // Calculate duration statistics
    const durationStats = checkIns.reduce((acc: any, checkIn) => {
      if (checkIn.duration) {
        acc.total += checkIn.duration;
        acc.count++;
        if (checkIn.duration > acc.max) acc.max = checkIn.duration;
        if (checkIn.duration < acc.min || acc.min === null) acc.min = checkIn.duration;
      }
      return acc;
    }, { total: 0, count: 0, max: 0, min: null });

    const averageDuration = durationStats.count > 0 ? durationStats.total / durationStats.count : null;

    // Calculate by period
    const byPeriod = groupByPeriod(checkIns, period as string);

    // Calculate trends
    const trends = calculateTrends(checkIns, period as string);

    res.json({
      status: 'success',
      data: {
        habit: {
          id: habit._id,
          title: habit.title,
          category: habit.category,
        },
        stats: {
          total,
          completed,
          completionRate,
          streak: currentStreak,
          averageMood,
          duration: {
            average: averageDuration,
            max: durationStats.max,
            min: durationStats.min,
          },
          byPeriod,
          trends,
        },
        checkIns,
      },
    });
  } catch (error) {
    logger.error('Get habit stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching habit statistics',
    });
  }
};

export const getUserStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { startDate, endDate, period = 'month' } = req.query;
    const userId = req.user._id;

    // Build date range query
    const dateQuery: any = { userId: new Types.ObjectId(userId) };
    if (startDate && endDate) {
      dateQuery.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    // Get all habits
    const habits = await Habit.find({ userId });
    const habitIds = habits.map(h => h._id);

    // Get all check-ins with populated habitId
    const checkIns = await CheckIn.find({
      ...dateQuery,
      habitId: { $in: habitIds },
    }).populate<{ habitId: { _id: string; title: string; category: string } }>('habitId', 'title category');

    // Calculate category statistics
    const categoryStats = habits.reduce((acc: any, habit) => {
      if (!acc[habit.category]) {
        acc[habit.category] = {
          total: 0,
          completed: 0,
          habits: [],
        };
      }
      acc[habit.category].total++;
      acc[habit.category].habits.push({
        id: habit._id,
        title: habit.title,
      });
      return acc;
    }, {});

    // Calculate completion rates by category
    checkIns.forEach(checkIn => {
      const habit = checkIns.find(c => c.habitId._id.toString() === checkIn.habitId._id.toString());
      if (habit && categoryStats[habit.habitId.category]) {
        categoryStats[habit.habitId.category].completed++;
      }
    });

    // Calculate overall statistics
    const totalHabits = habits.length;
    const totalCheckIns = checkIns.length;
    const completedCheckIns = checkIns.filter(checkIn => checkIn.status).length;
    const overallCompletionRate = totalCheckIns > 0 ? (completedCheckIns / totalCheckIns) * 100 : 0;

    // Calculate mood trends
    const moodTrends = checkIns.reduce((acc: any, checkIn) => {
      if (checkIn.mood) {
        const date = checkIn.date;
        if (!acc[date]) {
          acc[date] = { total: 0, count: 0 };
        }
        acc[date].total += checkIn.mood;
        acc[date].count++;
      }
      return acc;
    }, {});

    // Calculate average mood per day
    const averageMoodByDay = Object.entries(moodTrends).map(([date, stats]: [string, any]) => ({
      date,
      averageMood: stats.total / stats.count,
    }));

    // Calculate category breakdown
    const categoryBreakdown = calculateCategoryBreakdown(habits, checkIns);

    // Calculate mood trends
    const moodTrendsByPeriod = calculateMoodTrends(checkIns, period as string);

    // Calculate streaks
    const streaks = calculateAllStreaks(habits, checkIns);

    // Calculate productivity score
    const productivityScore = calculateProductivityScore(habits, checkIns);

    res.json({
      status: 'success',
      data: {
        overall: {
          totalHabits,
          totalCheckIns,
          completedCheckIns,
          completionRate: overallCompletionRate,
        },
        categories: categoryStats,
        moodTrends: averageMoodByDay,
        categoryBreakdown,
        streaks,
        productivityScore,
      },
    });
  } catch (error) {
    logger.error('Get user stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching user statistics',
    });
  }
};

export const exportData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { format = 'json', startDate, endDate } = req.query;
    const userId = req.user._id;

    // Get all habits
    const habits = await Habit.find({ userId });
    const checkIns = await CheckIn.find({
      userId,
      date: {
        $gte: startDate ? new Date(startDate as string) : new Date(0),
        $lte: endDate ? new Date(endDate as string) : new Date(),
      },
    });

    // Format data
    const data = {
      habits: habits.map(h => ({
        _id: h._id,
        title: h.title,
        description: h.description,
        category: h.category,
        frequency: h.frequency,
        target: h.target,
        startDate: h.startDate,
        endDate: h.endDate,
        createdAt: h.createdAt,
        updatedAt: h.updatedAt,
      })),
      checkIns: checkIns.map(c => ({
        _id: c._id,
        habitId: c.habitId,
        date: c.date,
        status: c.status,
        note: c.note,
        mood: c.mood,
        duration: c.duration,
        location: c.location,
        createdAt: c.createdAt,
        updatedAt: (c as any).updatedAt,
      })),
    };

    // Export data in selected format
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=habit-tracker-export.csv');
      res.send(convertToCSV(data));
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=habit-tracker-export.json');
    res.json(data);
  } catch (error) {
    logger.error('Export data error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error exporting data',
    });
  }
};

// Helper functions
function calculateStreak(checkIns: any[]): number {
  let currentStreak = 0;
  let maxStreak = 0;
  let lastDate: Date | null = null;

  for (const checkIn of checkIns) {
    if (!checkIn.status) {
      currentStreak = 0;
      continue;
    }

    const currentDate = new Date(checkIn.date);
    if (lastDate) {
      const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }

    maxStreak = Math.max(maxStreak, currentStreak);
    lastDate = currentDate;
  }

  return maxStreak;
}

function calculateAverageMood(checkIns: any[]): number {
  const moodValues: Record<string, number> = {
    great: 5,
    good: 4,
    neutral: 3,
    bad: 2,
    terrible: 1,
  };

  const validCheckIns = checkIns.filter(c => c.mood);
  if (!validCheckIns.length) return 0;

  const sum = validCheckIns.reduce((acc, c) => acc + (moodValues[c.mood] || 0), 0);
  return sum / validCheckIns.length;
}

function groupByPeriod(checkIns: any[], period: string): any {
  const grouped: any = {};
  const formatMap: Record<string, string> = {
    day: 'yyyy-MM-dd',
    week: 'yyyy-[W]ww',
    month: 'yyyy-MM',
  };

  checkIns.forEach(checkIn => {
    const date = new Date(checkIn.date);
    const key = format(date, formatMap[period] || formatMap.day);
    
    if (!grouped[key]) {
      grouped[key] = {
        total: 0,
        completed: 0,
        mood: [],
      };
    }

    grouped[key].total++;
    if (checkIn.status) {
      grouped[key].completed++;
    }
    if (checkIn.mood) {
      grouped[key].mood.push(checkIn.mood);
    }
  });

  return grouped;
}

function calculateTrends(checkIns: any[], period: string): any {
  const grouped = groupByPeriod(checkIns, period);
  const trends = {
    completionRate: [] as number[],
    mood: [] as number[],
  };

  Object.values(grouped).forEach((group: any) => {
    trends.completionRate.push((group.completed / group.total) * 100);
    if (group.mood.length) {
      trends.mood.push(calculateAverageMood(group.mood));
    }
  });

  return trends;
}

function calculateOverallCompletionRate(checkIns: any[], habits: any[]): number {
  const totalPossible = habits.reduce((acc, habit) => {
    const habitCheckIns = checkIns.filter(c => c.habitId.toString() === habit._id.toString());
    return acc + habitCheckIns.length;
  }, 0);

  if (!totalPossible) return 0;

  const completed = checkIns.filter(c => c.status).length;
  return (completed / totalPossible) * 100;
}

function calculateCategoryBreakdown(habits: any[], checkIns: any[]): any {
  const breakdown: any = {};
  
  habits.forEach(habit => {
    if (!breakdown[habit.category]) {
      breakdown[habit.category] = {
        total: 0,
        completed: 0,
      };
    }

    const habitCheckIns = checkIns.filter(c => c.habitId.toString() === habit._id.toString());
    breakdown[habit.category].total += habitCheckIns.length;
    breakdown[habit.category].completed += habitCheckIns.filter(c => c.status).length;
  });

  return breakdown;
}

function calculateMoodTrends(checkIns: any[], period: string): any {
  const grouped = groupByPeriod(checkIns, period);
  const trends: any = {};

  Object.entries(grouped).forEach(([key, group]: [string, any]) => {
    if (group.mood.length) {
      trends[key] = calculateAverageMood(group.mood);
    }
  });

  return trends;
}

function calculateAllStreaks(habits: any[], checkIns: any[]): any {
  return habits.map(habit => {
    const habitCheckIns = checkIns.filter(c => c.habitId.toString() === habit._id.toString());
    return {
      habitId: habit._id,
      title: habit.title,
      currentStreak: calculateStreak(habitCheckIns),
    };
  });
}

function calculateProductivityScore(habits: any[], checkIns: any[]): number {
  const weights = {
    completionRate: 0.4,
    streak: 0.3,
    mood: 0.3,
  };

  const completionRate = calculateOverallCompletionRate(checkIns, habits);
  const averageStreak = habits.reduce((acc, habit) => {
    const habitCheckIns = checkIns.filter(c => c.habitId.toString() === habit._id.toString());
    return acc + calculateStreak(habitCheckIns);
  }, 0) / habits.length;
  const averageMood = calculateAverageMood(checkIns);

  return (
    (completionRate * weights.completionRate) +
    (averageStreak * weights.streak) +
    (averageMood * weights.mood)
  );
}

function convertToCSV(data: any): string {
  const headers = [
    'Habit ID',
    'Habit Title',
    'Category',
    'Frequency',
    'Check-in Date',
    'Status',
    'Mood',
    'Note',
  ];

  const rows = data.habits.flatMap((habit: any) => {
    const habitCheckIns = data.checkIns.filter((c: any) => c.habitId.toString() === habit._id.toString());
    return habitCheckIns.map((checkIn: any) => [
      habit._id,
      habit.title,
      habit.category,
      habit.frequency,
      checkIn.date,
      checkIn.status,
      checkIn.mood,
      checkIn.note,
    ]);
  });

  return [
    headers.join(','),
    ...rows.map((row: any[]) => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');
} 