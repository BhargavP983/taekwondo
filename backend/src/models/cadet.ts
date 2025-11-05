import mongoose, { Schema, Document } from 'mongoose';

export interface ICadet extends Document {
  entryId: string;
  gender: string;
  weightCategory: string;
  name: string;
  dateOfBirth: Date;
  age: number;
  weight: number;
  parentGuardianName: string;
  state: string;
  presentBeltGrade: string;
  tfiIdCardNo: string;
  academicQualification: string;
  schoolName: string;
  formFileName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const cadetSchema = new Schema<ICadet>(
  {
    entryId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    gender: {
      type: String,
      enum: ['Boy', 'Girl'],
      required: true
    },
    weightCategory: {
      type: String,
      required: true,
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
      max: 18
    },
    weight: {
      type: Number,
      required: true,
      min: 10,
      max: 150
    },
    parentGuardianName: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    presentBeltGrade: {
      type: String,
      required: true,
      trim: true
    },
    tfiIdCardNo: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    academicQualification: {
      type: String,
      required: true,
      trim: true
    },
    schoolName: {
      type: String,
      required: true,
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

export const Cadet = mongoose.model<ICadet>('Cadet', cadetSchema);
