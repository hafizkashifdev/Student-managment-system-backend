import mongoose from 'mongoose';

const lateFeeSchema = new mongoose.Schema(
  {
    amount: { type: Number, default: 0 },
    gracePeriodDays: { type: Number, default: 5 },
  },
  { _id: false }
);

const feePlanSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true },
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    frequency: { type: String, enum: ['monthly', 'quarterly', 'annually'], default: 'monthly' },
    dueDay: { type: Number, min: 1, max: 28, default: 5 },
    lateFee: { type: lateFeeSchema, default: () => ({}) },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

feePlanSchema.index({ academyId: 1, isActive: 1 });

const FeePlan = mongoose.model('FeePlan', feePlanSchema);
export default FeePlan;
