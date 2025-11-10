import { z } from 'zod';

export const cadetEntrySchema = z.object({
  body: z.object({
    gender: z.enum(['male', 'female', 'other']),
    weightCategory: z.string().optional(),
    name: z.string().min(2),
    dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid date format'
    }),
    age: z.number().min(0).max(120),
    weight: z.number().optional(),
    parentGuardianName: z.string().optional(),
    state: z.string(),
    presentBeltGrade: z.string(),
    tfiIdCardNo: z.string().optional(),
    academicQualification: z.string().optional(),
    schoolName: z.string().optional(),
    district: z.string()
  })
});