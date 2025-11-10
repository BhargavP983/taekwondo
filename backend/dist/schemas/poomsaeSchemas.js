"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.poomsaeEntrySchema = void 0;
const zod_1 = require("zod");
exports.poomsaeEntrySchema = zod_1.z.object({
    body: zod_1.z.object({
        division: zod_1.z.enum(['Under 30', 'Under 40', 'Under 50', 'Under 60', 'Under 65', 'Over 65', 'Over 30']),
        category: zod_1.z.enum(['Individual', 'Pair', 'Group']),
        gender: zod_1.z.enum(['Male', 'Female']),
        name: zod_1.z.string().min(2),
        stateOrg: zod_1.z.string().min(2),
        district: zod_1.z.string().min(2),
        dateOfBirth: zod_1.z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid date format'
        }),
        age: zod_1.z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 5 && Number(val) <= 120, {
            message: 'Age must be a valid number between 5 and 120'
        }),
        weight: zod_1.z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 10 && Number(val) <= 200, {
            message: 'Weight must be a valid number between 10 and 200'
        }),
        parentGuardianName: zod_1.z.string().optional(),
        mobileNo: zod_1.z.string().regex(/^[0-9]{10}$/, 'Please provide a valid 10-digit mobile number'),
        currentBeltGrade: zod_1.z.string().optional(),
        tfiIdNo: zod_1.z.string().optional(),
        danCertificateNo: zod_1.z.string().optional(),
        academicQualification: zod_1.z.string().optional(),
        nameOfCollege: zod_1.z.string().optional(),
        nameOfBoardUniversity: zod_1.z.string().optional()
    })
});
