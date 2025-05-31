import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';
import routes from './routes';
import { Scheduler } from './utils/scheduler';
import { NotificationService } from './services/notification.service';

// Create Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  ...config.cors,
  methods: [...config.cors.methods],
  allowedHeaders: [...config.cors.allowedHeaders],
})); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // HTTP request logger

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

async function startServer(): Promise<void> {
  try {
    // Connect to database
    await connectDatabase();

    // Initialize scheduler
    const scheduler = new Scheduler(new NotificationService());
    await scheduler.scheduleReminders();

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      scheduler.stopAllJobs();
      process.exit(0);
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received. Shutting down gracefully...');
      scheduler.stopAllJobs();
      process.exit(0);
    });

    app.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 