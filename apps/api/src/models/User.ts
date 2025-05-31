import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  avatar?: string;
  preferences: {
    reminderTime: string;
    timezone: string;
    language: string;
    theme: 'light' | 'dark';
    notifications: {
      email: boolean;
      push: boolean;
      telegram: boolean;
    };
  };
  stats: {
    totalHabits: number;
    completedToday: number;
    currentStreak: number;
    longestStreak: number;
  };
  social: {
    friends: mongoose.Types.ObjectId[];
    challenges: mongoose.Types.ObjectId[];
  };
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
    },
    preferences: {
      reminderTime: {
        type: String,
        default: '08:00',
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
      language: {
        type: String,
        default: 'en',
        enum: ['en', 'ru', 'kz'],
      },
      theme: {
        type: String,
        default: 'light',
        enum: ['light', 'dark'],
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
        telegram: {
          type: Boolean,
          default: false,
        },
      },
    },
    stats: {
      totalHabits: {
        type: Number,
        default: 0,
      },
      completedToday: {
        type: Number,
        default: 0,
      },
      currentStreak: {
        type: Number,
        default: 0,
      },
      longestStreak: {
        type: Number,
        default: 0,
      },
    },
    social: {
      friends: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
      }],
      challenges: [{
        type: Schema.Types.ObjectId,
        ref: 'Challenge',
      }],
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    // Пароль уже хешируется в hashPassword, поэтому здесь просто пропускаем
    next();
  } catch (error) {
    console.error('Error in pre-save hook:', error);
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    const result = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password comparison result:', result);
    return result;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

export const User = mongoose.model<IUser>('User', userSchema); 