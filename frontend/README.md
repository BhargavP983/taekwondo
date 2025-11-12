# Frontend - Taekwondo Association Management System

React + TypeScript + Vite frontend for the Taekwondo Association Management System.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Backend API running on `http://localhost:5000`

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env` file:
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_BACKEND_URL=http://localhost:5000
```

### Development
```bash
npm run dev        # Start Vite dev server (http://localhost:5173)
npm run build      # Build for production
npm run preview    # Preview production build
```

## 📁 Project Structure

```
frontend/
├── App.tsx                    # Main app component with routing
├── index.tsx                  # React DOM entry point
├── index.css                  # Global styles
├── index.html                 # HTML template
├── vite.config.ts            # Vite configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── img/                      # Static images
├── pages/                    # Page components
│   ├── HomePage.tsx          # Landing page
│   ├── AboutTaekwondo.tsx    # About page
│   ├── ExecutiveMembers.tsx  # Executive team
│   ├── GalleryPage.tsx       # Image gallery
│   ├── Contact.tsx           # Contact information
│   ├── LoginPage.tsx         # Authentication
│   ├── CadetApplicationForm.tsx      # Public cadet registration
│   ├── GenerateCertificate.tsx      # Certificate generation
│   └── dashboards/           # Role-based dashboard pages
│       ├── SuperAdminDashboard.tsx     # Super admin overview
│       ├── StateAdminDashboard.tsx     # State admin overview
│       ├── DistrictAdminDashboard.tsx  # District admin overview
│       ├── userManagement.tsx          # User management (super admin)
│       ├── CadetApplications.tsx       # Cadet management
│       ├── PoomsaeApplications.tsx     # Poomsae management
│       ├── CertificatesList.tsx        # Certificate management
│       ├── StateAdminCadetApplications.tsx      # State-level cadet view
│       ├── StateAdminPoomsaeApplications.tsx    # State-level poomsae view
│       ├── DistrictAdminCadetApplications.tsx   # District-level cadet view
│       ├── DistrictAdminPoomsaeApplications.tsx # District-level poomsae view
│       └── DistrictAdminManagement.tsx          # District admin management
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Cert.tsx         # Certificate display component
│   │   ├── ProtectedRoute.tsx        # Route protection wrapper
│   │   ├── ScrollToTopButton.tsx     # UI enhancement
│   │   ├── PoomsaeEntryForm.tsx      # Poomsae registration form
│   │   ├── Certificatelist.tsx       # Certificate list component
│   │   └── DistrictCertificatesPage.tsx # District certificate view
│   ├── contexts/
│   │   └── AuthContext.tsx  # Authentication state management
│   ├── layouts/
│   │   ├── MainLayout.tsx   # Public pages layout
│   │   └── DashboardLayout.tsx # Admin dashboard layout
│   ├── constants/           # Application constants
│   └── types/
│       └── api.ts          # TypeScript API interfaces
└── services/
    └── api.ts              # HTTP client and API functions
```

## 🔐 Authentication Architecture

### AuthContext Implementation
```typescript
interface AuthContextType {
  user: UserData | null;           # Current user data
  token: string | null;            # JWT token
  login: (email, password, rememberMe) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;        # Computed state
  isLoading: boolean;             # Loading state
}
```

### Token Storage Strategy
- **Remember Me = true**: `localStorage` (persistent)
- **Remember Me = false**: `sessionStorage` (session only)
- **API calls**: Automatic Authorization header injection
- **Role normalization**: Legacy snake_case to camelCase conversion

### Route Protection
```typescript
// Role-based route protection
<ProtectedRoute allowedRoles={['superAdmin']}>
  <SuperAdminDashboard />
</ProtectedRoute>

// Multiple roles allowed
<ProtectedRoute allowedRoles={['stateAdmin', 'superAdmin']}>
  <StateAdminDashboard />
</ProtectedRoute>
```

## 🌐 API Integration

### HTTP Client Configuration
```typescript
// Base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Automatic token injection
const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : ''
  };
};
```

### API Service Functions
```typescript
// Authentication API
export const authAPI = {
  login: (email: string, password: string) => Promise<LoginResponse>,
  getProfile: () => Promise<UserResponse>,
  getAllUsers: () => Promise<UsersResponse>,
  createUser: (userData) => Promise<UserResponse>,
  // ... more auth functions
};

// Certificate API
export const certificateApi = {
  generate: (data: CertificateRequest) => Promise<CertificateResponse>,
  list: () => Promise<CertificateListResponse>,
  delete: (fileName: string) => Promise<SuccessResponse>,
  healthCheck: () => Promise<HealthResponse>
};

// Cadet API
export const cadetAPI = {
  create: (formData: CadetFormData) => Promise<CadetResponse>,
  getAll: (params?: FilterParams) => Promise<PaginatedCadetResponse>,
  getByEntryId: (entryId: string) => Promise<CadetResponse>,
  delete: (entryId: string) => Promise<SuccessResponse>,
  getStats: () => Promise<StatsResponse>
};
```

## 🎨 Component Architecture

### Layout Components
- **MainLayout**: Public pages with navigation header
- **DashboardLayout**: Admin interface with sidebar navigation
- **ProtectedRoute**: Authentication and authorization wrapper

### Page Components
- **Public Pages**: Landing, about, gallery, contact, registration forms
- **Dashboard Pages**: Role-specific admin interfaces
- **Form Pages**: Cadet and Poomsae registration with validation

### Reusable Components
- **Certificate Display**: Preview and download certificates
- **Data Tables**: Paginated lists with filtering and sorting
- **Form Components**: Validated input forms with error handling
- **UI Enhancements**: Scroll to top, loading states, error displays

## 🛣️ Routing Architecture

