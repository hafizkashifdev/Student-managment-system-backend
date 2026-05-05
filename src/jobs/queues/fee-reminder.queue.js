import Bull from 'bull';
import { env } from '../../config/environment.js';
import { logger } from '../../config/logger.js';
import { QUEUE_NAMES } from '../../utils/constants.js';
import { isRedisConfigured } from './queue-check.js';

let feeReminderQueue;

export function getFeeReminderQueue() {
  if (feeReminderQueue) return feeReminderQueue;
  if (!isRedisConfigured()) return null;

  feeReminderQueue = new Bull(QUEUE_NAMES.FEE_REMINDER, env.REDIS_URL, {
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: 'fixed', delay: 30000 },
      removeOnComplete: 50,
    },
  });

  feeReminderQueue.on('error', (err) => logger.error(`Fee reminder queue error: ${err?.message || err}`));
  feeReminderQueue.on('failed', (job, err) => logger.error(`Fee reminder job ${job.id} failed: ${err?.message || err}`));

  return feeReminderQueue;
}
