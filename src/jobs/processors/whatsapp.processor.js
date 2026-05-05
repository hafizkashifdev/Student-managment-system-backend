import { getWhatsAppQueue } from '../queues/whatsapp.queue.js';
import { sendWhatsAppMessage } from '../../services/whatsapp.service.js';
import { logger } from '../../config/logger.js';

/**
 * Register the WhatsApp job processor on the queue.
 * Must be called once during app startup.
 */
export function registerWhatsAppProcessor() {
  const queue = getWhatsAppQueue();
  if (!queue) return;

  queue.process(async (job) => {
    const { to, body, meta } = job.data;
    logger.info(`Processing WhatsApp job ${job.id} → ${to}`);
    await sendWhatsAppMessage(to, body, meta);
  });

  logger.info('WhatsApp processor registered');
}
