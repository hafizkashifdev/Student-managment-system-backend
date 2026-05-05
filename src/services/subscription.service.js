import Subscription from '../models/Subscription.model.js';
import Academy from '../models/Academy.model.js';
import { NotFoundError } from '../utils/ApiError.js';
import { env } from '../config/environment.js';
import { SUBSCRIPTION_PLANS } from '../utils/constants.js';

/**
 * Get subscription for an academy.
 * @param {string} academyId
 */
export async function getSubscription(academyId) {
  const sub = await Subscription.findOne({ academyId }).lean();
  if (!sub) throw new NotFoundError('Subscription');
  return sub;
}

/**
 * Upgrade or change subscription plan.
 * @param {string} academyId
 * @param {object} data
 */
export async function updateSubscription(academyId, data) {
  const { plan, months = 1, paymentMethod, transactionId, amount } = data;

  const studentLimit = env.ACADEMY_STUDENT_LIMITS[plan];
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + months);

  const sub = await Subscription.findOneAndUpdate(
    { academyId },
    {
      $set: { plan, studentLimit, startDate, endDate, isActive: true },
      $push: {
        paymentHistory: { amount, paidAt: new Date(), method: paymentMethod, transactionId, plan, months },
      },
    },
    { new: true, upsert: true }
  );

  await Academy.findByIdAndUpdate(academyId, {
    'subscription.plan': plan,
    'subscription.studentLimit': studentLimit,
    'subscription.startDate': startDate,
    'subscription.endDate': endDate,
    'subscription.isActive': true,
  });

  return sub;
}

/**
 * Check if an academy's subscription is still active.
 * @param {string} academyId
 * @returns {Promise<boolean>}
 */
export async function isSubscriptionActive(academyId) {
  const sub = await Subscription.findOne({ academyId }).lean();
  if (!sub || !sub.isActive) return false;
  if (sub.plan === SUBSCRIPTION_PLANS.FREE) return true;
  return sub.endDate ? sub.endDate > new Date() : true;
}
