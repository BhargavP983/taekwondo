import { z } from 'zod';

export const poomsaeEntrySchema = z.object({
  body: z.object({
    division: z.enum(['Under 30', 'Under 40', 'Under 50', 'Under 60', 'Under 65', 'Over 65', 'Over 30']),
    category: z.enum(['Individual', 'Pair', 'Group']),
    gender: z.enum(['Male', 'Female']),
    name: z.string().min(2),
    stateOrg: z.string().min(2),
    district: z.string().min(2),
    dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid date format'
    }),
    age: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 5 && Number(val) <= 120, {
      message: 'Age must be a valid number between 5 and 120'
    }),
    weight: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 10 && Number(val) <= 200, {
      message: 'Weight must be a valid number between 10 and 200'
    }),
    parentGuardianName: z.string().optional(),
    mobileNo: z.string().regex(/^[0-9]{10}$/, 'Please provide a valid 10-digit mobile number'),
    currentBeltGrade: z.string().optional(),
    tfiIdNo: z.string().optional(),
    danCertificateNo: z.string().optional(),
    academicQualification: z.string().optional(),
    nameOfCollege: z.string().optional(),
    nameOfBoardUniversity: z.string().optional()
  })
});