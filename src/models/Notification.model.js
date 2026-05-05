import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true },
    type: {
      type: String,
      enum: ['whatsapp', 'email', 'sms'],
      required: true,
    },
    subType: {
      type: String,
      enum: ['fee_reminder', 'absent_alert', 'fee_receipt', 'salary_slip', 'attendance_summary', 'custom'],
      required: true,
    },
    recipient: {
      name: { type: String },
      phone: { type: String },
      email: { type: String },
    },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['queued', 'sent', 'delivered', 'failed'],
      default: 'queued',
    },
    twilioSid: { type: String },
    errorMessage: { type: String },
    attempts: { type: Number, default: 0 },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
    relatedModel: { type: String },
  },
  { timestamps: true }
);

notificationSchema.index({ academyId: 1, status: 1 });
notificationSchema.index({ academyId: 1, createdAt: -1 });
notificationSchema.index({ academyId: 1, type: 1, subType: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
