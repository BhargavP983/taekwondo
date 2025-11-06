import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';

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
  const isSuperAdmin = user?.role === 'super_admin';
  const isStateAdmin = user?.role === 'state_admin';
  const [admins, setAdmins] = useState<DistrictAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [form, setForm] = useState<any>({ name: '', email: '', password: '', district: '' });
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
                    <button disabled={!canEdit(admin)} className={`text-blue-600 ${!canEdit(admin) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => canEdit(admin) && handleOpenEdit(admin)} > Edit </button>
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
    </div>
  );
};

export default DistrictAdminManagement;
