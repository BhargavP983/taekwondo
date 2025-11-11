import React, { useState, useEffect } from 'react';
import { districtAdminAPI, BACKEND_URL } from '../../services/api';
import { useAuth } from '../../src/contexts/AuthContext';
import Toast from '../../src/components/Toast';
import type { Poomsae as TPoomsae } from '../../src/types/api';

const DistrictAdminPoomsaeApplications: React.FC = () => {
  const { user } = useAuth();
  const [poomsae, setPoomsae] = useState<TPoomsae[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDivision, setFilterDivision] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPoomsae, setSelectedPoomsae] = useState<TPoomsae | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    fetchPoomsae();
  }, [currentPage]);

  const fetchPoomsae = async () => {
    try {
      setLoading(true);
      const response = await districtAdminAPI.getPoomsae(currentPage, 20);
      
      if (response.success) {
        const items = (response.data?.items || []).map((p: any) => ({
          _id: p._id,
          entryId: p.entryId,
          name: p.name,
          division: p.division,
          category: p.category,
          gender: p.gender,
          age: p.age,
          weight: p.weight,
          stateOrg: p.stateOrg,
          district: p.district,
          dateOfBirth: p.dateOfBirth,
          parentGuardianName: p.parentGuardianName,
          mobileNo: p.mobileNo,
          currentBeltGrade: p.currentBeltGrade,
          tfiIdNo: p.tfiIdNo,
          danCertificateNo: p.danCertificateNo,
          academicQualification: p.academicQualification,
          nameOfCollege: p.nameOfCollege,
          nameOfBoardUniversity: p.nameOfBoardUniversity,
          formFileName: p.formFileName,
          formDownloadUrl: p.formDownloadUrl,
          createdAt: p.createdAt
        }));
        setPoomsae(items);
        setTotalPages(response.data?.totalPages || 1);
        setToast({ type: 'success', message: 'Poomsae applications loaded' });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch poomsae applications');
      setToast({ type: 'error', message: err.message || 'Failed to fetch poomsae applications' });
    } finally {
      setLoading(false);
    }
  };

  const filteredPoomsae = poomsae.filter((entry) => {
    const matchesSearch = entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.entryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (entry.tfiIdNo || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDivision = filterDivision === 'all' || entry.division === filterDivision;
    const matchesCategory = filterCategory === 'all' || entry.category === filterCategory;
    return matchesSearch && matchesDivision && matchesCategory;
  });

  const divisions = ['Under 30', 'Under 40', 'Under 50', 'Under 60', 'Under 65', 'Over 65', 'Over 30'];
  const categories = ['Individual', 'Pair', 'Group'];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Poomsae Applications</h1>
          <p className="text-gray-600 mt-1">
            {user?.district} District - Manage poomsae registration entries
          </p>
        </div>
        <button
          onClick={fetchPoomsae}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Total Entries</p>
          <p className="text-2xl font-bold text-purple-600">{poomsae.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Individual</p>
          <p className="text-2xl font-bold text-blue-600">
            {poomsae.filter(p => p.category === 'Individual').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Pair</p>
          <p className="text-2xl font-bold text-green-600">
            {poomsae.filter(p => p.category === 'Pair').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Group</p>
          <p className="text-2xl font-bold text-orange-600">
            {poomsae.filter(p => p.category === 'Group').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name, entry ID, or TFI ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Division</label>
            <select
              value={filterDivision}
              onChange={(e) => setFilterDivision(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All Divisions</option>
              {divisions.map(div => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Division</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Belt/Dan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPoomsae.length > 0 ? (
                filteredPoomsae.map((entry) => (
                  <tr key={entry._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-purple-600">{entry.entryId}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{entry.name}</p>
                      <p className="text-xs text-gray-500">{entry.tfiIdNo || 'No TFI ID'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm">{entry.division}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        entry.category === 'Individual' ? 'bg-blue-100 text-blue-700' :
                        entry.category === 'Pair' ? 'bg-green-100 text-green-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {entry.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{entry.gender}</td>
                    <td className="px-6 py-4 text-sm">
                      {entry.currentBeltGrade || entry.danCertificateNo || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(entry.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedPoomsae(entry)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {entry.formFileName && (
                          <a
                            href={entry.formDownloadUrl || `${BACKEND_URL}/forms/${entry.formFileName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800"
                            title="Download Form"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No poomsae applications found for {user?.district} district
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedPoomsae && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Poomsae Entry Details</h2>
              <button
                onClick={() => setSelectedPoomsae(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Entry ID</p>
                  <p className="font-semibold">{selectedPoomsae.entryId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold">{selectedPoomsae.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Division</p>
                  <p className="font-semibold">{selectedPoomsae.division}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-semibold">{selectedPoomsae.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-semibold">{selectedPoomsae.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="font-semibold">{selectedPoomsae.age} years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="font-semibold">{selectedPoomsae.weight} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">State</p>
                  <p className="font-semibold">{selectedPoomsae.stateOrg}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">District</p>
                  <p className="font-semibold">{selectedPoomsae.district || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">TFI ID</p>
                  <p className="font-semibold">{selectedPoomsae.tfiIdNo || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Belt Grade</p>
                  <p className="font-semibold">{selectedPoomsae.currentBeltGrade || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dan Certificate</p>
                  <p className="font-semibold">{selectedPoomsae.danCertificateNo || 'Not applicable'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mobile</p>
                  <p className="font-semibold">{selectedPoomsae.mobileNo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Parent/Guardian</p>
                  <p className="font-semibold">{selectedPoomsae.parentGuardianName}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Academic Qualification</p>
                  <p className="font-semibold">{selectedPoomsae.academicQualification || 'Not specified'}</p>
                </div>
                {selectedPoomsae.nameOfCollege && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">College</p>
                    <p className="font-semibold">{selectedPoomsae.nameOfCollege}</p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Registration Date</p>
                  <p className="font-semibold">{formatDate(selectedPoomsae.createdAt)}</p>
                </div>
              </div>

              {selectedPoomsae.formFileName && (
                <a
                  href={selectedPoomsae.formDownloadUrl || `${BACKEND_URL}/forms/${selectedPoomsae.formFileName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-blue-600 text-white text-center px-4 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Download Application Form
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistrictAdminPoomsaeApplications;
