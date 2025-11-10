import { Document, Model } from 'mongoose';

export interface ICadet {
  entryId: string;
  name: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  age: number;
  weight?: number;
  weightCategory?: string;
  parentGuardianName?: string;
  state: string;
  district: string;
  presentBeltGrade: string;
  tfiIdCardNo?: string;
  academicQualification?: string;
  schoolName?: string;
  formFileName: string;
  applicationStatus: 'pending' | 'approved' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICadetDocument extends ICadet, Document {
  _id: string;
}

export interface IFormGeneratorResult {
  success: boolean;
  message?: string;
  filePath: string;
  fileName: string;
  entryId: string;
}