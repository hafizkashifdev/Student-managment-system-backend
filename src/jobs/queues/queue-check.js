import { isRedisAvailable } from '../../config/redis.js';
import { logger } from '../../config/logger.js';

let _warned = false;

export function isRedisConfigured() {
  if (isRedisAvailable) return true;
  if (!_warned) {
    logger.warn('Queues disabled - Redis not available');
    _warned = true;
  }
  return false;
}
