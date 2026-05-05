import cron from 'node-cron';
import Academy from '../../models/Academy.model.js';
import Teacher from '../../models/Teacher.model.js';
import { queueWhatsApp } from '../../services/notification.service.js';
import { salarySlipTemplate } from '../../utils/urduMessages.js';
import { formatDate, toMonthString } from '../../utils/dateHelper.js';
import { logger } from '../../config/logger.js';

/**
 * 25th of every month at 10AM (Karachi): Notify teachers of upcoming salary.
 */
export function scheduleSalaryNotifications() {
  cron.schedule(
    '0 10 25 * *',
    async () => {
      logger.info('Running salary notification scheduler');
      try {
        const month = toMonthString(new Date());
        const academies = await Academy.find({ isActive: true }).lean();

        for (const academy of academies) {
          const teachers = await Teacher.find({
            academyId: academy._id,
            isActive: true,
            isDeleted: false,
            'salary.amount': { $gt: 0 },
            whatsappNumber: { $exists: true, $ne: '' },
          }).lean();

          for (const teacher of teachers) {
            const body = salarySlipTemplate({
              academyName: academy.name,
              teacherName: teacher.name,
              amount: teacher.salary.amount,
              month,
              date: formatDate(new Date()),
              slipUrl: 'Salary slip will be shared soon.',
            });

            await queueWhatsApp(teacher.whatsappNumber, body, {
              academyId: academy._id.toString(),
              subType: 'salary_slip',
              relatedId: teacher._id,
              relatedModel: 'Teacher',
            });
          }

          logger.info(`Queued salary notifications for ${teachers.length} teachers in ${academy.name}`);
        }
      } catch (err) {
        logger.error(`Salary notification scheduler failed: ${err.message}`);
      }
    },
    { timezone: 'Asia/Karachi' }
  );

  logger.info('Salary notification scheduler registered (25th of month, 10AM Karachi)');
}
