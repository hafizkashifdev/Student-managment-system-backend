import mongoose from 'mongoose';

const salarySchema = new mongoose.Schema(
  {
    amount: { type: Number, default: 0 },
    payDay: { type: Number, min: 1, max: 31, default: 1 },
    bankAccount: { type: String, trim: true },
    bankName: { type: String, trim: true },
  },
  { _id: false }
);

const teacherSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    whatsappNumber: { type: String, trim: true },
    cnic: { type: String, trim: true },
    photo: { type: String },
    subjects: [{ type: String, trim: true }],
    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    qualification: { type: String, trim: true },
    experience: { type: Number, default: 0 },
    joiningDate: { type: Date, default: Date.now },
    salary: { type: salarySchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

teacherSchema.index({ academyId: 1, isActive: 1 });
teacherSchema.index({ academyId: 1, isDeleted: 1 });
teacherSchema.index({ academyId: 1, name: 'text' });

const Teacher = mongoose.model('Teacher', teacherSchema);
export default Teacher;
