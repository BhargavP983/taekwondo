import mongoose, { Schema } from 'mongoose';
import { ICadetDocument } from './interfaces';

const cadetSchema = new Schema<ICadetDocument>(
  {
    entryId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true
    },
    weightCategory: {
      type: String,
      required: false,
      trim: true
    },
    name: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    age: {
      type: Number,
      required: true,
      min: 5,
      max: 50
    },
    weight: {
      type: Number,
      required: true,
      min: 10,
      max: 150
    },
    parentGuardianName: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    district: {
      type: String,
      trim: true,
      index: true,
      required: true
    },
    presentBeltGrade: {
      type: String,
      trim: true
    },
    tfiIdCardNo: {
      type: String,
      trim: true,
    },
    academicQualification: {
      type: String,
      trim: true
    },
    schoolName: {
      type: String,
      trim: true
    },
    formFileName: {
      type: String
    }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt
  }
);

// Indexes for faster searches
cadetSchema.index({ name: 1 });
cadetSchema.index({ createdAt: -1 });
// Ensure uniqueness only for non-empty TFI ID values (allow multiple blank strings)
cadetSchema.index(
  { tfiIdCardNo: 1 },
  { unique: true, partialFilterExpression: { tfiIdCardNo: { $exists: true, $gt: '' } } }
);

export const Cadet = mongoose.model<ICadetDocument>('Cadet', cadetSchema);