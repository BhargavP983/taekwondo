import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { stateAdminAPI, exportAPI, certificateApi } from '../../services/api';
import ChangePasswordModal from './ChangePasswordModal';

// Align with backend DashboardStats shape (see dashboardController.ts)
interface BackendDashboardStats {
  totalUsers: number;
  totalCadets: number;
  totalPoomsae: number;
  activeUsers: number;
  recentCadets: number;
  recentPoomsae: number;
  usersByRole: Array<{ role: string; count: number }>;
}

interface StateStats {
  state?: string;
  overview: {
    totalApplications: number;
    totalCadets: number;
    totalPoomsae: number;
    recentCadets: number;
    recentPoomsae: number;
    activeUsers: number;
    totalUsers: number;
  };
  usersByRole: Array<{ role: string; count: number }>;
  activities: Activity[];
  cadetsByDistrict?: Array<{ _id: string; count: number }>;
  cadetsByGender?: Array<{ _id: string; count: number }>;
  poomsaeByDivision?: Array<{ _id: string; count: number }>;
  poomsaeByCategory?: Array<{ _id: string; count: number }>;
  recentRegistrations?: Array<{ entryId: string; name: string; state: string; district?: string; createdAt: string }>;
}

interface Activity {
  type: string;
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

const StateAdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<StateStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResults, setBulkResults] = useState<{
    total: number;
    successful: number;
    failed: number;
    results: Array<{ success: boolean; serial?: string; name: string; error?: string }>;
  } | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [rawStats, activitiesResponse] = await Promise.all([
        stateAdminAPI.getStats(),
        stateAdminAPI.getActivities(10)
      ]);

      // Defensive: backend returns { success, data } where data is DashboardStats (no overview field)
      if (rawStats?.success && rawStats.data) {
        const d: BackendDashboardStats = rawStats.data;
        const normalized: StateStats = {
          state: user?.state,
          overview: {
            totalApplications: (d.totalCadets || 0) + (d.totalPoomsae || 0),
            totalCadets: d.totalCadets || 0,
            totalPoomsae: d.totalPoomsae || 0,
            recentCadets: d.recentCadets || 0,
            recentPoomsae: d.recentPoomsae || 0,
            activeUsers: d.activeUsers || 0,
            totalUsers: d.totalUsers || 0
          },
          usersByRole: d.usersByRole || [],
          activities: []
        };
        setStats(normalized);
      } else {
        console.warn('Unexpected stats response shape:', rawStats);
      }

      if (activitiesResponse?.success) {
        setActivities(activitiesResponse.data || []);
        setStats(prev => prev ? { ...prev, activities: activitiesResponse.data || [] } : prev);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChangeSuccess = () => {
    setSuccessMessage('Password changed successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleExportCadets = async () => {
    try {
      setExportLoading(true);
      await exportAPI.exportCadets();
      setSuccessMessage('Cadet applications exported successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to export cadet applications');
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportPoomsae = async () => {
    try {
      setExportLoading(true);
      await exportAPI.exportPoomsae();
      setSuccessMessage('Poomsae applications exported successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to export poomsae applications');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await certificateApi.downloadTemplate();
      setSuccessMessage('Certificate template downloaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to download template');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setBulkResults(null);
    }
  };

  const handleBulkGenerate = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    try {
      setBulkLoading(true);
      setError('');
      const response = await certificateApi.bulkGenerate(selectedFile);
      
      if (response.success && response.data) {
        setBulkResults(response.data);
        setSuccessMessage(response.message);
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('bulk-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate certificates');
    } finally {
      setBulkLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'cadet':
        return '🥋';
      case 'poomsae':
        return '🏆';
      default:
        return '📄';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <p className="text-gray-600 mb-4">No dashboard data available</p>
          <button 
            onClick={fetchDashboardData} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/img/logo.jpg" alt="Logo" className="w-12 h-12 rounded-full border-2 border-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">State Admin Dashboard</h1>
              <p className="text-sm text-gray-600">{stats?.state || user?.state} - {user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowChangePassword(true)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition font-semibold flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Change Password
            </button>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Success Message */}
      {successMessage && (
        <div className="container mx-auto px-4 pt-4">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage('')} className="text-green-700 hover:text-green-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome, {user?.name}!</h2>
          <p className="text-blue-100">State Admin for {stats?.state || user?.state}</p>
          <p className="text-sm text-blue-200 mt-2">
            Managing {stats?.overview?.totalApplications ?? 0} total applications
          </p>
        </div>

        {/* Export Buttons */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Export Applications</h2>
          <div className="flex gap-4">
            <button
              onClick={handleExportCadets}
              disabled={exportLoading}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {exportLoading ? 'Exporting...' : 'Export Cadet Applications'}
            </button>
            <button
              onClick={handleExportPoomsae}
              disabled={exportLoading}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {exportLoading ? 'Exporting...' : 'Export Poomsae Applications'}
            </button>
          </div>
        </div>

        {/* Bulk Certificate Generation */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Bulk Certificate Generation</h2>
          
          {/* Template Download */}
          <div className="mb-6">
            <p className="text-gray-600 mb-3">Step 1: Download the certificate template</p>
            <button
              onClick={handleDownloadTemplate}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Certificate Template
            </button>
          </div>

          {/* File Upload and Generate */}
          <div className="border-t pt-6">
            <p className="text-gray-600 mb-3">Step 2: Upload filled template to generate certificates</p>
            <div className="flex gap-4 items-center">
              <input
                id="bulk-file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button
                onClick={handleBulkGenerate}
                disabled={!selectedFile || bulkLoading}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {bulkLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Generate Certificates
                  </>
                )}
              </button>
            </div>
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-2">Selected: {selectedFile.name}</p>
            )}
          </div>

          {/* Results Display */}
          {bulkResults && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-md font-bold text-gray-800 mb-4">Generation Results</h3>
              
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-blue-600">{bulkResults.total}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Successful</p>
                  <p className="text-2xl font-bold text-green-600">{bulkResults.successful}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{bulkResults.failed}</p>
                </div>
              </div>

              {/* Detailed Results Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial / Error</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bulkResults.results.map((result, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {result.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {result.success ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Success
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Failed
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {result.success ? (
                            <span className="font-mono text-blue-600">{result.serial}</span>
                          ) : (
                            <span className="text-red-600">{result.error}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Total Applications */}
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Applications</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {stats?.overview?.totalApplications ?? 0}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +{(stats?.overview.recentCadets || 0) + (stats?.overview.recentPoomsae || 0)} this week
                </p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Cadet Applications */}
          <Link to="/state-admin/applications/cadet" className="block">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Cadet Applications</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {stats?.overview?.totalCadets ?? 0}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    +{stats?.overview.recentCadets || 0} this week
                  </p>
                </div>
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                  🥋
                </div>
              </div>
            </div>
          </Link>

          {/* Poomsae Applications */}
          <Link to="/state-admin/applications/poomsae" className="block">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Poomsae Applications</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {stats?.overview?.totalPoomsae ?? 0}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    +{stats?.overview.recentPoomsae || 0} this week
                  </p>
                </div>
                <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                  🏆
                </div>
              </div>
            </div>
          </Link>

          {/* Certificates */}
          <Link to="/state-admin/certificates" className="block">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Certificates</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">
                    View All
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Manage certificates
                  </p>
                </div>
                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Districts */}
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Districts</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {stats?.cadetsByDistrict?.length || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Active districts</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link
                to="/state-admin/applications/cadet"
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-center group"
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition">🥋</div>
                <p className="font-semibold">Cadet Applications</p>
                <p className="text-xs text-gray-500 mt-1">View all cadet entries</p>
              </Link>

              <Link
                to="/state-admin/applications/poomsae"
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition text-center group"
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition">🏆</div>
                <p className="font-semibold">Poomsae Applications</p>
                <p className="text-xs text-gray-500 mt-1">View all poomsae entries</p>
              </Link>

              <Link
                to="/state-admin/reports"
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-center group"
              >
                <svg className="w-10 h-10 mx-auto mb-2 text-purple-600 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="font-semibold">Reports</p>
                <p className="text-xs text-gray-500 mt-1">View analytics</p>
              </Link>

              <Link
                to="/state-admin/district-admins"
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center group"
              >
                <svg className="w-10 h-10 mx-auto mb-2 text-blue-600 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="font-semibold">District Admins</p>
                <p className="text-xs text-gray-500 mt-1">Manage district admins</p>
              </Link>

              <Link
                to="/state-admin/certificates/generate"
                className="p-4 border-2 border-yellow-100 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition text-center group"
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition">🎓</div>
                <p className="font-semibold">Generate Certificates</p>
                <p className="text-xs text-gray-500 mt-1">Create and print</p>
              </Link>

              <button
                onClick={fetchDashboardData}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center group"
              >
                <svg className="w-10 h-10 mx-auto mb-2 text-blue-600 group-hover:rotate-180 transition duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <p className="font-semibold">Refresh Data</p>
                <p className="text-xs text-gray-500 mt-1">Update statistics</p>
              </button>
            </div>
          </div>

          {/* Recent Registrations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Recent Registrations</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stats?.recentRegistrations && stats.recentRegistrations.length > 0 ? (
                stats.recentRegistrations.map((reg) => (
                  <div key={reg.entryId} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{reg.name}</p>
                        <p className="text-xs text-gray-600">{reg.entryId}</p>
                        <p className="text-xs text-gray-500 mt-1">📍 {reg.state}</p>
                        <p className="text-xs text-gray-500 mt-1">📍 {reg.district}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDate(reg.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No recent registrations</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activities & District Distribution */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{activity.title}</p>
                      <p className="text-xs text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(activity.timestamp)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No recent activities</p>
              )}
            </div>
          </div>

          {/* District-wise Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Cadet Distribution by District</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stats?.cadetsByDistrict && stats.cadetsByDistrict.length > 0 ? (
                stats.cadetsByDistrict.map((district, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{district._id || 'Unknown District'}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(district.count / (stats?.overview.totalCadets || 1)) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="font-bold text-blue-600 w-8 text-right">{district.count}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No data available</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onSuccess={handlePasswordChangeSuccess}
      />
    </div>
  );
};

export default StateAdminDashboard;
