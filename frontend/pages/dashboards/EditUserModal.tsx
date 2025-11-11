import React, { useState, useEffect, FormEvent } from 'react';
import { usersAPI, authAPI } from '../../services/api';
import { AP_DISTRICTS } from '../../src/constants/districts';
import { useAuth } from '../../src/contexts/AuthContext';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  state?: string;
  district?: string;
  isActive: boolean;
}

interface EditUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, user, onClose, onSuccess }) => {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'districtAdmin',
    state: '',
    district: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState('');

  // Check if current user can reset password for this user
  const canResetPassword = () => {
    if (!user || !currentUser) return false;
    
    // SuperAdmin can reset for StateAdmin and DistrictAdmin
    if (currentUser.role === 'superAdmin' && ['stateAdmin', 'districtAdmin'].includes(user.role)) {
      return true;
    }
    
    // StateAdmin can reset for DistrictAdmin in their state
    if (currentUser.role === 'stateAdmin' && user.role === 'districtAdmin' && user.state === currentUser.state) {
      return true;
    }
    
    return false;
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        state: user.state || '',
        district: user.district || '',
        isActive: user.isActive
      });
      setShowResetPassword(false);
      setNewPassword('');
      setConfirmPassword('');
      setResetPasswordError('');
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value;
    
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      const response = await usersAPI.update(user._id, formData as any);
      
      if (response.success) {
        alert('User updated successfully!');
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Failed to update user');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;
    
    setResetPasswordError('');
    
    // Validation
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
      await authAPI.adminResetPassword(user._id, newPassword);
      alert(`Password reset successfully for ${user.name}`);
      setShowResetPassword(false);
      setNewPassword('');
      setConfirmPassword('');
      setResetPasswordError('');
    } catch (err: any) {
      setResetPasswordError(err.message || 'Failed to reset password');
    } finally {
      setResetPasswordLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit User</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                <option value="districtAdmin">District Admin</option>
                <option value="stateAdmin">State Admin</option>
                <option value="superAdmin">Super Admin</option>
              </select>
            </div>

            {/* Status */}
            <div className="flex items-center pt-8">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Active User</span>
              </label>
            </div>

            {/* State */}
            {(formData.role === 'stateAdmin' || formData.role === 'districtAdmin') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select State</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Maharashtra">Maharashtra</option>
                </select>
              </div>
            )}

            {/* District */}
            {formData.role === 'districtAdmin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select District</option>
                  {AP_DISTRICTS.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Reset Password Section */}
          {canResetPassword() && (
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Reset User Password</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(!showResetPassword);
                    setResetPasswordError('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {showResetPassword ? 'Cancel' : 'Reset Password'}
                </button>
              </div>

              {showResetPassword && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  {resetPasswordError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">
                      {resetPasswordError}
                    </div>
                  )}

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

                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={resetPasswordLoading}
                    className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {resetPasswordLoading ? 'Resetting...' : 'Reset Password Now'}
                  </button>
                  
                  <p className="text-xs text-gray-600 text-center">
                    This will immediately change the user's password
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update User'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
