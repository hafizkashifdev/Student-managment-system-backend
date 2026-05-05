import Redis from 'ioredis';
import { env } from './environment.js';
import { logger } from './logger.js';

let redisClient = null;
export let isRedisAvailable = false;

/**
 * Create and return a singleton Redis client.
 * @returns {Redis|null}
 */
export function getRedisClient() {
  if (redisClient) return redisClient;
  if (!env.REDIS_URL) return null;

  redisClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy(times) {
      if (times > 3) {
        logger.warn('Redis: not available — caching disabled');
        return null; // stop retrying
      }
      return Math.min(times * 200, 1000);
    },
  });

  redisClient.on('connect', () => logger.info('Redis connected'));
  redisClient.on('ready', () => {
    logger.info('Redis ready');
    isRedisAvailable = true;
  });
  redisClient.on('error', () => {
    isRedisAvailable = false;
  });
  redisClient.on('close', () => {
    isRedisAvailable = false;
  });

  return redisClient;
}

/**
 * Connect to Redis — optional, will not crash if unavailable
 */
export async function connectRedis() {
  // Skip if no REDIS_URL configured
  if (!env.REDIS_URL) {
    logger.warn('Redis: REDIS_URL not set — caching disabled');
    return;
  }

  try {
    const client = getRedisClient();
    if (!client) return;
    await client.connect();
    isRedisAvailable = true;
    logger.info('Redis connected successfully');
  } catch (err) {
    // ⚠️ Do NOT throw — just warn and continue
    isRedisAvailable = false;
    logger.warn(`Redis unavailable — server continues without cache: ${err.message}`);
  }
}

export async function disconnectRedis() {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('Redis disconnected');
    } catch (err) {
      logger.warn(`Redis disconnect error: ${err.message}`);
    }
  }
}