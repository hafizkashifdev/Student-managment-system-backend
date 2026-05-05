import mongoose from 'mongoose';
import { PAYMENT_METHODS } from '../utils/constants.js';

const feePaymentSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    month: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0 },
    lateFee: { type: Number, default: 0 },
    netPaid: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      default: PAYMENT_METHODS.CASH,
    },
    receiptNumber: { type: String },
    paidBy: { type: String, trim: true },
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, trim: true },
    receiptUrl: { type: String },
    whatsappSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

feePaymentSchema.index({ academyId: 1, studentId: 1, month: 1 }, { unique: true });
feePaymentSchema.index({ academyId: 1, month: 1 });
feePaymentSchema.index({ academyId: 1, createdAt: -1 });
feePaymentSchema.index({ receiptNumber: 1 });

const FeePayment = mongoose.model('FeePayment', feePaymentSchema);
export default FeePayment;
