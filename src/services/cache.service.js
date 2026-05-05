import { getRedisClient } from '../config/redis.js';
import { logger } from '../config/logger.js';

/**
 * @param {string} key
 * @param {number} ttl - seconds
 * @param {Function} fetcher - async function returning data
 * @returns {Promise<*>}
 */
export async function getOrSet(key, ttl, fetcher) {
  try {
    const redis = getRedisClient();
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);

    const data = await fetcher();
    await redis.setex(key, ttl, JSON.stringify(data));
    return data;
  } catch (err) {
    logger.error(`Cache getOrSet error (${key}): ${err.message}`);
    return fetcher();
  }
}

/**
 * @param {string} key
 */
export async function del(key) {
  try {
    await getRedisClient().del(key);
  } catch (err) {
    logger.error(`Cache del error: ${err.message}`);
  }
}

/**
 * Delete all keys matching a pattern.
 * @param {string} pattern
 */
export async function delByPattern(pattern) {
  try {
    const redis = getRedisClient();
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(...keys);
  } catch (err) {
    logger.error(`Cache delByPattern error: ${err.message}`);
  }
}

/**
 * @param {string} key
 * @param {*} value
 * @param {number} ttl
 */
export async function set(key, value, ttl) {
  try {
    await getRedisClient().setex(key, ttl, JSON.stringify(value));
  } catch (err) {
    logger.error(`Cache set error: ${err.message}`);
  }
}
