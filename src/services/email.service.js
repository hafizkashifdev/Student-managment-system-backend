import nodemailer from 'nodemailer';
import { env } from '../config/environment.js';
import { logger } from '../config/logger.js';

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  if (!env.SMTP_HOST || !env.SMTP_USER) {
    logger.warn('SMTP not configured — emails will not be sent');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });

  return transporter;
}

/**
 * Send a transactional email.
 * @param {object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 * @param {string} [options.text]
 */
export async function sendEmail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) return;

  try {
    await t.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ''),
    });
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    logger.error(`Email send failed to ${to}: ${err.message}`);
    throw err;
  }
}

/**
 * Send a password reset email.
 * @param {string} to
 * @param {string} resetUrl
 * @param {string} name
 */
export async function sendPasswordResetEmail(to, resetUrl, name) {
  await sendEmail({
    to,
    subject: 'Password Reset Request — SMS Platform',
    html: `
      <h2>Assalam o Alaikum ${name}!</h2>
      <p>You requested a password reset. Click the link below (valid for 1 hour):</p>
      <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">
        Reset Password
      </a>
      <p>If you did not request this, please ignore this email.</p>
      <p>JazakAllah Khair<br/>SMS Academy Platform</p>
    `,
  });
}
