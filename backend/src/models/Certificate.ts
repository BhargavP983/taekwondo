import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificate extends Document {
  serial: string;           // e.g. '000-000-123'
  name: string;
  dateOfBirth: Date;
  medal: string;
  category: string;
  generatedBy: string;      // userId or role
  generatedAt: Date;
  filePath: string;  // URL to download the certificate image
}

const CertificateSchema = new Schema<ICertificate>({
  serial: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  medal: { type: String, required: true },
  category: { type: String, required: true },
  filePath: { type: String, required: true },
  generatedBy: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now }
});
export const Certificate = mongoose.model<ICertificate>('Certificate', CertificateSchema);
