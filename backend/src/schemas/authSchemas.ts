import { z } from 'zod';

// Type-safe schema for user creation
const userRoleEnum = ['superAdmin', 'stateAdmin', 'districtAdmin', 'user'] as const;
export type UserRole = typeof userRoleEnum[number];

export const userCreateBody = z.object({
  email: z.string().email(),
  password: z.string().min(8)
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  name: z.string().min(2),
  role: z.enum(userRoleEnum),
  state: z.string().optional(),
  district: z.string().optional(),
});

export const userLoginBody = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const createUserSchema = {
  body: userCreateBody,
};

export const loginSchema = {
  body: userLoginBody,
};