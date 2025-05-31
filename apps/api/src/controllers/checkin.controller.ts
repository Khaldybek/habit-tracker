import { Request, Response, NextFunction, RequestHandler } from 'express';
import { CheckIn, ICheckIn } from '../models/CheckIn';
import { Habit, IHabit } from '../models/Habit';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { CheckInService } from '../services/checkin.service';
import { NotificationService } from '../services/notification.service';
import mongoose from 'mongoose';

export const createCheckIn: RequestHandler = async (req, res) => {
  try {
    const { habitId, date, status, note, mood, duration, location } = req.body;
    logger.info('Creating check-in with data:', { habitId, date, status, note, mood, duration, location });

    // Проверяем существование привычки
    const habit = await Habit.findOne({
      _id: habitId,
      userId: req.user._id,
    });

    if (!habit) {
      logger.warn(`Habit not found: ${habitId}`);
      res.status(404).json({
        status: 'error',
        message: 'Habit not found',
      });
      return;
    }

    // Форматируем дату в YYYY-MM-DD
    const formattedDate = new Date(date).toISOString().split('T')[0];
    logger.info('Formatted date:', formattedDate);

    // Преобразуем status в boolean
    const isCompleted = status === 'completed' || status === true;
    logger.info('Status converted to boolean:', isCompleted);

    // Проверяем существование чек-ина на эту дату
    const existingCheckIn = await CheckIn.findOne({
      habitId,
      date: formattedDate,
    });

    if (existingCheckIn) {
      logger.warn(`Check-in already exists for date: ${formattedDate}`);
      res.status(400).json({
        status: 'error',
        message: 'Check-in already exists for this date',
      });
      return;
    }

    // Преобразуем location если он есть
    let formattedLocation;
    if (location) {
      formattedLocation = {
        lat: location.latitude || location.lat,
        lng: location.longitude || location.lng,
        address: location.address || 'Unknown location'
      };
    }

    const checkIn = new CheckIn({
      habitId,
      userId: req.user._id,
      date: formattedDate,
      status: isCompleted,
      note,
      mood,
      duration,
      location: formattedLocation,
    });

    logger.info('Saving check-in:', checkIn.toObject());
    await checkIn.save();
    logger.info('Check-in saved successfully');

    // Обновляем статистику привычки
    await CheckInService.updateHabitStats(habitId.toString());

    // Создаем уведомление
    await NotificationService.createNotification({
      userId: req.user._id,
      type: 'checkin',
      title: 'Check-in Created',
      message: `You've completed "${habit.title}" for ${formattedDate}`,
      data: {
        habitId,
        checkInId: checkIn._id,
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        checkIn,
      },
    });
  } catch (error) {
    logger.error('Create check-in error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating check-in',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getCheckIns: RequestHandler = async (req, res) => {
  try {
    const { habitId, startDate, endDate, status, mood } = req.query;
    const { pagination } = req;

    // Базовый запрос
    const query: any = { userId: req.user._id };

    // Добавляем фильтры
    if (habitId) {
      query.habitId = habitId;
    }
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }
    if (status) {
      query.status = status;
    }
    if (mood) {
      query.mood = mood;
    }

    // Получаем общее количество
    const total = await CheckIn.countDocuments(query);

    // Получаем чек-ины с пагинацией
    const checkIns = await CheckIn.find(query)
      .populate('habitId')
      .sort(pagination?.sort || { date: -1 })
      .skip(pagination?.skip || 0)
      .limit(pagination?.limit || 10);

    res.json({
      status: 'success',
      data: {
        items: checkIns,
        pagination: {
          page: pagination?.page || 1,
          limit: pagination?.limit || 10,
          total,
          pages: Math.ceil(total / (pagination?.limit || 10))
        }
      }
    });
  } catch (error) {
    logger.error('Get check-ins error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching check-ins',
    });
  }
};

export const getCheckIn: RequestHandler = async (req, res) => {
  try {
    const checkIn = await CheckIn.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('habitId');

    if (!checkIn) {
      res.status(404).json({
        status: 'error',
        message: 'Check-in not found',
      });
      return;
    }

    res.json({
      status: 'success',
      data: {
        checkIn,
      },
    });
  } catch (error) {
    logger.error('Get check-in error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching check-in',
    });
  }
};

export const updateCheckIn = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    logger.info('Updating check-in with ID:', id);
    logger.info('Update data:', updateData);

    // Форматируем дату, если она предоставлена
    if (updateData.date) {
      updateData.date = new Date(updateData.date).toISOString().split('T')[0];
      logger.info('Formatted date:', updateData.date);
    }

    // Преобразуем статус в boolean, если он предоставлен
    if (typeof updateData.status === 'string') {
      updateData.status = updateData.status.toLowerCase() === 'true';
      logger.info('Status converted to boolean:', updateData.status);
    }

    // Форматируем местоположение, если оно предоставлено
    if (updateData.location) {
      updateData.location = {
        lat: parseFloat(updateData.location.lat),
        lng: parseFloat(updateData.location.lng),
        address: updateData.location.address,
      };
      logger.info('Formatted location:', updateData.location);
    }

    logger.info('Final update data:', updateData);

    const checkIn = await CheckInService.update(id, updateData);
    if (!checkIn) {
      return res.status(404).json({
        status: 'error',
        message: 'Check-in not found',
      });
    }

    logger.info('Check-in updated successfully:', checkIn);

    // Обновляем статистику привычки, используя только ID привычки
    if (checkIn.habitId) {
      const habitId = typeof checkIn.habitId === 'string' ? checkIn.habitId : checkIn.habitId._id.toString();
      await CheckInService.updateHabitStats(habitId);
    }

    res.json({
      status: 'success',
      data: checkIn,
    });
  } catch (error) {
    logger.error('Update check-in error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating check-in',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteCheckIn: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    logger.info('Attempting to delete check-in with ID:', id);

    // Проверяем существование чек-ина
    const checkIn = await CheckIn.findOne({
      _id: id,
      userId: req.user._id,
    }).populate('habitId');

    if (!checkIn) {
      logger.warn(`Check-in not found for deletion: ${id}`);
      res.status(404).json({
        status: 'error',
        message: 'Check-in not found',
      });
      return;
    }

    logger.info('Found check-in for deletion:', checkIn.toObject());

    // Удаляем чек-ин
    const deletedCheckIn = await CheckInService.delete(id);
    if (!deletedCheckIn) {
      logger.error(`Failed to delete check-in: ${id}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete check-in',
      });
      return;
    }

    logger.info('Check-in deleted successfully:', deletedCheckIn.toObject());

    // Обновляем статистику привычки
    if (checkIn.habitId) {
      const habitId = typeof checkIn.habitId === 'string' ? checkIn.habitId : checkIn.habitId._id.toString();
      logger.info('Updating habit stats for habit ID:', habitId);
      await CheckInService.updateHabitStats(habitId);
    }

    // Создаем уведомление
    const habitTitle = checkIn.habitId && typeof checkIn.habitId !== 'string' ? 
      (checkIn.habitId as unknown as IHabit).title : 'habit';
    
    await NotificationService.createNotification({
      userId: req.user._id,
      type: 'checkin',
      title: 'Check-in Deleted',
      message: `You've deleted your check-in for "${habitTitle}"`,
      data: {
        habitId: checkIn.habitId,
        action: 'deleted'
      },
    });

    res.json({
      status: 'success',
      data: null,
      message: 'Check-in deleted successfully',
    });
  } catch (error) {
    logger.error('Delete check-in error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting check-in',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}; 