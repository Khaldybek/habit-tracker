import { schedule } from 'node-cron';
import { Types } from 'mongoose';
import { Habit, IHabit } from '../models/Habit';
import { NotificationService } from '../services/notification.service';
import { logger } from './logger';

type HabitDocument = IHabit & { _id: Types.ObjectId };

export class Scheduler {
  private jobs: Map<string, ReturnType<typeof schedule>> = new Map();

  constructor(private notificationService: NotificationService) {}

  async scheduleReminders(): Promise<void> {
    try {
      const habits = await Habit.find({ reminderEnabled: true });
      for (const habit of habits) {
        await this.scheduleHabitReminder(habit as HabitDocument);
      }
      logger.info('Scheduled reminders for all habits');
    } catch (error) {
      logger.error('Error scheduling reminders:', error);
    }
  }

  async scheduleHabitReminder(habit: HabitDocument): Promise<void> {
    const habitId = habit._id.toString();
    if (!habit.reminderTime) {
      logger.warn(`No reminder time set for habit ${habitId}`);
      return;
    }

    const jobId = `habit-${habitId}`;
    if (this.jobs.has(jobId)) {
      this.jobs.get(jobId)?.stop();
    }

    const [hours, minutes] = habit.reminderTime.split(':').map(Number);
    const cronExpression = `${minutes} ${hours} * * *`;

    const task = schedule(cronExpression, async () => {
      try {
        const updatedHabit = await Habit.findById(habit._id);
        if (!updatedHabit || !updatedHabit.reminderEnabled) {
          this.removeHabitReminder(habitId);
          return;
        }

        await NotificationService.createReminderNotification(
          updatedHabit,
          updatedHabit.userId.toString()
        );
      } catch (error) {
        logger.error(`Error in reminder job for habit ${habitId}:`, error);
      }
    });

    this.jobs.set(jobId, task);
    logger.info(`Scheduled reminder for habit ${habitId} at ${habit.reminderTime}`);
  }

  async updateHabitReminder(habit: HabitDocument): Promise<void> {
    if (habit.reminderEnabled && habit.reminderTime) {
      await this.scheduleHabitReminder(habit);
    } else {
      this.removeHabitReminder(habit._id.toString());
    }
  }

  removeHabitReminder(habitId: string): void {
    const jobId = `habit-${habitId}`;
    const job = this.jobs.get(jobId);
    if (job) {
      job.stop();
      this.jobs.delete(jobId);
      logger.info(`Removed reminder for habit ${habitId}`);
    }
  }

  stopAllJobs(): void {
    for (const [jobId, job] of this.jobs) {
      job.stop();
      logger.info(`Stopped job ${jobId}`);
    }
    this.jobs.clear();
  }
} 