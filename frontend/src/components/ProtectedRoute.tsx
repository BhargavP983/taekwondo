import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Add debug logs
  console.log('ProtectedRoute State:', {
    isAuthenticated,
    userRole: user?.role,
    isLoading,
    allowedRoles
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('Access denied - User role:', user.role);
    console.log('Allowed roles:', allowedRoles);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">403</h1>
          <p className="text-gray-600 mb-4">Access Denied</p>
          <p className="text-sm text-gray-500">
            You don't have permission to access this page.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Current role: {user.role}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
