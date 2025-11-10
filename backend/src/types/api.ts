export interface UserData {
  id?: string;
  email: string;
  password?: string;
  name: string;
  role: 'superAdmin' | 'stateAdmin' | 'districtAdmin' | 'user';
  state?: string;
  district?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CadetData {
  id?: string;
  entryId?: string;
  name: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  weight?: number;
  weightCategory?: string;
  parentGuardianName?: string;
  email?: string;
  phone?: string;
  address?: string;
  state: string;
  district: string;
  presentBeltGrade: string;
  tfiIdCardNo?: string;
  academicQualification?: string;
  schoolName?: string;
  applicationStatus?: 'pending' | 'approved' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
  formPath?: string;
  downloadUrl?: string;
  formFileName?: string;
  applicationNumber?: string;
  formDownloadUrl?: string;
}

export interface PoomsaeData {
  id?: string;
  entryId?: string;
  division: string;
  category: string;
  gender: 'Male' | 'Female';
  name: string;
  stateOrg: string;
  district: string;
  dateOfBirth: string;
  age: number;
  weight: number;
  parentGuardianName?: string;
  mobileNo: string;
  currentBeltGrade?: string;
  tfiIdNo?: string;
  danCertificateNo?: string;
  academicQualification?: string;
  nameOfCollege?: string;
  nameOfBoardUniversity?: string;
  formFileName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FilterQuery {
  state?: string;
  district?: string;
  status?: string;
  role?: string;
  applicationStatus?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface DashboardStats {
  totalUsers: number;
  totalCadets: number;
  totalPoomsae: number;
  activeUsers: number;
  recentCadets: number;
  recentPoomsae: number;
  usersByRole: {
    role: string;
    count: number;
  }[];
  stateStats?: {
    totalCadets: number;
    totalPoomsae: number;
    districtBreakdown: {
      district: string;
      cadets: number;
      poomsae: number;
    }[];
  };
  districtStats?: {
    totalCadets: number;
    totalPoomsae: number;
    monthlyStats: {
      month: string;
      cadets: number;
      poomsae: number;
    }[];
  };
}

export interface RecentActivity {
  type: 'cadet' | 'poomsae' | 'user';
  action: 'created' | 'updated' | 'deleted' | 'status_changed';
  details: {
    id: string;
    name?: string;
    status?: string;
    [key: string]: any;
  };
  timestamp: Date;
}

export interface ApiErrorResponse {
  success: false;
  status: number;
  message: string;
  details?: Record<string, string[]>;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message?: string;
  data?: T;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type PaginatedResponse<T> = ApiSuccessResponse<PaginatedData<T>>;