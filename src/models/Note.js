import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    subject_id: {
      type: String,
      ref: 'Subject',
      required: [true, 'Subject is required'],
      index: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be between 1 and 8'],
      max: [8, 'Semester must be between 1 and 8'],
      index: true,
    },
    file_name: {
      type: String,
      required: [true, 'File name is required'],
    },
    file_path: {
      type: String,
      required: [true, 'File path / Cloudinary Public ID is required'],
    },
    file_url: {
      type: String,
      required: [true, 'File Cloudinary URL is required'],
    },
    file_size: {
      type: Number,
      required: [true, 'File size is required'],
    },
    cloudinary_public_id: {
      type: String,
      default: null,
    },
    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader user ID is required'],
      index: true,
    },
    downloads: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.created_at = ret.createdAt;
        ret.updated_at = ret.updatedAt;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.created_at = ret.createdAt;
        ret.updated_at = ret.updatedAt;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Virtual relationships for frontend compatibility
noteSchema.virtual('subjects', {
  ref: 'Subject',
  localField: 'subject_id',
  foreignField: '_id',
  justOne: true,
});

noteSchema.virtual('users', {
  ref: 'User',
  localField: 'uploaded_by',
  foreignField: '_id',
  justOne: true,
});

noteSchema.virtual('uploader', {
  ref: 'User',
  localField: 'uploaded_by',
  foreignField: '_id',
  justOne: true,
});

// Text index for search
noteSchema.index({ title: 'text', description: 'text' });
noteSchema.index({ createdAt: -1 });

export const Note = mongoose.model('Note', noteSchema);
export default Note;
