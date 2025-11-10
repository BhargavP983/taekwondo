export type UserRole = 'superAdmin' | 'stateAdmin' | 'districtAdmin' | 'user';

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  state?: string;
  district?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  state?: string;
  district?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  state?: string;
  district?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}