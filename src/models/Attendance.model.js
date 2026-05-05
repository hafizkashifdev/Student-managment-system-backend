import mongoose from 'mongoose';
import { ATTENDANCE_STATUS } from '../utils/constants.js';

const attendanceRecordSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      required: true,
    },
    arrivalTime: { type: String },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notificationSent: { type: Boolean, default: false },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    date: { type: Date, required: true },
    records: [attendanceRecordSchema],
    markedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

attendanceSchema.index({ academyId: 1, date: -1 });
attendanceSchema.index({ academyId: 1, classId: 1, date: -1 });
attendanceSchema.index({ academyId: 1, 'records.studentId': 1, date: -1 });
attendanceSchema.index({ academyId: 1, classId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
