import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Habit } from '../models/Habit';
import { logger } from '../utils/logger';

export const createHabit: RequestHandler = async (req, res) => {
  try {
    const habit = new Habit({
      ...req.body,
      userId: req.user._id,
    });

    await habit.save();

    res.status(201).json({
      status: 'success',
      data: {
        habit,
      },
    });
  } catch (error) {
    logger.error('Create habit error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating habit',
    });
  }
};

export const getHabits: RequestHandler = async (req, res) => {
  try {
    const { search, category, tags, archived } = req.query;
    const { pagination } = req;

    // Базовый запрос
    const query: any = { userId: req.user._id };

    // Добавляем фильтры
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (tags) {
      query.tags = { $in: (tags as string).split(',') };
    }
    if (archived !== undefined) {
      query.archived = archived === 'true';
    }

    // Получаем общее количество
    const total = await Habit.countDocuments(query);

    // Получаем привычки с пагинацией
    const habits = await Habit.find(query)
      .sort(pagination?.sort || { createdAt: -1 })
      .skip(pagination?.skip || 0)
      .limit(pagination?.limit || 10);

    res.json({
      status: 'success',
      data: {
        items: habits,
        pagination: {
          page: pagination?.page || 1,
          limit: pagination?.limit || 10,
          total,
          pages: Math.ceil(total / (pagination?.limit || 10))
        }
      }
    });
  } catch (error) {
    logger.error('Get habits error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching habits',
    });
  }
};

export const getHabit: RequestHandler = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!habit) {
      res.status(404).json({
        status: 'error',
        message: 'Habit not found',
      });
      return;
    }

    res.json({
      status: 'success',
      data: {
        habit,
      },
    });
  } catch (error) {
    logger.error('Get habit error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching habit',
    });
  }
};

export const updateHabit: RequestHandler = async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!habit) {
      res.status(404).json({
        status: 'error',
        message: 'Habit not found',
      });
      return;
    }

    res.json({
      status: 'success',
      data: {
        habit,
      },
    });
  } catch (error) {
    logger.error('Update habit error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating habit',
    });
  }
};

export const deleteHabit: RequestHandler = async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!habit) {
      res.status(404).json({
        status: 'error',
        message: 'Habit not found',
      });
      return;
    }

    res.json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    logger.error('Delete habit error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting habit',
    });
  }
}; 