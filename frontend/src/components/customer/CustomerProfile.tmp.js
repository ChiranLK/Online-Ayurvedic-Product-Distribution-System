import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ProfileEdit from '../common/ProfileEdit';
import PasswordUpdate from '../common/PasswordUpdate';
import api from '../../config/api';

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
        const response = await api.get('/api/customer/stats');
        
        if (response.data && response.data.data) {
          setOrderStats(response.data.data);
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
            className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mr-4"
          >
            View All Orders
          </Link>
        </div>
      </div>

      {/* Appointment Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Ayurvedic Doctor Appointments</h2>
        
        <div className="p-4 bg-green-50 rounded-lg mb-6">
          <p className="text-gray-700 mb-2">
            Book an appointment with our certified Ayurvedic doctors for personalized consultations and health advice.
          </p>
          <p className="text-gray-600 text-sm">
            Our doctors will review your health concerns and provide guidance on appropriate Ayurvedic treatments and products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-green-200 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-green-800 mb-2">Book New Appointment</h3>
            <p className="text-gray-600 mb-4">Request a new consultation with our Ayurvedic specialists.</p>
            <Link
              to="/customer/appointments/new"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Book Appointment
            </Link>
          </div>
          
          <div className="bg-white border border-green-200 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-green-800 mb-2">View My Appointments</h3>
            <p className="text-gray-600 mb-4">Check the status of your appointment requests and upcoming consultations.</p>
            <Link
              to="/customer/appointments"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View Appointments
            </Link>
          </div>
        </div>
        
        {/* Become a Seller Section */}
        <div className="mt-10 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-green-800 mb-4">Become a Seller</h2>
          <BecomeSellerSection />
        </div>
      </div>
    </div>
  );
};

// Become a Seller component
const BecomeSellerSection = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);
  const [reason, setReason] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  // Fetch any existing request on component mount
  useEffect(() => {
    const fetchSellerRequest = async () => {
      try {
        const response = await api.get('/api/seller-requests/me');
        
        if (response.data && response.data.data && response.data.data.requested) {
          setRequestStatus(response.data.data.requestStatus);
        }
      } catch (error) {
        console.error('Error fetching seller request:', error);
      }
    };
    
    fetchSellerRequest();
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/api/seller-requests', { reason });
      
      if (response.data && response.data.success) {
        setSuccess(true);
        setRequestStatus('pending');
        setShowForm(false);
      } else {
        setError(response.data?.message || 'Failed to submit request');
      }
    } catch (err) {
      console.error('Error submitting seller request:', err);
      // Check if there's a response with error details from the server
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Error submitting request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // If user already has a request
  if (requestStatus) {
    return (
      <div>
        {requestStatus === 'pending' && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Your seller application is pending</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>We're reviewing your request to become a seller. You'll be notified once a decision is made.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {requestStatus === 'approved' && (
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Your seller application was approved!</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>You now have seller privileges. Please log out and log back in to access your seller dashboard.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {requestStatus === 'rejected' && (
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Your seller application was declined</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Unfortunately, your request to become a seller has been declined. Please contact customer support for more information.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div>
      {!showForm ? (
        <div className="text-center">
          <p className="mb-4 text-gray-600">
            Would you like to sell your own Ayurvedic products on our platform? 
            Apply to become a seller today!
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Apply to Become a Seller
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 text-green-700 p-3 rounded-lg">
              Your seller request has been submitted successfully!
            </div>
          )}
          
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="reason">
              Why do you want to become a seller?
            </label>
            <textarea
              id="reason"
              name="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="4"
              required
            ></textarea>
            <p className="text-sm text-gray-500 mt-1">
              Please tell us about what products you plan to sell and your experience with Ayurvedic products.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CustomerProfile;
