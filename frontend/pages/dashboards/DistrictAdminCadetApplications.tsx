import React, { useState, useEffect } from 'react';
import { districtAdminAPI } from '../../services/api';
import { useAuth } from '../../src/contexts/AuthContext';

interface Cadet {
  _id: string;
  entryId: string;
  name: string;
  gender: string;
  age: number;
  weight: number;
  state: string;
  district?: string;
  presentBeltGrade: string;
  tfiIdCardNo: string;
  schoolName: string;
  formFileName?: string;
  formDownloadUrl?: string;
  createdAt: string;
}

const DistrictAdminCadetApplications: React.FC = () => {
  const { user } = useAuth();
  const [cadets, setCadets] = useState<Cadet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCadet, setSelectedCadet] = useState<Cadet | null>(null);

  useEffect(() => {
    fetchCadets();
  }, [currentPage]);

  const fetchCadets = async () => {
    try {
      setLoading(true);
      const response = await districtAdminAPI.getCadets(currentPage, 20);
      if (response.success) {
        const items = (response.data?.items || []).map((c: any) => ({
          _id: c._id || c.id || c.entryId || Math.random().toString(36).slice(2),
          entryId: c.entryId,
          name: c.name,
          gender: c.gender === 'male' ? 'Boy' : c.gender === 'female' ? 'Girl' : c.gender,
          age: c.age,
          weight: c.weight,
          state: c.state,
          district: c.district,
          presentBeltGrade: c.presentBeltGrade,
          tfiIdCardNo: c.tfiIdCardNo,
          schoolName: c.schoolName,
          formFileName: c.formFileName,
          formDownloadUrl: c.formDownloadUrl || c.downloadUrl,
          createdAt: c.createdAt
        }));
        setCadets(items);
        setTotalPages(response.data?.totalPages || 1);
      } else if (response.message) {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch cadet applications');
    } finally {
      setLoading(false);
    }
  };

  const filteredCadets = cadets.filter((cadet) => {
    const matchesSearch = cadet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cadet.entryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (cadet.tfiIdCardNo && cadet.tfiIdCardNo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGender = filterGender === 'all' || cadet.gender === filterGender;
    return matchesSearch && matchesGender;
  });

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cadet Applications</h1>
          <p className="text-gray-600 mt-1">
            {user?.district} District - Manage cadet registration entries
          </p>
        </div>
        <button
          onClick={fetchCadets}
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
          <p className="text-2xl font-bold text-blue-600">{cadets.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Boys</p>
          <p className="text-2xl font-bold text-green-600">
            {cadets.filter(c => c.gender === 'Boy').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Girls</p>
          <p className="text-2xl font-bold text-pink-600">
            {cadets.filter(c => c.gender === 'Girl').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Your District</p>
          <p className="text-xl font-bold text-purple-600">{user?.district}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid md:grid-cols-2 gap-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All Genders</option>
              <option value="Boy">Boy</option>
              <option value="Girl">Girl</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Belt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCadets.length > 0 ? (
                filteredCadets.map((cadet) => (
                  <tr key={cadet._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-blue-600">{cadet.entryId}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{cadet.name}</p>
                      <p className="text-xs text-gray-500">{cadet.tfiIdCardNo}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        cadet.gender === 'Boy' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                      }`}>
                        {cadet.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{cadet.age} yrs</td>
                    <td className="px-6 py-4 text-sm">{cadet.presentBeltGrade}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(cadet.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedCadet(cadet)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {cadet.formFileName && (
                          <a
                            href={cadet.formDownloadUrl || `http://localhost:5000/forms/${cadet.formFileName}`}
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
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No cadet applications found for {user?.district} district
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
      {selectedCadet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Cadet Details</h2>
              <button
                onClick={() => setSelectedCadet(null)}
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
                  <p className="font-semibold">{selectedCadet.entryId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold">{selectedCadet.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-semibold">{selectedCadet.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="font-semibold">{selectedCadet.age} years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="font-semibold">{selectedCadet.weight} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">State</p>
                  <p className="font-semibold">{selectedCadet.state}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">District</p>
                  <p className="font-semibold">{selectedCadet.district || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Belt Grade</p>
                  <p className="font-semibold">{selectedCadet.presentBeltGrade}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">TFI ID</p>
                  <p className="font-semibold">{selectedCadet.tfiIdCardNo}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">School</p>
                  <p className="font-semibold">{selectedCadet.schoolName}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Registration Date</p>
                  <p className="font-semibold">{formatDate(selectedCadet.createdAt)}</p>
                </div>
              </div>

              {selectedCadet.formFileName && (
                <a
                  href={selectedCadet.formDownloadUrl || `http://localhost:5000/forms/${selectedCadet.formFileName}`}
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

export default DistrictAdminCadetApplications;
