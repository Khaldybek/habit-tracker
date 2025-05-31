import mongoose, { Document, Schema } from 'mongoose';
import { IHabit } from './Habit';

export interface ICheckIn extends Document {
  habitId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: string;
  status: boolean | number;
  note?: string;
  mood?: 1 | 2 | 3 | 4 | 5;
  duration?: number;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  createdAt: Date;
  habit?: IHabit; // For populated habit
}

const checkInSchema = new Schema<ICheckIn>(
  {
    habitId: {
      type: Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    status: {
      type: Schema.Types.Mixed,
      required: true,
      validate: {
        validator: function(v: any) {
          return typeof v === 'boolean' || (typeof v === 'number' && v >= 0);
        },
        message: 'Status must be either a boolean or a non-negative number',
      },
    },
    note: {
      type: String,
      trim: true,
    },
    mood: {
      type: Number,
      min: 1,
      max: 5,
    },
    duration: {
      type: Number,
      min: 0,
    },
    location: {
      lat: {
        type: Number,
        required: function() {
          return this.location !== undefined;
        },
      },
      lng: {
        type: Number,
        required: function() {
          return this.location !== undefined;
        },
      },
      address: {
        type: String,
        required: function() {
          return this.location !== undefined;
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
checkInSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });
checkInSchema.index({ userId: 1, date: 1 });

export const CheckIn = mongoose.model<ICheckIn>('CheckIn', checkInSchema); 