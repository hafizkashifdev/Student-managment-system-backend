import rateLimit from 'express-rate-limit';

const makeOptions = (windowMs, max, message) => ({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, statusCode: 429, message },
});

export const globalRateLimit = rateLimit(makeOptions(15 * 60 * 1000, 300, 'Too many requests'));

export const authRateLimit = rateLimit(makeOptions(15 * 60 * 1000, 20, 'Too many auth attempts'));

export const whatsappRateLimit = rateLimit(makeOptions(60 * 1000, 10, 'WhatsApp rate limit exceeded'));

export const reportRateLimit = rateLimit(makeOptions(60 * 1000, 5, 'Report generation rate limit exceeded'));
