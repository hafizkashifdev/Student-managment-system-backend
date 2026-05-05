import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

subjectSchema.index({ academyId: 1, classId: 1 });

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;
