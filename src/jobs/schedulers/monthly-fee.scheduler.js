import cron from 'node-cron';
import Academy from '../../models/Academy.model.js';
import { getFeeReminderQueue } from '../queues/fee-reminder.queue.js';
import { toMonthString } from '../../utils/dateHelper.js';
import { logger } from '../../config/logger.js';

/**
 * 1st of every month at 9AM (Karachi): Queue fee reminders for all active academies.
 */
export function scheduleMonthlyFeeReminders() {
  cron.schedule(
    '0 9 1 * *',
    async () => {
      logger.info('Running monthly fee reminder scheduler');
      try {
        const queue = getFeeReminderQueue();
        if (!queue) return;

        const month = toMonthString(new Date());
        const academies = await Academy.find({ isActive: true }).lean();

        for (const academy of academies) {
          await queue.add({ academyId: academy._id.toString(), month }, { delay: 0 });
        }

        logger.info(`Scheduled fee reminders for ${academies.length} academies, month ${month}`);
      } catch (err) {
        logger.error(`Monthly fee reminder scheduler failed: ${err.message}`);
      }
    },
    { timezone: 'Asia/Karachi' }
  );

  logger.info('Monthly fee reminder scheduler registered (1st of month, 9AM Karachi)');
}
