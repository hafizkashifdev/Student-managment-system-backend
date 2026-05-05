import mongoose from 'mongoose';
import { env } from './environment.js';
import { logger } from './logger.js';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

/**
 * Connect to MongoDB with exponential-backoff retry logic.
 * @param {number} attempt
 */
async function connectWithRetry(attempt = 1) {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`MongoDB connected (attempt ${attempt})`);
  } catch (err) {
    logger.error(`MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES}): ${err.message}`);
    if (attempt >= MAX_RETRIES) {
      logger.error('Max MongoDB retries reached. Exiting.');
      process.exit(1);
    }
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
    return connectWithRetry(attempt + 1);
  }
}

export async function connectDB() {
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'));
  await connectWithRetry();
}

export async function disconnectDB() {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
}
