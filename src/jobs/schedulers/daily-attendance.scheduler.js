import cron from 'node-cron';
import Academy from '../../models/Academy.model.js';
import { getAbsentStudents } from '../../services/attendance.service.js';
import { queueWhatsApp } from '../../services/notification.service.js';
import { absentAlertTemplate } from '../../utils/urduMessages.js';
import { formatDate } from '../../utils/dateHelper.js';
import { logger } from '../../config/logger.js';

/**
 * Daily 8AM (Asia/Karachi): Send absent alerts for yesterday's attendance.
 */
export function scheduleDailyAbsentAlerts() {
  cron.schedule(
    '0 8 * * *',
    async () => {
      logger.info('Running daily absent alert job');
      try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const academies = await Academy.find({ isActive: true, 'settings.autoAbsentAlert': true }).lean();

        for (const academy of academies) {
          const absentStudents = await getAbsentStudents(academy._id.toString(), null, yesterday);

          for (const student of absentStudents) {
            const phone = student.parent?.primaryWhatsapp;
            if (!phone) continue;

            const body = absentAlertTemplate({
              academyName: academy.name,
              studentName: student.name,
              date: formatDate(yesterday),
              academyWhatsapp: academy.whatsappNumber || '',
            });

            await queueWhatsApp(phone, body, {
              academyId: academy._id.toString(),
              subType: 'absent_alert',
              relatedId: student._id,
              relatedModel: 'Student',
            });
          }

          logger.info(`Queued ${absentStudents.length} absent alerts for ${academy.name}`);
        }
      } catch (err) {
        logger.error(`Daily absent alert job failed: ${err.message}`);
      }
    },
    { timezone: 'Asia/Karachi' }
  );

  logger.info('Daily absent alert scheduler registered (8AM Karachi)');
}
