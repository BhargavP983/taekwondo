"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.createUserSchema = exports.userLoginBody = exports.userCreateBody = void 0;
const zod_1 = require("zod");
// Type-safe schema for user creation
const userRoleEnum = ['superAdmin', 'stateAdmin', 'districtAdmin', 'user'];
exports.userCreateBody = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8)
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    name: zod_1.z.string().min(2),
    role: zod_1.z.enum(userRoleEnum),
    state: zod_1.z.string().optional(),
    district: zod_1.z.string().optional(),
});
exports.userLoginBody = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
exports.createUserSchema = {
    body: exports.userCreateBody,
};
exports.loginSchema = {
    body: exports.userLoginBody,
};
