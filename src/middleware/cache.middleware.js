import { getRedisClient } from '../config/redis.js';
import { logger } from '../config/logger.js';

/**
 * Redis cache middleware — serves cached response if available.
 * Cache key is built from academyId + method + URL.
 * @param {number} ttlSeconds
 * @returns {Function}
 */
export function cacheResponse(ttlSeconds = 120) {
  return async (req, res, next) => {
    if (req.method !== 'GET') return next();

    const key = `cache:${req.academyId || 'public'}:${req.originalUrl}`;

    try {
      const redis = getRedisClient();
      const cached = await redis.get(key);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }

      const originalJson = res.json.bind(res);
      res.json = function (body) {
        if (res.statusCode === 200) {
          redis.setex(key, ttlSeconds, JSON.stringify(body)).catch((e) => logger.error(`Cache set failed: ${e.message}`));
        }
        return originalJson(body);
      };
    } catch (err) {
      logger.error(`Cache middleware error: ${err.message}`);
    }

    next();
  };
}

/**
 * Invalidate all cache keys matching a pattern prefix.
 * @param {string} pattern
 */
export async function invalidateCache(pattern) {
  try {
    const redis = getRedisClient();
    const keys = await redis.keys(`cache:*${pattern}*`);
    if (keys.length) await redis.del(...keys);
  } catch (err) {
    logger.error(`Cache invalidation failed: ${err.message}`);
  }
}
