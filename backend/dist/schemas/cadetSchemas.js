"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cadetEntrySchema = void 0;
const zod_1 = require("zod");
exports.cadetEntrySchema = zod_1.z.object({
    body: zod_1.z.object({
        gender: zod_1.z.enum(['male', 'female', 'other']),
        weightCategory: zod_1.z.string().optional(),
        name: zod_1.z.string().min(2),
        dateOfBirth: zod_1.z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid date format'
        }),
        age: zod_1.z.number().min(0).max(120),
        weight: zod_1.z.number().optional(),
        parentGuardianName: zod_1.z.string().optional(),
        state: zod_1.z.string(),
        presentBeltGrade: zod_1.z.string(),
        tfiIdCardNo: zod_1.z.string().optional(),
        academicQualification: zod_1.z.string().optional(),
        schoolName: zod_1.z.string().optional(),
        district: zod_1.z.string()
    })
});
