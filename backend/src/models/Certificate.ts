import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificate extends Document {
  serial: string;           // e.g. '000-000-123'
  name: string;
  date: Date;
  grade: string;
  generatedBy: string;      // userId or role
  generatedAt: Date;
  filePath: string;  // URL to download the certificate image
  // Add any extra fields you need (event, etc)
}

const CertificateSchema = new Schema<ICertificate>({
  serial: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  date: { type: Date, required: true },
  grade: { type: String, required: true },
  filePath: { type: String, required: true },
  generatedBy: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now }
});
export const Certificate = mongoose.model<ICertificate>('Certificate', CertificateSchema);
