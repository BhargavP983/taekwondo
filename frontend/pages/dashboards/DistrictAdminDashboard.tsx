import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { certificateApi, districtAdminAPI } from '../../services/api';
import CertificateList from '../../src/components/Certificatelist';

interface DistrictStats {
    district: string;
    overview: {
        totalCadets: number;
        totalPoomsae: number;
        totalApplications: number;
        recentCadets: number;
        recentPoomsae: number;
    };
    cadetsByGender: Array<{ _id: string; count: number }>;
    poomsaeByDivision: Array<{ _id: string; count: number }>;
    poomsaeByCategory: Array<{ _id: string; count: number }>;
    recentRegistrations: Array<{
        entryId: string;
        name: string;
        district: string;
        createdAt: string;
    }>;
}

interface Activity {
    type: string;
    id: string;
    title: string;
    description: string;
    timestamp: string;
}

const DistrictAdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState<DistrictStats | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const statsResponse = await districtAdminAPI.getStats();

            if (statsResponse.success) {
                setStats(statsResponse.data);
            }

            // districtAdminAPI does not expose a getActivities method; clear activities
            // or replace this with a valid API call (e.g. certificateApi.getActivities) if available.
            setActivities([]);
        } catch (err: any) {
            setError(err.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
                        <img src="/img/logo.jpg" alt="Logo" className="w-12 h-12 rounded-full border-2 border-green-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">District Admin Dashboard</h1>
                            <p className="text-sm text-gray-600">{stats?.district || user?.district} - {user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg shadow-lg p-6 mb-8 text-white">
                    <h2 className="text-2xl font-bold mb-2">Welcome, {user?.name}!</h2>
                    <p className="text-green-100">District Admin for {stats?.district || user?.district}</p>
                    <p className="text-sm text-green-200 mt-2">
                        Managing {stats?.overview.totalApplications || 0} total applications
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Applications */}
                    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Applications</p>
                                <p className="text-3xl font-bold text-purple-600 mt-2">
                                    {stats?.overview.totalApplications || 0}
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
                    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Cadet Applications</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">
                                    {stats?.overview.totalCadets || 0}
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

                    {/* Poomsae Applications */}
                    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Poomsae Applications</p>
                                <p className="text-3xl font-bold text-orange-600 mt-2">
                                    {stats?.overview.totalPoomsae || 0}
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

                    {/* Gender Distribution */}
                    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Active Genders</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">
                                    {stats?.cadetsByGender?.length || 0}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Gender categories</p>
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
                                to="/district-admin/applications/cadet"
                                className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-center group"
                            >
                                <div className="text-4xl mb-2 group-hover:scale-110 transition">🥋</div>
                                <p className="font-semibold">Cadet Applications</p>
                                <p className="text-xs text-gray-500 mt-1">View all cadet entries</p>
                            </Link>
                            <Link
                                to="/district-admin/applications/poomsae"
                                className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition text-center group"
                            >
                                <div className="text-4xl mb-2 group-hover:scale-110 transition">🏆</div>
                                <p className="font-semibold">Poomsae Applications</p>
                                <p className="text-xs text-gray-500 mt-1">View all poomsae entries</p>
                            </Link>
                            <Link
                                to="/district-admin/certificates"
                                className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition text-center group"
                            >
                                <div className="text-4xl mb-2 group-hover:scale-110 transition">🎓</div>
                                <p className="font-semibold">View Certificates</p>
                                <p className="text-xs text-gray-500 mt-1">See all generated certificates</p>
                            </Link>

                            <Link
                                to="/district-admin/reports"
                                className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-center group"
                            >
                                <div className="text-4xl mb-2 group-hover:scale-110 transition">📊</div>
                                <p className="font-semibold">Reports</p>
                                <p className="text-xs text-gray-500 mt-1">See analytics</p>
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
                                                <p className="text-xs text-gray-500 mt-1">📍 {reg.district}</p>
                                            </div>
                                            <span className="text-xs text-gray-400">{formatDate(reg.createdAt)}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-8">No recent registrations</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Activities & Gender Distribution */}
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
                    {/* Gender-wise Distribution */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Cadet Distribution by Gender</h2>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {stats?.cadetsByGender && stats.cadetsByGender.length > 0 ? (
                                stats.cadetsByGender.map((gender, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="font-medium">{gender._id || 'Unknown Gender'}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-32 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{
                                                        width: `${(gender.count / (stats?.overview.totalCadets || 1)) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="font-bold text-blue-600 w-8 text-right">{gender.count}</span>
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
        </div>
    );
};

export default DistrictAdminDashboard;
