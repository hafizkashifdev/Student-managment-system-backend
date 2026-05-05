import Bull from 'bull';
import { env } from '../../config/environment.js';
import { logger } from '../../config/logger.js';
import { QUEUE_NAMES } from '../../utils/constants.js';
import { isRedisConfigured } from './queue-check.js';

let reportQueue;

export function getReportQueue() {
  if (reportQueue) return reportQueue;
  if (!isRedisConfigured()) return null;

  reportQueue = new Bull(QUEUE_NAMES.REPORT, env.REDIS_URL, {
    defaultJobOptions: {
      attempts: 2,
      timeout: 120000,
      removeOnComplete: 20,
    },
  });

  reportQueue.on('error', (err) => logger.error(`Report queue error: ${err?.message || err}`));
  reportQueue.on('completed', (job) => logger.info(`Report job ${job.id} done`));

  return reportQueue;
}
