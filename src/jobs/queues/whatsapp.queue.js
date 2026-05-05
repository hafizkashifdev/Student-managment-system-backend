import Bull from 'bull';
import { env } from '../../config/environment.js';
import { logger } from '../../config/logger.js';
import { QUEUE_NAMES } from '../../utils/constants.js';
import { isRedisConfigured } from './queue-check.js';

let whatsAppQueue;

export function getWhatsAppQueue() {
  if (whatsAppQueue) return whatsAppQueue;
  if (!isRedisConfigured()) return null;

  whatsAppQueue = new Bull(QUEUE_NAMES.WHATSAPP, env.REDIS_URL, {
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
    limiter: { max: 1, duration: 1000 },
  });

  whatsAppQueue.on('error', (err) => logger.error(`WhatsApp queue error: ${err?.message || err}`));
  whatsAppQueue.on('failed', (job, err) => logger.error(`WhatsApp job ${job.id} failed: ${err?.message || err}`));
  whatsAppQueue.on('completed', (job) => logger.info(`WhatsApp job ${job.id} completed`));

  return whatsAppQueue;
}
