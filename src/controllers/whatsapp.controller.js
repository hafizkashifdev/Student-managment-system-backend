import { sendWhatsAppMessage, getWhatsAppStats } from '../services/whatsapp.service.js';
import { queueBulkWhatsApp } from '../services/notification.service.js';
import Notification from '../models/Notification.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';

export const sendSingle = asyncHandler(async (req, res) => {
  const { to, message, subType } = req.body;
  const notification = await sendWhatsAppMessage(to, message, {
    academyId: req.academyId,
    subType: subType || 'custom',
  });
  res.json(new ApiResponse(200, notification, 'Message sent'));
});

export const sendBulk = asyncHandler(async (req, res) => {
  const { messages } = req.body;
  const enriched = messages.map((m) => ({
    ...m,
    meta: { ...m.meta, academyId: req.academyId },
  }));
  await queueBulkWhatsApp(enriched);
  res.json(new ApiResponse(200, { queued: messages.length }, `${messages.length} messages queued`));
});

export const getLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = parsePagination(req.query);
  const filter = { academyId: req.academyId, type: 'whatsapp' };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.subType) filter.subType = req.query.subType;

  const [logs, total] = await Promise.all([
    Notification.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
  ]);

  res.json(new ApiResponse(200, logs, 'Logs fetched', buildPaginationMeta(total, page, limit)));
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await getWhatsAppStats(req.academyId);
  res.json(new ApiResponse(200, stats, 'Stats fetched'));
});

export const testConnection = asyncHandler(async (req, res) => {
  const { env } = await import('../config/environment.js');
  res.json(new ApiResponse(200, {
    configured: !!(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN),
    from: env.TWILIO_WHATSAPP_FROM,
  }, 'WhatsApp connection status'));
});