### Public Routes (MainLayout)
```typescript
<Route element={<MainLayout />}>
  <Route path="/" element={<HomePage />} />
  <Route path="/about" element={<AboutTaekwondo />} />
  <Route path="/executive-members" element={<ExecutiveMembers />} />
  <Route path="/gallery" element={<GalleryPage />} />
  <Route path="/contact" element={<ContactPage />} />
  <Route path="/registration/cadet" element={<CadetEntryForm />} />
  <Route path="/registration/poomsae" element={<PoomsaeEntryForm />} />
  <Route path="/login" element={<Login />} />
</Route>
```

### Protected Admin Routes
```typescript
// Super Admin Routes (/admin/*)
<ProtectedRoute allowedRoles={['superAdmin']}>
  <Route path="dashboard" element={<SuperAdminDashboard />} />
  <Route path="users" element={<UserManagement />} />
  <Route path="applications/cadet" element={<CadetApplications />} />
  <Route path="certificates" element={<CertificatesList />} />
</ProtectedRoute>

// State Admin Routes (/state-admin/*)
<ProtectedRoute allowedRoles={['stateAdmin', 'superAdmin']}>
  <Route path="dashboard" element={<StateAdminDashboard />} />
  <Route path="applications/cadet" element={<StateAdminCadetApplications />} />
  <Route path="district-admins" element={<DistrictAdminManagement />} />
</ProtectedRoute>

// District Admin Routes (/district-admin/*)
<ProtectedRoute allowedRoles={['districtAdmin', 'stateAdmin', 'superAdmin']}>
  <Route path="dashboard" element={<DistrictAdminDashboard />} />
  <Route path="cadets" element={<DistrictAdminCadetApplications />} />
  <Route path="certificates" element={<DistrictCertificatesPage />} />
</ProtectedRoute>
```

### Navigation Logic
```typescript
// Automatic role-based redirection after login
const handleNavigation = (role: string) => {
  switch (normalizeRole(role)) {
    case 'superAdmin':
      navigate('/admin/dashboard');
      break;
    case 'stateAdmin':
      navigate('/state-admin/dashboard');
      break;
    case 'districtAdmin':
      navigate('/district-admin/dashboard');
      break;
    default:
      navigate('/');
  }
};
```

## 📊 Type Definitions

### User Types
```typescript
interface UserData {
  id: string;
  email: string;
  name: string;
  role: 'superAdmin' | 'stateAdmin' | 'districtAdmin' | 'user';
  state?: string;
  district?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}
```

### API Response Types
```typescript
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface PaginatedResponse<T> extends ApiResponse<{
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {}

interface LoginResponse {
  user: UserData;
  token: string;
}
```

### Form Data Types
```typescript
interface CadetFormData {
  gender: 'male' | 'female' | 'other';
  name: string;
  dateOfBirth: string;
  age: string;
  weight?: string;
  weightCategory?: string;
  parentGuardianName: string;
  state: string;
  district: string;
  presentBeltGrade: string;
  tfiIdCardNo?: string;
  academicQualification?: string;
  schoolName?: string;
}
```

## 🎯 State Management

### Authentication State
- **AuthContext**: Centralized authentication state
- **Token persistence**: localStorage/sessionStorage based on user preference
- **Role normalization**: Automatic conversion of legacy role formats
- **User metadata**: State/district info cached for API filtering

### Local Component State
- **useState**: For component-specific state
- **useEffect**: For API calls and side effects
- **Custom hooks**: For reusable stateful logic

### API State Management
- **Loading states**: Managed per API call
- **Error handling**: Consistent error display patterns
- **Data caching**: Minimal caching for better UX

## 🔧 Development Features

### Development Tools
- **Vite HMR**: Fast hot module replacement
- **TypeScript**: Full type safety
- **Console logging**: Detailed API request/response logging
- **Error boundaries**: Graceful error handling

### Development Logging
```typescript
if (IS_DEVELOPMENT) {
  console.log('📤 Making Request:', {
    method: config.method?.toUpperCase(),
    url: config.baseURL + config.url,
    data: config.data
  });
}
```

### Environment Configuration
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const IS_DEVELOPMENT = import.meta.env.DEV;
```

## 🚀 Production Build

### Build Process
```bash
npm run build
# Outputs to dist/ directory
# Ready for static hosting
```

### Build Optimization
- **Code splitting**: Automatic route-based splitting
- **Tree shaking**: Unused code elimination
- **Asset optimization**: Image and CSS optimization
- **Bundle analysis**: Size optimization

### Deployment Considerations
- **Static hosting**: Can be deployed to any static host
- **Environment variables**: Configure API URLs for production
- **HTTPS**: Required for production authentication
- **CDN**: Recommended for better performance

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   ```bash
   # Check backend is running
   curl http://localhost:5000/health
   
   # Verify environment variables
   echo $VITE_API_BASE_URL
   ```

2. **Authentication Not Working**
   - Check browser dev tools → Application → Local Storage
   - Verify token format and expiration
   - Check network tab for 401/403 responses

3. **CORS Errors**
   - Verify backend CORS_ORIGIN includes frontend URL
   - Check that withCredentials is properly configured

4. **Route Protection Issues**
   - Verify user role matches allowedRoles
   - Check AuthContext state in React Dev Tools
   - Confirm token contains correct role information

### Development Tips
- **React DevTools**: Install browser extension for component inspection
- **Network Tab**: Monitor API calls and responses
- **Console Logs**: Enable development logging for debugging
- **Token Inspection**: Use jwt.io to decode and inspect JWT tokens

### Performance Tips
- **Lazy Loading**: Components are loaded on demand
- **Image Optimization**: Compress images before deployment
- **Bundle Analysis**: Use `npm run build -- --analyze` to inspect bundle size
- **API Optimization**: Implement proper pagination and filtering