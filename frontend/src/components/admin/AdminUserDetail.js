import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../config/api';
import { useModal } from '../../context/ModalContext';

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openModal } = useModal();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/api/admin/users/${id}`);
        const userData = response.data.data || response.data;
        setUser(userData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError('Failed to load user details. Please try again later.');
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleDeleteUser = () => {
    if (!user) return;
    
    openModal({
      title: 'Delete User',
      message: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
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

  const toggleUserStatus = async () => {
    if (!user) return;
    
    try {
      const newStatus = !user.isActive;
      const action = newStatus ? 'activate' : 'deactivate';
      
      openModal({
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
        message: `Are you sure you want to ${action} ${user.name}?`,
        type: 'warning',
        confirmText: 'Yes, Continue',
        cancelText: 'Cancel',
        onConfirm: async () => {
          try {
            // Call API to update user status
            await api.put(`/api/admin/users/${id}`, { isActive: newStatus });
            
            // Update local state
            setUser({ ...user, isActive: newStatus });
            
            // Show success message
            openModal({
              title: 'Success',
              message: `${user.name} has been ${newStatus ? 'activated' : 'deactivated'} successfully.`,
              type: 'success',
              confirmText: 'OK'
            });
          } catch (err) {
            // Show error message
            openModal({
              title: 'Error',
              message: err.response?.data?.message || `Failed to ${action} user.`,
              type: 'error',
              confirmText: 'OK'
            });
          }
        }
      });
    } catch (err) {
      console.error(`Error ${user.isActive ? 'deactivating' : 'activating'} user:`, err);
      
      openModal({
        title: 'Error',
        message: err.response?.data?.message || 'An error occurred while updating user status.',
        type: 'error',
        confirmText: 'OK'
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-700 border-opacity-50 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading user details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
        <p>{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg mb-6">
        <p>User not found</p>
      </div>
    );
  }

  const roleColors = {
    admin: 'purple',
    seller: 'blue',
    customer: 'green'
  };
  
  const roleColor = roleColors[user.role] || 'gray';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-800">User Details</h1>
        <div>
          <Link 
            to={`/admin/users/edit/${id}`}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 mr-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit User
          </Link>
          <button
            onClick={() => navigate('/admin/users')}
            className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Users
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-4 text-green-800">Basic Information</h2>
              
              <div className="mb-3">
                <span className="block text-sm font-medium text-gray-500">Status</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="mb-3">
                <span className="block text-sm font-medium text-gray-500">Role</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-${roleColor}-100 text-${roleColor}-800`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
              
              <div className="mb-3">
                <span className="block text-sm font-medium text-gray-500">Full Name</span>
                <span className="text-lg font-semibold text-gray-800">{user.name}</span>
              </div>
              
              <div className="mb-3">
                <span className="block text-sm font-medium text-gray-500">Email Address</span>
                <span className="text-lg text-gray-800">{user.email}</span>
              </div>
            </div>
            
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-4 text-green-800">Additional Details</h2>
              
              <div className="mb-3">
                <span className="block text-sm font-medium text-gray-500">Phone Number</span>
                <span className="text-lg text-gray-800">{user.phone || 'Not provided'}</span>
              </div>
              
              <div className="mb-3">
                <span className="block text-sm font-medium text-gray-500">Address</span>
                <span className="text-lg text-gray-800">{user.address || 'Not provided'}</span>
              </div>
              
              <div className="mb-3">
                <span className="block text-sm font-medium text-gray-500">Member Since</span>
                <span className="text-lg text-gray-800">{new Date(user.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>
          </div>

          {user.role === 'customer' && (
            <div className="mt-4">
              <h2 className="text-xl font-bold mb-4 text-green-800">Orders</h2>
              {user.orders && user.orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Map orders here if available */}
                      <tr>
                        <td className="px-6 py-4" colSpan="5">
                          <div className="text-sm text-gray-500 text-center">
                            No order data available.
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-gray-500">No orders yet.</div>
              )}
            </div>
          )}
          
          {user.role === 'seller' && (
            <div className="mt-4">
              <h2 className="text-xl font-bold mb-4 text-green-800">Products</h2>
              {user.products && user.products.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Map products here if available */}
                      <tr>
                        <td className="px-6 py-4" colSpan="5">
                          <div className="text-sm text-gray-500 text-center">
                            No product data available.
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-gray-500">No products yet.</div>
              )}
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <div>
              <button
                onClick={handleDeleteUser}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
              >
                Delete User
              </button>
            </div>
            <div>
              <button
                onClick={toggleUserStatus}
                className={`px-5 py-2 rounded-lg mr-4 ${
                  user.isActive 
                    ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                {user.isActive ? 'Deactivate User' : 'Activate User'}
              </button>
              <Link 
                to={`/admin/users/edit/${id}`}
                className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded-lg"
              >
                Edit User
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetail;
