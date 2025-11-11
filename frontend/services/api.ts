import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { 
  UserData, 
  LoginRequest, 
  LoginResponse, 
  ApiResponse, 
  CadetFormData, 
  PoomsaeFormData,
  FilterParams,
  PaginatedResponse,
  Cadet,
  Poomsae
} from '../src/types/api';

const API_BASE_URL = 'http://localhost:5000/api';
const BACKEND_URL = 'http://localhost:5000';

console.log('🔧 Frontend API Configuration:');
console.log('   API Base URL:', API_BASE_URL);
console.log('   Backend URL:', BACKEND_URL);

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased from 10000 to 30000ms
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('\n📤 Making Request:');
    console.log('   Method:', config.method?.toUpperCase());
    console.log('   URL:', config.baseURL + config.url);
    console.log('   Data:', config.data);
    return config;
  },
  (error) => {
    console.error('❌ Request Setup Failed:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response Received:');
    console.log('   Status:', response.status);
    console.log('   Data:', response.data);
    return response;
  },
  (error: AxiosError) => {
    console.error('\n❌ Response Error:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);

    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else if (error.request) {
      console.error('   No response received from server');
      console.error('   This usually means:');
      console.error('   1. Backend is not running');
      console.error('   2. Backend is on wrong port');
      console.error('   3. CORS is blocking the request');
      console.error('   4. Firewall is blocking the connection');
    } else {
      console.error('   Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

export interface CertificateRequest {
  name: string;
  dateOfBirth: string;
  medal: string;
  category: string;
}

export interface CertificateResponse {
  success: boolean;
  message?: string;
  data: {
    _id?: string;
    serial: string;
    name: string;
    dateOfBirth: string;
    medal: string;
    category: string;
    generatedBy?: string;
    filePath: string; // relative path like /uploads/certificate/...
    previewUrl?: string; // absolute URL added by controller for convenience
  };
}

export const certificateApi = {
  healthCheck: async () => {
    try {
      console.log('🏥 Testing backend connection...');
      const response = await axios.get(`${BACKEND_URL}/health`, {
        timeout: 5000,
      });
      console.log('✅ Backend is healthy!');
      return response.data;
    } catch (error: any) {
      console.error('❌ Backend health check failed');
      console.error('   URL:', `${BACKEND_URL}/health`);
      console.error('   Error:', error.message);

      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to backend. Make sure it is running on http://localhost:5000');
      }
      throw error;
    }
  },

  generate: async (data: CertificateRequest): Promise<CertificateResponse> => {
    try {
      console.log('📝 Generating certificate...');
      const response = await api.post('/certificates/generate', data, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Cannot connect to server. Is the backend running on http://localhost:5000?');
      }

      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to generate certificate');
      }

      throw new Error(error.message || 'Unknown error occurred');
    }
  },

  list: async () => {
    const response = await api.get('/certificates', {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  delete: async (fileName: string) => {
    const response = await api.delete(`/certificates/${fileName}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  getAll: async () => {
    try {
      const response = await fetch('/api/certificates');
      const data = await response.json();
      return data; // { success: boolean, data: Certificate[] }
    } catch (err) {
      return { success: false, data: [], message: 'Could not fetch certificates' };
    }
  },

  downloadTemplate: async () => {
    try {
      console.log('📥 Downloading certificate template...');
      const response = await api.get('/certificates/template/download', {
        headers: getAuthHeaders(),
        responseType: 'blob'
      });

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let filename = `certificate_template_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
          filename = decodeURIComponent(filename);
        }
      }

      // Create blob and download
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ Template downloaded:', filename);
    } catch (error: any) {
      console.error('❌ Failed to download template:', error);
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Cannot connect to server. Is the backend running?');
      }
      throw new Error(error.response?.data?.message || 'Failed to download template');
    }
  },

  bulkGenerate: async (file: File): Promise<{
    success: boolean;
    message: string;
    data?: {
      total: number;
      successful: number;
      failed: number;
      results: Array<{ success: boolean; serial?: string; name: string; error?: string }>;
    };
  }> => {
    try {
      console.log('📤 Uploading file for bulk certificate generation...');
      
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await api.post('/certificates/bulk-generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      console.log('✅ Bulk generation completed:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Bulk generation failed:', error);
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Cannot connect to server. Is the backend running?');
      }
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to generate certificates');
      }
      throw new Error(error.message || 'Unknown error occurred');
    }
  }
};

export { API_BASE_URL, BACKEND_URL };

export const authAPI = {
  login: async (email: string, password: string): Promise<ApiResponse<{ token: string; user: UserData }>> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      console.error('Login API error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  getProfile: async (): Promise<ApiResponse<UserData>> => {
    try {
      const response = await api.get('/auth/profile', {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Profile API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },

  getUsers: async (): Promise<ApiResponse<UserData[]>> => {
    try {
      const response = await api.get('/auth/users', {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Get users API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  createUser: async (userData: Partial<UserData>): Promise<ApiResponse<UserData>> => {
    try {
      const response = await api.post('/auth/users', userData, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Create user API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  },

  updateUser: async (userId: string, userData: Partial<UserData>): Promise<ApiResponse<UserData>> => {
    try {
      const response = await api.put(`/auth/users/${userId}`, userData, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Update user API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  },

  deleteUser: async (userId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.delete(`/auth/users/${userId}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Delete user API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  },

  toggleUserStatus: async (userId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.patch(`/auth/users/${userId}/toggle-status`, {}, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Toggle user status API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to toggle user status');
    }
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/auth/change-password', 
        { currentPassword, newPassword },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error('Change password API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  },

  adminResetPassword: async (userId: string, newPassword: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post(`/auth/admin-reset-password/${userId}`, 
        { newPassword },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error('Admin reset password API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  }
};

export const dashboardAPI = {
  getStats: async () => {
    try {
      const response = await api.get('/dashboard/stats', {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Dashboard stats API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  },

  getActivities: async (limit = 10) => {
    try {
      const response = await api.get('/dashboard/activities', {
        params: { limit },
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Dashboard activities API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard activities');
    }
  }
};

export const usersAPI = {
  getAll: async (): Promise<ApiResponse<UserData[]>> => {
    try {
      const response = await api.get('/auth/users', { headers: getAuthHeaders() });
      return response.data;
    } catch (error: any) {
      console.error('Get users API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  create: async (userData: Omit<UserData, 'id'>): Promise<ApiResponse<UserData>> => {
    try {
      const response = await api.post('/auth/users', userData, { headers: getAuthHeaders() });
      return response.data;
    } catch (error: any) {
      console.error('Create user API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  },

  update: async (userId: string, userData: Partial<UserData>): Promise<ApiResponse<UserData>> => {
    try {
      const response = await api.put(`/auth/users/${userId}`, userData, { headers: getAuthHeaders() });
      return response.data;
    } catch (error: any) {
      console.error('Update user API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  },

  delete: async (userId: string) => {
    try {
      const response = await api.delete(`/auth/users/${userId}`, { headers: getAuthHeaders() });
      return response.data;
    } catch (error: any) {
      console.error('Delete user API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  },

  toggleStatus: async (userId: string) => {
    try {
      const response = await api.patch(`/auth/users/${userId}/toggle-status`, {}, { headers: getAuthHeaders() });
      return response.data;
    } catch (error: any) {
      console.error('Toggle user status API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to toggle user status');
    }
  }
};



export const cadetsAPI = {
  create: async (data: CadetFormData): Promise<ApiResponse<Cadet>> => {
    try {
      const response = await api.post('/cadets', data, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) return error.response.data;
      return { success: false, status: 500, message: error.message || 'Failed to create cadet' };
    }
  },
  getAll: async (page = 1, limit = 10): Promise<ApiResponse<PaginatedResponse<Cadet>>> => {
    try {
      const response = await api.get('/cadets', {
        params: { page, limit },
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching cadets:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch cadets');
    }
  },

  getStats: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get('/cadets/stats', {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching cadet stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch cadet statistics');
    }
  },

  remove: async (entryId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.delete(`/cadets/${entryId}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Error deleting cadet:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete cadet');
    }
  }
};

export const poomsaeAPI = {
  create: async (data: PoomsaeFormData): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/poomsae', data, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) return error.response.data;
      return { success: false, status: 500, message: error.message || 'Failed to create poomsae entry' } as ApiResponse;
    }
  },
  getAll: async (page = 1, limit = 10): Promise<ApiResponse<Poomsae[]>> => {
    try {
      const response = await api.get('/poomsae', {
        params: { page, limit },
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching poomsae:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch poomsae');
    }
  },

  getStats: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get('/poomsae/stats', {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching poomsae stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch poomsae statistics');
    }
  },

  remove: async (entryId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.delete(`/poomsae/${entryId}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Error deleting poomsae:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete poomsae');
    }
  }
};

export const stateAdminAPI = {
  getStats: async () => {
    try {
      const response = await api.get('/dashboard/state/stats', { headers: getAuthHeaders() });
      return response.data;
    } catch (error: any) {
      console.error('State Admin stats API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch state stats');
    }
  },

getActivities: async (limit = 10) => {
  try {
    const response = await api.get('/dashboard/state/activities', {
      params: { limit },
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error: any) {
    console.error('State Admin activities API error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch state activities');
  }
},

  getCadets: async (page = 1, limit = 10) => {
    try {
      const userState = localStorage.getItem('userState') || '';
      const res = await api.get('/cadets', {
        params: { page, limit, state: userState || undefined },
        headers: getAuthHeaders()
      });
      const json = res.data;
      // Normalize paginated shape to { success, data, totalPages }
      if (json?.data?.items) {
        return {
          success: json.success,
          data: json.data.items,
          totalPages: json.data.totalPages || json.totalPages || 1
        };
      }
      return json;
    } catch (e) {
      return { success: false, message: 'Failed to fetch state cadets' } as any;
    }
  },

  getPoomsae: async (page = 1, limit = 10) => {
    try {
      const userState = localStorage.getItem('userState');
      const response = await api.get('/poomsae', {
        params: { page, limit, state: userState || undefined },
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('State Admin poomsae API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch state poomsae');
    }
  }
};

// State Admin District APIs
export const stateAdminDistrictAPI = {
  list: async () => {
    try {
      const response = await api.get('/auth/district-admins', { headers: getAuthHeaders() });
      return response.data;
    } catch (error: any) {
      console.error('List district admins API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch district admins');
    }
  },
  create: async (data: any) => {
    try {
      const response = await api.post('/auth/district-admins', data, { headers: getAuthHeaders() });
      return response.data;
    } catch (error: any) {
      console.error('Create district admin API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create district admin');
    }
  },
  // Add update, delete as needed
};


// District Admin APIs
export const districtAdminAPI = {
  getCadets: async (page = 1, limit = 10) => {
    try {
      const userDistrict = localStorage.getItem('userDistrict');
      const response = await api.get('/cadets/district', {
        params: { page, limit, district: userDistrict || undefined },
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('District Admin getCadets API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch district cadets');
    }
  },
  getPoomsae: async (page = 1, limit = 10) => {
    try {
      const userDistrict = localStorage.getItem('userDistrict');
      const response = await api.get('/poomsae/district', {
        params: { page, limit, district: userDistrict || undefined },
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('District Admin getPoomsae API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch district poomsae');
    }
  },
  getStats: async () => {
    try {
      const response = await api.get('/cadets/district/stats', { headers: getAuthHeaders() });
      return response.data;
    } catch (error: any) {
      console.error('District Admin stats API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch district stats');
    }
  },
  getPoomsaeStats: async () => {
    try {
      const response = await api.get('/poomsae/district/stats', { headers: getAuthHeaders() });
      return response.data;
    } catch (error: any) {
      console.error('District Admin poomsae stats API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch district poomsae stats');
    }
  },
  getAllByDistrict: async (district, page = 1, limit = 10) => {
    try {
      const response = await api.get('/cadets', {
        params: { district, page, limit },
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('District Admin list by district API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch cadets by district');
    }
  },
  // ...other district admin endpoints
};

// Export API
export const exportAPI = {
  exportCadets: async () => {
    try {
      const response = await api.get('/export/cadets', {
        headers: getAuthHeaders(),
        responseType: 'blob'
      });
      
      // Extract filename from Content-Disposition header
      let filename = `Cadet_Applications_${new Date().toISOString().split('T')[0]}.xlsx`;
      const contentDisposition = response.headers['content-disposition'];
      
      console.log('Content-Disposition header:', contentDisposition);
      
      if (contentDisposition) {
        // Try to extract filename* first (RFC 6266)
        const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''(.+?)(?:;|$)/);
        if (filenameStarMatch && filenameStarMatch[1]) {
          filename = decodeURIComponent(filenameStarMatch[1]);
          console.log('Extracted filename from filename*:', filename);
        } else {
          // Fallback to regular filename
          const filenameMatch = contentDisposition.match(/filename="?([^";\n]+)"?/);
          if (filenameMatch && filenameMatch[1]) {
            filename = decodeURIComponent(filenameMatch[1]);
            console.log('Extracted filename from filename:', filename);
          }
        }
      }
      
      console.log('Final filename:', filename);
      
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return { success: true };
    } catch (error: any) {
      console.error('Export cadets API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to export cadet applications');
    }
  },
  exportPoomsae: async () => {
    try {
      const response = await api.get('/export/poomsae', {
        headers: getAuthHeaders(),
        responseType: 'blob'
      });
      
      // Extract filename from Content-Disposition header
      let filename = `Poomsae_Applications_${new Date().toISOString().split('T')[0]}.xlsx`;
      const contentDisposition = response.headers['content-disposition'];
      
      console.log('Content-Disposition header:', contentDisposition);
      
      if (contentDisposition) {
        // Try to extract filename* first (RFC 6266)
        const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''(.+?)(?:;|$)/);
        if (filenameStarMatch && filenameStarMatch[1]) {
          filename = decodeURIComponent(filenameStarMatch[1]);
          console.log('Extracted filename from filename*:', filename);
        } else {
          // Fallback to regular filename
          const filenameMatch = contentDisposition.match(/filename="?([^";\n]+)"?/);
          if (filenameMatch && filenameMatch[1]) {
            filename = decodeURIComponent(filenameMatch[1]);
            console.log('Extracted filename from filename:', filename);
          }
        }
      }
      
      console.log('Final filename:', filename);
      
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return { success: true };
    } catch (error: any) {
      console.error('Export poomsae API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to export poomsae applications');
    }
  }
};

