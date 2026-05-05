import mongoose from 'mongoose';
import { STUDENT_STATUS } from '../utils/constants.js';

const parentSchema = new mongoose.Schema(
  {
    fatherName: { type: String, trim: true },
    motherName: { type: String, trim: true },
    primaryWhatsapp: { type: String, required: true, trim: true },
    secondaryWhatsapp: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    cnic: { type: String, trim: true },
    occupation: { type: String, trim: true },
    address: { type: String, trim: true },
  },
  { _id: false }
);

const admissionSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    number: { type: String },
    previousSchool: { type: String, trim: true },
  },
  { _id: false }
);

const feeInfoSchema = new mongoose.Schema(
  {
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeePlan' },
    monthlyAmount: { type: Number, default: 0 },
    discount: {
      type: { type: String, enum: ['percent', 'fixed'], default: 'fixed' },
      value: { type: Number, default: 0 },
    },
    netAmount: { type: Number, default: 0 },
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true },
    studentId: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female'], required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    rollNumber: { type: String, trim: true },
    photo: { type: String },
    parent: { type: parentSchema, required: true },
    admission: { type: admissionSchema, default: () => ({}) },
    fee: { type: feeInfoSchema, default: () => ({}) },
    status: { type: String, enum: Object.values(STUDENT_STATUS), default: STUDENT_STATUS.ACTIVE },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

studentSchema.index({ academyId: 1, status: 1 });
studentSchema.index({ academyId: 1, classId: 1 });
studentSchema.index({ academyId: 1, studentId: 1 }, { unique: true, sparse: true });
studentSchema.index({ academyId: 1, name: 'text' });
studentSchema.index({ academyId: 1, isDeleted: 1 });

const Student = mongoose.model('Student', studentSchema);
export default Student;
