import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { authAPI } from '../../services/api';

const API = 'http://localhost:5000/api/auth/district-admins';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' +
    (localStorage.getItem('token') || sessionStorage.getItem('token') || '')
});

interface DistrictAdmin {
  _id: string;
  name: string;
  email: string;
  state: string;
  district: string;
  isActive: boolean;
}

const DistrictAdminManagement: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superAdmin';
  const isStateAdmin = user?.role === 'stateAdmin';
  const [admins, setAdmins] = useState<DistrictAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [form, setForm] = useState<any>({ name: '', email: '', password: '', district: '' });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetPasswordError, setResetPasswordError] = useState('');
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  const canEdit = (admin: DistrictAdmin) => {
    if (isSuperAdmin) return true;
    if (isStateAdmin) return admin.state === user.state;
    return false;
  };

  const fetchAdmins = async () => {
    setLoading(true);
    const resp = await fetch(API, { headers: getHeaders() });
    const data = await resp.json();
    setAdmins(data.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleOpenAdd = () => {
    setForm({ name: '', email: '', password: '', district: '' });
    setSelectedId(null);
    setModalMode('add');
    setShowModal(true);
  };

  const handleOpenEdit = (admin: DistrictAdmin) => {
    setForm({ name: admin.name, email: admin.email, district: admin.district });
    setSelectedId(admin._id);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    // For edit, password is not required and not sent
    let resp;
    if (modalMode === 'add') {
      resp = await fetch(API, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ...form, password: form.password })
      });
    } else {
      resp = await fetch(`${API}/${selectedId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(form)
      });
    }
    const data = await resp.json();
    if (data.success) {
      setShowModal(false);
      fetchAdmins();
    } else {
      alert(data.message || 'Error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this district admin?')) return;
    const resp = await fetch(`${API}/${id}`, { method: 'DELETE', headers: getHeaders() });
    const data = await resp.json();
    if (data.success) fetchAdmins();
    else alert(data.message || 'Error');
  };

  const handleToggle = async (id: string) => {
    const resp = await fetch(`${API}/${id}/toggle-status`, { method: 'PATCH', headers: getHeaders() });
    const data = await resp.json();
    if (data.success) fetchAdmins();
    else alert(data.message || 'Error');
  };

  const handleOpenResetPassword = (admin: DistrictAdmin) => {
    setResetPasswordId(admin._id);
    setNewPassword('');
    setConfirmPassword('');
    setResetPasswordError('');
    setShowResetPassword(true);
  };

  const handleResetPassword = async () => {
    if (!resetPasswordId) return;
    
    setResetPasswordError('');
    
    if (!newPassword || !confirmPassword) {
      setResetPasswordError('Please enter both password fields');
      return;
    }
    
    if (newPassword.length < 6) {
      setResetPasswordError('Password must be at least 6 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setResetPasswordError('Passwords do not match');
      return;
    }
    
    setResetPasswordLoading(true);
    
    try {
      await authAPI.adminResetPassword(resetPasswordId, newPassword);
      alert('Password reset successfully!');
      setShowResetPassword(false);
      setResetPasswordId(null);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setResetPasswordError(err.message || 'Failed to reset password');
    } finally {
      setResetPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">District Admin Management</h1>
        <button onClick={handleOpenAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Add District Admin
        </button>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">District</th>
                <th className="px-6 py-3">Active</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(admin => (
                <tr key={admin._id} className="border-b">
                  <td className="px-6 py-2">{admin.name}</td>
                  <td className="px-6 py-2">{admin.email}</td>
                  <td className="px-6 py-2">{admin.district}</td>
                  <td className="px-6 py-2">
                    <button
                      disabled={!canEdit(admin)}
                      className={`px-3 py-1 rounded 
                          ${admin.isActive ? 'bg-green-100 text-green-700'
                                           : 'bg-red-100 text-red-700'}
                      border
                      ${!canEdit(admin) ? 'opacity-50 cursor-not-allowed' : ''}
      `}
                      onClick={() => canEdit(admin) && handleToggle(admin._id)}
                    >
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <button disabled={!canEdit(admin)} className={`text-blue-600 mr-3 ${!canEdit(admin) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => canEdit(admin) && handleOpenEdit(admin)} > Edit </button>
                    <button disabled={!canEdit(admin)} className={`text-orange-600 mr-3 ${!canEdit(admin) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => canEdit(admin) && handleOpenResetPassword(admin)} > Reset Password </button>
                    <button disabled={!canEdit(admin)} className={`text-red-600 ${!canEdit(admin) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => canEdit(admin) && handleDelete(admin._id)} > Delete </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">
              {modalMode === 'add' ? 'Add' : 'Edit'} District Admin
            </h2>
            <label>Name</label>
            <input
              className="mb-2 w-full border px-2 py-1"
              value={form.name || ''}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            <label>Email</label>
            <input
              className="mb-2 w-full border px-2 py-1"
              type="email"
              value={form.email || ''}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
            {modalMode === 'add' && (
              <>
                <label>Password</label>
                <input
                  className="mb-2 w-full border px-2 py-1"
                  type="password"
                  value={form.password || ''}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
              </>
            )}
            <label>District</label>
            <input
              className="mb-2 w-full border px-2 py-1"
              value={form.district || ''}
              onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
            />
            <div className="flex gap-2">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleSubmit}
              >
                Save
              </button>
              <button
                className="bg-gray-200 px-4 py-2 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Reset District Admin Password</h2>
            
            {resetPasswordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4 text-sm">
                {resetPasswordError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter new password (min 6 characters)"
                  disabled={resetPasswordLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Confirm new password"
                  disabled={resetPasswordLoading}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleResetPassword}
                  disabled={resetPasswordLoading}
                  className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {resetPasswordLoading ? 'Resetting...' : 'Reset Password'}
                </button>
                <button
                  onClick={() => setShowResetPassword(false)}
                  disabled={resetPasswordLoading}
                  className="flex-1 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
              
              <p className="text-xs text-gray-600 text-center mt-2">
                This will immediately change the user's password
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistrictAdminManagement;
