import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true },
    name: { type: String, required: true, trim: true },
    section: { type: String, trim: true },
    grade: { type: String, trim: true },
    classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    capacity: { type: Number, default: 40 },
    room: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

classSchema.index({ academyId: 1, isActive: 1 });
classSchema.index({ academyId: 1, name: 1, section: 1 });

const Class = mongoose.model('Class', classSchema);
export default Class;
