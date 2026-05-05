import './config/environment.js'; // validate env first
import app from './app.js';
import { connectDB, disconnectDB } from './config/database.js';
import { connectRedis, disconnectRedis } from './config/redis.js';
import { configureCloudinary } from './config/cloudinary.js';
import { logger } from './config/logger.js';
import { env } from './config/environment.js';

// ─── Queue Processors ─────────────────────────────────────────────────────────
import { registerWhatsAppProcessor } from './jobs/processors/whatsapp.processor.js';
import { registerFeeReminderProcessor } from './jobs/processors/fee-reminder.processor.js';
import { registerReportProcessor } from './jobs/processors/report.processor.js';

// ─── Schedulers ───────────────────────────────────────────────────────────────
import { scheduleDailyAbsentAlerts } from './jobs/schedulers/daily-attendance.scheduler.js';
import { scheduleMonthlyFeeReminders } from './jobs/schedulers/monthly-fee.scheduler.js';
import { scheduleSalaryNotifications } from './jobs/schedulers/salary.scheduler.js';

let server;

async function startServer() {
  try {
    // ── Infrastructure ──────────────────────────────────────────────────────
    await connectDB();
    await connectRedis();
    configureCloudinary();

    // ── Background Workers ──────────────────────────────────────────────────
    registerWhatsAppProcessor();
    registerFeeReminderProcessor();
    registerReportProcessor();

    // ── Scheduled Jobs ──────────────────────────────────────────────────────
    if (env.NODE_ENV !== 'test') {
      scheduleDailyAbsentAlerts();
      scheduleMonthlyFeeReminders();
      scheduleSalaryNotifications();
    }

    // ── HTTP Server ──────────────────────────────────────────────────────────
    server = app.listen(env.PORT, () => {
      logger.info(`✅ SMS Backend running on port ${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (err) {
    logger.error(`Fatal startup error: ${err.message}`);
    process.exit(1);
  }
}

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
async function shutdown(signal) {
  logger.info(`${signal} received — shutting down gracefully`);
  if (server) {
    server.close(async () => {
      await disconnectDB();
      await disconnectRedis();
      logger.info('Server shut down cleanly');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled rejection: ${reason}`);
  shutdown('unhandledRejection');
});

startServer();
