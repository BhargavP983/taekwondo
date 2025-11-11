export interface UserData {
  id?: string;
  email: string;
  name: string;
  role: 'superAdmin' | 'stateAdmin' | 'districtAdmin' | 'user';
  state?: string;
  district?: string;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserData;
}

export interface Cadet {
  _id: string;
  entryId: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  age: number;
  weight?: number;
  weightCategory?: string;
  parentGuardianName?: string;
  state: string;
  district: string;
  presentBeltGrade: string;
  tfiIdCardNo?: string;
  academicQualification?: string;
  schoolName?: string;
  applicationStatus?: 'pending' | 'approved' | 'rejected';
  formFileName?: string;
  // Newly added dynamic fields from creation response
  formDownloadUrl?: string; // absolute URL to the generated form
  downloadUrl?: string;     // legacy fallback absolute URL
  formPath?: string;        // relative path on the server
  applicationNumber?: string; // alias for entryId in creation response
  createdAt: string;
}

export interface Poomsae {
  _id: string;
  entryId: string;
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
  formDownloadUrl?: string;
  createdAt: string;
}

export interface CadetFormData {
  name: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  weight?: number;
  weightCategory?: string;
  parentGuardianName?: string;
  state: string;
  district: string;
  presentBeltGrade: string;
  tfiIdCardNo?: string;
  academicQualification?: string;
  schoolName?: string;
}

export interface PoomsaeFormData {
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
}

export interface ApiError {
  status: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T; // present on success responses; omitted on error per backend errorHandler
  totalPages?: number;
  currentPage?: number;
  totalItems?: number;
  status?: number; // optional HTTP status code for error responses
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FilterParams {
  state?: string;
  district?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}