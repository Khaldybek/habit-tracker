import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config';
import { logger } from '../utils/logger';
import { generateToken } from '../utils/jwt';
import { hashPassword, comparePassword } from '../utils/password';
import { sendEmail } from '../utils/email';
import { Types } from 'mongoose';

export const register: RequestHandler = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    logger.info(`Registration attempt for email: ${email}`);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn(`User already exists with email: ${email}`);
      res.status(400).json({
        status: 'error',
        message: 'User with this email already exists',
      });
      return;
    }

    // Create new user
    const hashedPassword = await hashPassword(password);
    const user = new User({
      email,
      password: hashedPassword,
      name,
    });

    await user.save();
    logger.info(`User registered successfully: ${email}`);

    // Generate token
    const token = generateToken((user._id as Types.ObjectId).toString());

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
        },
        token,
      },
    });
  } catch (error) {
    logger.error('Register error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error registering user',
    });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    logger.info(`Login attempt for email: ${email}`);

    // Find user
    const user = await User.findOne({ email });
    logger.info(`User search result: ${user ? 'found' : 'not found'}`);
    
    if (!user) {
      logger.warn(`User not found for email: ${email}`);
      res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
      return;
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    logger.info(`Password validation result: ${isPasswordValid}`);
    logger.info(`Stored password hash: ${user.password}`);
    
    if (!isPasswordValid) {
      logger.warn(`Invalid password for email: ${email}`);
      res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
      return;
    }

    // Generate token
    const token = generateToken((user._id as Types.ObjectId).toString());
    logger.info(`Login successful for email: ${email}`);

    res.json({
      status: 'success',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
        },
        token,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error logging in',
    });
  }
};

export const getProfile: RequestHandler = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
      return;
    }

    res.json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching profile',
    });
  }
};

export const updateProfile: RequestHandler = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Check if email is already in use
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existingUser) {
        res.status(400).json({
          status: 'error',
          message: 'Email already in use',
        });
        return;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
      return;
    }

    res.json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating profile',
    });
  }
};

export const changePassword: RequestHandler = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
      return;
    }

    // Check current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect',
      });
      return;
    }

    // Update password
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    res.json({
      status: 'success',
      message: 'Password updated successfully',
    });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error changing password',
    });
  }
};

export const forgotPassword: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
      return;
    }

    // Generate reset token
    const resetToken = generateToken((user._id as Types.ObjectId).toString(), '1h');

    // Save token
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset',
      text: `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`,
    });

    res.json({
      status: 'success',
      message: 'Password reset email sent',
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error sending password reset email',
    });
  }
};

export const resetPassword: RequestHandler = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({
        status: 'error',
        message: 'Password reset token is invalid or has expired',
      });
      return;
    }

    // Update password
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      status: 'success',
      message: 'Password has been reset',
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error resetting password',
    });
  }
}; 