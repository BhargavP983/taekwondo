import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './src/contexts/AuthContext';
import { MainLayout } from './src/layouts/MainLayout';
import { DashboardLayout } from './src/layouts/DashboardLayout';
import { ProtectedRoute } from './src/components/ProtectedRoute';
import { ScrollToTopButton } from './src/components/ScrollToTopButton';

// Public Pages
import {HomePage} from './pages/HomePage';
import {AboutTaekwondo} from './pages/AboutTaekwondo';
import {ExecutiveMembers} from './pages/ExecutiveMembers';
import {GalleryPage} from './pages/GalleryPage';
import {ContactPage} from './pages/Contact';

// Auth Pages
import {Login} from './pages/LoginPage';
import {Register} from './pages/register';
import {ForgotPassword} from './pages/ForgotPassword';

// Registration Forms (Public)
import CadetEntryForm from './pages/CadetApplicationForm';
import PoomsaeEntryForm from './src/components/PoomsaeEntryForm';

// Dashboard Pages
import {SuperAdminDashboard} from './pages/dashboards/SuperAdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes with MainLayout (Header + Footer) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutTaekwondo />} />
            <Route path="/executive-members" element={<ExecutiveMembers />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            {/* Registration Forms (Public Access) */}
            <Route path="/registration/cadet" element={<CadetEntryForm />} />
            <Route path="/registration/poomsae" element={<PoomsaeEntryForm />} />
          </Route>

          {/* Auth Pages (No Header/Footer) */}
          <Route element={<MainLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Protected Admin Routes with DashboardLayout */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<SuperAdminDashboard />} />
                    <Route path="users" element={<div>User Management</div>} />
                    <Route path="settings" element={<div>Settings</div>} />
                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected State Admin Routes */}
          {/* <Route
            path="/state-admin/*"
            element={
              <ProtectedRoute allowedRoles={['state_admin', 'super_admin']}>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<StateAdminDashboard />} />
                    <Route path="applications" element={<div>Applications</div>} />
                    <Route path="*" element={<Navigate to="/state-admin/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          /> */}

          {/* Protected District Admin Routes */}
          {/* <Route
            path="/district-admin/*"
            element={
              <ProtectedRoute allowedRoles={['district_admin', 'state_admin', 'super_admin']}>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<DistrictAdminDashboard />} />
                    <Route path="reports" element={<div>Reports</div>} />
                    <Route path="*" element={<Navigate to="/district-admin/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          /> */}

          {/* Catch all - Redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
