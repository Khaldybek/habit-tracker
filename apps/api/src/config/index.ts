import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  
  // Database
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/habit-tracker',
  
  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    expiresIn: '7d',
    refreshExpiresIn: '7d',
  },
  
  // Email
  email: {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    from: process.env.EMAIL_FROM || 'noreply@habit-tracker.com',
  },
  
  // Storage
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    local: {
      path: process.env.STORAGE_LOCAL_PATH || 'uploads',
    },
    s3: {
      bucket: process.env.STORAGE_S3_BUCKET,
      region: process.env.STORAGE_S3_REGION,
      accessKeyId: process.env.STORAGE_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.STORAGE_S3_SECRET_ACCESS_KEY,
    },
  },
  
  // Monitoring
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
    prometheusEnabled: process.env.PROMETHEUS_ENABLED === 'true',
  },
  
  // Feature flags
  features: {
    social: process.env.ENABLE_SOCIAL_FEATURES === 'true',
    challenges: process.env.ENABLE_CHALLENGES === 'true',
    notifications: process.env.ENABLE_NOTIFICATIONS === 'true',
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
} as const;

// Type for the config object
export type Config = typeof config; 