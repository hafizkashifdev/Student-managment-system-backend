import { getFeeReminderQueue } from '../queues/fee-reminder.queue.js';
import { getPendingFees } from '../../services/fee.service.js';
import { queueWhatsApp } from '../../services/notification.service.js';
import { feeReminderTemplate } from '../../utils/urduMessages.js';
import Academy from '../../models/Academy.model.js';
import { formatDate, toMonthString } from '../../utils/dateHelper.js';
import { logger } from '../../config/logger.js';

/**
 * Register the fee-reminder job processor.
 */
export function registerFeeReminderProcessor() {
  const queue = getFeeReminderQueue();
  if (!queue) return;

  queue.process(async (job) => {
    const { academyId, month } = job.data;
    logger.info(`Processing fee reminders for academy ${academyId}, month ${month}`);

    const academy = await Academy.findById(academyId).lean();
    if (!academy) return;

    const { students } = await getPendingFees(academyId, { month, limit: '500' });

    for (const student of students) {
      const phone = student.parent?.primaryWhatsapp;
      if (!phone) continue;

      const body = feeReminderTemplate({
        academyName: academy.name,
        parentName: student.parent.fatherName || 'Walid',
        studentName: student.name,
        className: student.classId?.name || '',
        amount: student.fee?.netAmount || student.fee?.monthlyAmount || 0,
        month,
        dueDate: formatDate(new Date()),
      });

      await queueWhatsApp(phone, body, {
        academyId,
        subType: 'fee_reminder',
        relatedId: student._id,
        relatedModel: 'Student',
        recipientName: student.parent.fatherName,
      });
    }

    logger.info(`Queued ${students.length} fee reminders for ${academyId}`);
  });

  logger.info('Fee reminder processor registered');
}
