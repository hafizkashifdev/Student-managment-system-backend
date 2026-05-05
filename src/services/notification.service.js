import { getWhatsAppQueue } from '../jobs/queues/whatsapp.queue.js';
import { logger } from '../config/logger.js';

/**
 * Queue a WhatsApp notification for async delivery.
 * @param {string} to
 * @param {string} body
 * @param {object} meta
 * @param {object} [jobOptions]
 */
export async function queueWhatsApp(to, body, meta = {}, jobOptions = {}) {
  try {
    const queue = getWhatsAppQueue();
    await queue.add({ to, body, meta }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 50,
      ...jobOptions,
    });
    logger.info(`WhatsApp queued for ${to}`);
  } catch (err) {
    logger.error(`Failed to queue WhatsApp for ${to}: ${err.message}`);
  }
}

/**
 * Queue bulk WhatsApp messages with rate-limiting spacing.
 * @param {Array<{ to: string, body: string, meta: object }>} messages
 */
export async function queueBulkWhatsApp(messages) {
  const queue = getWhatsAppQueue();
  const jobs = messages.map((m, i) => ({
    name: 'whatsapp',
    data: { to: m.to, body: m.body, meta: m.meta },
    opts: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      delay: i * 1100, // 1 msg/sec per academy
    },
  }));

  await queue.addBulk(jobs);
  logger.info(`Queued ${messages.length} WhatsApp messages`);
}
