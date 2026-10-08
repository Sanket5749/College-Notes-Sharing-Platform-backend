import mongoose from 'mongoose';
import crypto from 'crypto';

const subjectSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID(),
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be between 1 and 8'],
      max: [8, 'Semester must be between 1 and 8'],
      index: true,
    },
    department: {
      type: String,
      required: [true, 'Department/Branch is required'],
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
    _id: false, // Disables Mongoose auto-ObjectId so our custom String _id is primary
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        ret.created_at = ret.createdAt;
        ret.updated_at = ret.updatedAt;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        ret.created_at = ret.createdAt;
        ret.updated_at = ret.updatedAt;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Unique compound index on name, semester, and department
subjectSchema.index({ name: 1, semester: 1, department: 1 }, { unique: true });

export const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;
