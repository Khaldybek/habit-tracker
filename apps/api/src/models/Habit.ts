import mongoose, { Document, Schema } from 'mongoose';

export interface IHabit extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  icon: string;
  color: string;
  category: string;
  frequency: {
    type: 'daily' | 'weekly' | 'monthly';
    days?: number[];
    times?: number;
  };
  target?: {
    type: 'boolean' | 'number' | 'duration';
    value?: number;
    unit?: string;
  };
  reminderEnabled: boolean;
  reminderTime?: string;
  startDate: Date;
  endDate?: Date;
  archived: boolean;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const habitSchema = new Schema<IHabit>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
      default: '#4F46E5', // Indigo-600
    },
    category: {
      type: String,
      required: true,
      enum: ['health', 'productivity', 'learning', 'fitness', 'mindfulness', 'other'],
    },
    frequency: {
      type: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        required: true,
      },
      days: [Number],
      times: Number,
    },
    target: {
      type: {
        type: String,
        enum: ['boolean', 'number', 'duration'],
      },
      value: {
        type: Number,
        min: 0,
      },
      unit: String,
    },
    reminderEnabled: {
      type: Boolean,
      default: false,
    },
    reminderTime: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    tags: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
habitSchema.index({ userId: 1, createdAt: -1 });
habitSchema.index({ userId: 1, archived: 1 });
habitSchema.index({ userId: 1, category: 1 });

export const Habit = mongoose.model<IHabit>('Habit', habitSchema); 