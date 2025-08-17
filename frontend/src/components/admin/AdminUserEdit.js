import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { useModal } from '../../context/ModalContext';

const AdminUserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openModal } = useModal();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    isActive: false,
    phone: '',
    address: ''
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/api/admin/users/${id}`);
        const userData = response.data.data || response.data;
        
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          role: userData.role || '',
          isActive: userData.isActive || false,
          phone: userData.phone || '',
          address: userData.address || ''
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user details:', error);
        setError('Failed to load user details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [id]);

  const { name, email, role, isActive, phone, address } = formData;

  const onChange = e => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    // Validation
    if (!name || !email || !role) {
      setError('Please fill in all required fields');
      return;
    }
    
    setSubmitting(true);
    setError('');

    try {
      // Prepare user data for update
      const updatedUser = {
        name,
        email,
        role,
        isActive,
        phone,
        address
      };
      
      // Submit to API
      await api.put(`/api/admin/users/${id}`, updatedUser);
      
      setSubmitting(false);
      
      // Show success modal
      openModal({
        title: 'User Updated',
        message: `User ${name} has been successfully updated.`,
        type: 'success',
        confirmText: 'OK',
        onConfirm: () => navigate(`/admin/users`)
      });
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user. Please try again.');
      setSubmitting(false);
      
      // Show error modal
      openModal({
        title: 'Update Failed',
        message: err.response?.data?.message || 'Failed to update user. Please try again.',
        type: 'error',
        confirmText: 'OK'
      });
    }
  };

  const handleDeleteUser = async () => {
    openModal({
      title: 'Delete User',
      message: `Are you sure you want to delete ${name}? This action cannot be undone.`,
      type: 'warning',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await api.delete(`/api/admin/users/${id}`);
          
          openModal({
            title: 'User Deleted',
            message: 'The user has been successfully deleted.',
            type: 'success',
            confirmText: 'OK',
            onConfirm: () => navigate('/admin/users')
          });
        } catch (err) {
          openModal({
            title: 'Delete Failed',
            message: err.response?.data?.message || 'Failed to delete user. Please try again.',
            type: 'error',
            confirmText: 'OK'
          });
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-700 border-opacity-50 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading user details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-800 mb-6">Edit User</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <form onSubmit={onSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={onChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter full name"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={onChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter email address"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="role">
                Role *
              </label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={onChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select a role</option>
                <option value="customer">Customer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="phone">
                Phone Number
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={phone}
                onChange={onChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter phone number"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="address">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={address}
                onChange={onChange}
                rows="3"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter address"
              ></textarea>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={isActive}
                onChange={onChange}
                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-gray-700">
                Active Account
              </label>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
            >
              Delete User
            </button>

            <div>
              <button
                type="button"
                onClick={() => navigate('/admin/users')}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg mr-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded-lg"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                    <span>Updating...</span>
                  </div>
                ) : 'Update User'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUserEdit;
