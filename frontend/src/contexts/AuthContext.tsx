import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserData, LoginRequest, LoginResponse, ApiResponse, ApiSuccess } from '../types/api';
import { authAPI } from '../../services/api';

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  const normalizeRole = (raw: string): UserData['role'] => {
    // Map legacy snake_case roles to current camelCase
    switch (raw) {
      case 'super_admin': return 'superAdmin';
      case 'state_admin': return 'stateAdmin';
      case 'district_admin': return 'districtAdmin';
      case 'superAdmin':
      case 'stateAdmin':
      case 'districtAdmin':
      case 'user':
        return raw as UserData['role'];
      default:
        return 'user';
    }
  };

  const handleNavigation = (role: string) => {
    const norm = normalizeRole(role);
    console.log('Navigating with role:', role);
    switch (norm) {
      case 'superAdmin':
        console.log('Navigating to /admin/dashboard');
        navigate('/admin/dashboard');
        break;
      case 'stateAdmin':
        console.log('Navigating to /state-admin/dashboard');
        navigate('/state-admin/dashboard');
        break;
      case 'districtAdmin':
        console.log('Navigating to /district-admin/dashboard');
        navigate('/district-admin/dashboard');
        break;
      default:
        console.log('Navigating to home');
        navigate('/');
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (storedToken) {
        try {
          await fetchProfile(storedToken);
        } catch (error) {
          console.error('Error during auth initialization:', error);
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const fetchProfile = async (authToken: string): Promise<void> => {
    try {
      // Temporarily set the token for the API call
      const originalToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!originalToken) {
        localStorage.setItem('token', authToken);
      }

      const result = await authAPI.getProfile();

      if (result.success && result.data) {
        // Normalize role if legacy format
        const normalized = { ...result.data, role: normalizeRole(result.data.role) } as typeof result.data;
        setUser(normalized);
        setToken(authToken);
        // Persist state/district for APIs that filter by user context
        if (normalized.state) {
          try {
            localStorage.setItem('userState', normalized.state);
            sessionStorage.setItem('userState', normalized.state);
          } catch {}
        }
        if (normalized.district) {
          try {
            localStorage.setItem('userDistrict', normalized.district);
            sessionStorage.setItem('userDistrict', normalized.district);
          } catch {}
        }
        console.log('Profile fetched successfully:', result.data);
      } else {
        console.error('Profile fetch failed:', result);
        throw new Error(result.message || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      setUser(null);
      setToken(null);
      throw error;
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('Attempting login for:', email);
      const result = await authAPI.login(email, password);

      if (result.success && result.data) {
        const { token, user: rawUser } = result.data;
        const user = { ...rawUser, role: normalizeRole(rawUser.role) } as typeof rawUser;
        console.log('Login successful for user:', user.email, 'with role:', user.role);

        // Store token based on rememberMe preference
        if (rememberMe) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          if (user.state) localStorage.setItem('userState', user.state);
          if (user.district) localStorage.setItem('userDistrict', user.district);
        } else {
          sessionStorage.setItem('token', token);
          sessionStorage.setItem('user', JSON.stringify(user));
          if (user.state) {
            sessionStorage.setItem('userState', user.state);
            // also mirror to localStorage for API helpers expecting localStorage
            localStorage.setItem('userState', user.state);
          }
          if (user.district) {
            sessionStorage.setItem('userDistrict', user.district);
            localStorage.setItem('userDistrict', user.district);
          }
        }

        setToken(token);
        setUser(user as any);
        handleNavigation(user.role);
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Omit<UserData, 'id' | 'isActive'>): Promise<void> => {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json() as ApiResponse<LoginResponse>;

    if (!response.ok || !('data' in result)) {
      throw new Error(result.message || 'Registration failed');
    }

    const { user, token: authToken } = result.data;
    setUser(user);
    setToken(authToken);
    localStorage.setItem('token', authToken);

    handleNavigation(user.role);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
