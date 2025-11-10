import { UserRole } from './user';

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  state?: string;
  district?: string;
  iat?: number;
  exp?: number;
}

export interface TokenData {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  state?: string;
  district?: string;
}

export interface TokenPayload {
  token: string;
  user: TokenData;
}

export type AuthenticatedRequest<T = any> = T & {
  user: JWTPayload;
};