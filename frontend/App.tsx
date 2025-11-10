import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './src/contexts/AuthContext';
import { MainLayout } from './src/layouts/MainLayout';
import { DashboardLayout } from './src/layouts/DashboardLayout';
import { ProtectedRoute } from './src/components/ProtectedRoute';
import { ScrollToTopButton } from './src/components/ScrollToTopButton';

// Public Pages
import { HomePage } from './pages/HomePage';

// Auth Pages
import { Login } from './pages/LoginPage';

// Registration Forms (Public)
import CadetEntryForm from './pages/CadetApplicationForm';
import PoomsaeEntryForm from './src/components/PoomsaeEntryForm';

// Dashboard Pages
import SuperAdminDashboard from './pages/dashboards/SuperAdminDashboard';

// Dashboard Page Components
import UserManagement from './pages/dashboards/userManagement';
import CadetApplications from './pages/dashboards/CadetApplications';
import PoomsaeApplications from './pages/dashboards/PoomsaeApplications';
import GenerateCertificate from './pages/GenerateCertificate';

// State Admin Dashboard Pages
import StateAdminDashboard from './pages/dashboards/StateAdminDashboard';
import StateAdminCadetApplications from './pages/dashboards/StateAdminCadetApplications';
import StateAdminPoomsaeApplications from './pages/dashboards/StateAdminPoomsaeApplications';

// District Admin Dashboard Pages
import DistrictAdminDashboard from './pages/dashboards/DistrictAdminDashboard';
import DistrictAdminManagement from './pages/dashboards/DistrictAdminManagement';

import TestPage from './pages/dashboards/TestPage';
import CertificateGenerator from './pages/GenerateCertificate';
import CertificateList from './src/components/Certificatelist';
import DistrictCertificatesPage from './src/components/DistrictCertificatesPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/registration/cadet" element={<CadetEntryForm />} />
            <Route path="/registration/poomsae" element={<PoomsaeEntryForm />} />
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Protected Admin Routes with DashboardLayout */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['superAdmin']}>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<SuperAdminDashboard />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="applications/cadet" element={<CadetApplications />} />
                    <Route path="applications/poomsae" element={<PoomsaeApplications />} />
                    <Route path="certificates/generate" element={<GenerateCertificate />} />
                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route path="/test" element={<TestPage />} />


          {/* State Admin Routes */}
          <Route
            path="/state-admin/*"
            element={
              <ProtectedRoute allowedRoles={['stateAdmin', 'superAdmin']}>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<StateAdminDashboard />} />
                    <Route path="applications/cadet" element={<StateAdminCadetApplications />} />
                    <Route path="applications/poomsae" element={<StateAdminPoomsaeApplications />} />
                    <Route path="district-admins" element={<DistrictAdminManagement />} />
                    <Route
                      path="certificates/generate"
                      element={<CertificateGenerator />}
                    />
                    <Route path="reports" element={<div className="p-8 text-center">Reports Coming Soon</div>} />
                    <Route path="*" element={<Navigate to="/state-admin/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected District Admin Routes */}
          <Route
            path="/district-admin/*"
            element={
              <ProtectedRoute allowedRoles={['districtAdmin', 'stateAdmin', 'superAdmin']}>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<DistrictAdminDashboard />} />
                    <Route path="/district-admin/certificates" element={<DistrictCertificatesPage />} />
                    <Route path="applications/cadet" element={<CadetApplications />} />
                    <Route path="applications/poomsae" element={<PoomsaeApplications />} />
                    <Route path="manage" element={<DistrictAdminManagement />} />
                    <Route path="reports" element={<div>Reports</div>} />
                    <Route path="*" element={<Navigate to="/district-admin/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch all - Redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
