import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';
const BACKEND_URL = 'http://localhost:5000';

console.log('🔧 Frontend API Configuration:');
console.log('   API Base URL:', API_BASE_URL);
console.log('   Backend URL:', BACKEND_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  date: string;
  grade: string;
}

export interface CertificateResponse {
  success: boolean;
  message: string;
  data: {
    serialNumber: string;
    downloadUrl: string;
    fileName: string;
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
      const response = await api.post('/certificates', data);
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
    const response = await api.get('/certificates');
    return response.data;
  },

  delete: async (fileName: string) => {
    const response = await api.delete(`/certificates/${fileName}`);
    return response.data;
  },
};

export { API_BASE_URL, BACKEND_URL };
