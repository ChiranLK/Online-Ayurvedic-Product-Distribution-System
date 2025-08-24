import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AdminNavigation from './AdminNavigation';
import api from '../../config/api';

const AdminProfile = () => {
  const { currentUser } = useContext(AuthContext);
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    pendingSellers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      if (!currentUser?._id) return;

      try {
        console.log('Fetching admin stats from API...');
        
        // Log the current API base URL for debugging
        console.log('API base URL:', api.defaults.baseURL);
        
        // Make an API call to get real admin statistics using the api instance
        const response = await api.get('/api/admin/stats/');
        
        const data = response.data;
        console.log('Admin Stats API Response:', data); // For debugging
        
        // Update stats with the correct API response structure
        setStats({
          users: (data.totalCustomers || 0) + (data.totalSellers || 0),
          products: data.totalProducts || 0,
          orders: data.totalOrders || 0,
          pendingSellers: data.pendingSellers || 0
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, [currentUser]);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <AdminNavigation />
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">Admin Profile</h1>
        <Link
          to="/admin/dashboard"
          className="text-green-700 hover:text-green-900 font-medium"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-4">
            <span className="text-purple-700 text-xl font-bold">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">{currentUser.name}</h2>
          <p className="text-gray-600 mb-2">{currentUser.email}</p>
          <p className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full">Administrator</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 col-span-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h2>
          <div className="space-y-3">
            <div className="flex flex-col md:flex-row md:justify-between">
              <span className="font-medium text-gray-600">Phone:</span>
              <span className="text-gray-800">{currentUser.phone}</span>
            </div>
            <div className="flex flex-col md:flex-row md:justify-between">
              <span className="font-medium text-gray-600">Address:</span>
              <span className="text-gray-800">{currentUser.address}</span>
            </div>
            {currentUser.city && (
              <div className="flex flex-col md:flex-row md:justify-between">
                <span className="font-medium text-gray-600">City:</span>
                <span className="text-gray-800">{currentUser.city}</span>
              </div>
            )}
            {currentUser.state && (
              <div className="flex flex-col md:flex-row md:justify-between">
                <span className="font-medium text-gray-600">State/Province:</span>
                <span className="text-gray-800">{currentUser.state}</span>
              </div>
            )}
            {currentUser.zipcode && (
              <div className="flex flex-col md:flex-row md:justify-between">
                <span className="font-medium text-gray-600">ZIP/Postal Code:</span>
                <span className="text-gray-800">{currentUser.zipcode}</span>
              </div>
            )}
            <div className="flex flex-col md:flex-row md:justify-between">
              <span className="font-medium text-gray-600">Admin Since:</span>
              <span className="text-gray-800">
                {currentUser.createdAt 
                  ? new Date(currentUser.createdAt).toLocaleDateString() 
                  : 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="mt-6">
            <Link
              to="/admin/profile/edit"
              className="text-green-700 hover:text-green-900 font-medium flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Admin Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">System Statistics</h2>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-blue-700">{stats.users}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 mb-1">Total Products</p>
              <p className="text-3xl font-bold text-green-800">{stats.products}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-yellow-700">{stats.orders}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 mb-1">Pending Sellers</p>
              <p className="text-3xl font-bold text-red-700">{stats.pendingSellers}</p>
            </div>
          </div>
        )}
        
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            to="/admin/users"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/products"
            className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Manage Products
          </Link>
          <Link
            to="/admin/sellers/pending"
            className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Review Sellers
          </Link>
        </div>
      </div>

      {/* Admin Security Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Security Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Change Password</h3>
              <p className="text-sm text-gray-600">Update your password for better security</p>
            </div>
            <Link
              to="/admin/change-password"
              className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200"
            >
              Change
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600">Add an extra layer of security</p>
            </div>
            <Link
              to="/admin/two-factor"
              className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200"
            >
              Setup
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Login History</h3>
              <p className="text-sm text-gray-600">View your recent login activity</p>
            </div>
            <Link
              to="/admin/login-history"
              className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
