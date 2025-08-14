import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ProfileEdit from '../common/ProfileEdit';
import PasswordUpdate from '../common/PasswordUpdate';

const CustomerProfile = () => {
  const { currentUser } = useContext(AuthContext);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    delivered: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerStats = async () => {
      if (!currentUser?._id) return;

      try {
        // Make an API call to get real customer statistics
        const response = await fetch('/api/customer/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setOrderStats(data.data);
        } else {
          console.error('Failed to fetch customer stats:', response.statusText);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching customer stats:', error);
        setLoading(false);
      }
    };

    fetchCustomerStats();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">My Profile</h1>
        <Link
          to="/customer/dashboard"
          className="text-green-700 hover:text-green-900 font-medium"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <span className="text-green-700 text-xl font-bold">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'C'}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">{currentUser.name}</h2>
          <p className="text-gray-600 mb-2">{currentUser.email}</p>
          <p className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">Customer</p>
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
              <span className="font-medium text-gray-600">Member Since:</span>
              <span className="text-gray-800">
                {currentUser.createdAt 
                  ? new Date(currentUser.createdAt).toLocaleDateString() 
                  : 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="mt-6">
            <Link
              to="/customer/profile/edit"
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

      {/* Order Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Statistics</h2>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-green-800">{orderStats.total}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 mb-1">Pending Orders</p>
              <p className="text-3xl font-bold text-yellow-700">{orderStats.pending}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 mb-1">Delivered Orders</p>
              <p className="text-3xl font-bold text-blue-700">{orderStats.delivered}</p>
            </div>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <Link
            to="/customer/orders"
            className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
