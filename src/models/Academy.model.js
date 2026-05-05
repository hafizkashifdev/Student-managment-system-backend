import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    city: { type: String, trim: true },
    area: { type: String, trim: true },
    fullAddress: { type: String, trim: true },
  },
  { _id: false }
);

const subscriptionSchema = new mongoose.Schema(
  {
    plan: { type: String, enum: ['free', 'basic', 'standard', 'premium'], default: 'free' },
    studentLimit: { type: Number, default: 50 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    currency: { type: String, default: 'PKR' },
    timezone: { type: String, default: 'Asia/Karachi' },
    academicYear: { type: String },
    feeReminderDay: { type: Number, min: 1, max: 28, default: 5 },
    autoAbsentAlert: { type: Boolean, default: true },
    language: { type: String, enum: ['urdu', 'english'], default: 'urdu' },
  },
  { _id: false }
);

const academySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, trim: true },
    ownerName: { type: String, trim: true },
    whatsappNumber: { type: String, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    address: { type: addressSchema, default: () => ({}) },
    logo: { type: String },
    subscription: { type: subscriptionSchema, default: () => ({}) },
    settings: { type: settingsSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

academySchema.index({ email: 1 });
academySchema.index({ slug: 1 });
academySchema.index({ isActive: 1 });

academySchema.pre('save', function (next) {
  if (this.isNew && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 60);
  }
  next();
});

const Academy = mongoose.model('Academy', academySchema);
export default Academy;
