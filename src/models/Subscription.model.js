import mongoose from 'mongoose';
import { SUBSCRIPTION_PLANS } from '../utils/constants.js';

const subscriptionSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true, unique: true },
    plan: {
      type: String,
      enum: Object.values(SUBSCRIPTION_PLANS),
      default: SUBSCRIPTION_PLANS.FREE,
    },
    studentLimit: { type: Number, default: 50 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    autoRenew: { type: Boolean, default: false },
    paymentHistory: [
      {
        amount: { type: Number },
        paidAt: { type: Date },
        method: { type: String },
        transactionId: { type: String },
        plan: { type: String },
        months: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

subscriptionSchema.index({ academyId: 1 });
subscriptionSchema.index({ plan: 1, isActive: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
