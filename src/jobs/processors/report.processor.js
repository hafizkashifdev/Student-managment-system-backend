import { getReportQueue } from '../queues/report.queue.js';
import { generateMonthlyReport } from '../../services/report.service.js';
import Academy from '../../models/Academy.model.js';
import { logger } from '../../config/logger.js';

/**
 * Register the async report generation processor.
 */
export function registerReportProcessor() {
  const queue = getReportQueue();
  if (!queue) return;

  queue.process(async (job) => {
    const { academyId, month, type } = job.data;
    logger.info(`Processing report job: ${type} for ${academyId}`);

    const academy = await Academy.findById(academyId).lean();
    if (!academy) throw new Error('Academy not found');

    if (type === 'monthly') {
      const { url } = await generateMonthlyReport(academyId, academy, month);
      return { url };
    }

    throw new Error(`Unknown report type: ${type}`);
  });

  logger.info('Report processor registered');
}
