import mongoose, { Schema, Document } from 'mongoose';

export interface IPoomsae extends Document {
  entryId: string;
  division: string;
  category: string;
  gender: string;
  name: string;
  stateOrg: string;
  dateOfBirth: Date;
  age: number;
  weight: number;
  parentGuardianName?: string;
  mobileNo: string;
  currentBeltGrade?: string;
  tfiIdNo?: string;
  danCertificateNo?: string;
  academicQualification?: string;
  nameOfCollege?: string;
  nameOfBoardUniversity?: string;
  formFileName?: string;
  district: string;
  createdAt: Date;
  updatedAt: Date;
}

const poomsaeSchema = new Schema<IPoomsae>(
  {
    entryId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    division: {
      type: String,
      enum: ['Under 30', 'Under 40', 'Under 50', 'Under 60', 'Under 65', 'Over 65', 'Over 30'],
      required: true
    },
    category: {
      type: String,
      enum: ['Individual', 'Pair', 'Group'],
      required: true
    },
    gender: {
      type: String,
      enum: ['Male', 'Female'],
      required: true
    },
    name: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    stateOrg: {
      type: String,
      required: true,
      trim: true
    },
    district: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    age: {
      type: Number,
      required: true
    },
    weight: {
      type: Number,
      required: true
    },
    parentGuardianName: {
      type: String,
      trim: true
    },
    mobileNo: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit mobile number']
    },
    currentBeltGrade: {
      type: String,
      trim: true
    },
    tfiIdNo: {
      type: String,
      trim: true
    },
    danCertificateNo: {
      type: String,
      trim: true
    },
    academicQualification: {
      type: String,
      trim: true
    },
    nameOfCollege: {
      type: String,
      trim: true
    },
    nameOfBoardUniversity: {
      type: String,
      trim: true
    },
    formFileName: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Indexes
poomsaeSchema.index({ name: 1 });
poomsaeSchema.index({ division: 1 });
poomsaeSchema.index({ createdAt: -1 });
// Ensure uniqueness only for non-empty TFI ID values
poomsaeSchema.index(
  { tfiIdNo: 1 },
  { unique: true, partialFilterExpression: { tfiIdNo: { $exists: true, $gt: '' } } }
);

export const Poomsae = mongoose.model<IPoomsae>('Poomsae', poomsaeSchema);
