import twilio from 'twilio';
import { env } from '../config/environment.js';
import Notification from '../models/Notification.model.js';
import { logger } from '../config/logger.js';

let twilioClient;

function getClient() {
  if (!twilioClient && env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
}

/**
 * Send a single WhatsApp message via Twilio.
 * @param {string} to - Phone number with country code (no whatsapp: prefix)
 * @param {string} body - Message text
 * @param {object} meta - { academyId, subType, relatedId, relatedModel, recipientName }
 * @returns {Promise<object>} Notification document
 */
export async function sendWhatsAppMessage(to, body, meta = {}) {
  const client = getClient();

  const notification = await Notification.create({
    academyId: meta.academyId,
    type: 'whatsapp',
    subType: meta.subType || 'custom',
    recipient: { name: meta.recipientName, phone: to },
    message: body,
    status: 'queued',
    relatedId: meta.relatedId,
    relatedModel: meta.relatedModel,
  });

  if (!client) {
    logger.warn('Twilio client not configured — message logged but not sent');
    notification.status = 'failed';
    notification.errorMessage = 'Twilio not configured';
    await notification.save();
    return notification;
  }

  try {
    const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const result = await client.messages.create({
      from: env.TWILIO_WHATSAPP_FROM,
      to: toFormatted,
      body,
    });

    notification.status = 'sent';
    notification.twilioSid = result.sid;
    notification.attempts = 1;
    await notification.save();
    logger.info(`WhatsApp sent to ${to}: ${result.sid}`);
  } catch (err) {
    notification.status = 'failed';
    notification.errorMessage = err.message;
    notification.attempts = 1;
    await notification.save();
    logger.error(`WhatsApp send failed to ${to}: ${err.message}`);
    throw err;
  }

  return notification;
}

/**
 * Get WhatsApp delivery statistics for an academy.
 * @param {string} academyId
 * @returns {Promise<object>}
 */
export async function getWhatsAppStats(academyId) {
  const stats = await Notification.aggregate([
    { $match: { academyId: new (await import('mongoose')).default.Types.ObjectId(academyId), type: 'whatsapp' } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  return stats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), { queued: 0, sent: 0, delivered: 0, failed: 0 });
}
