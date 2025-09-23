import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { AuthContext } from '../../context/AuthContext';

const UpdateOrderStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Status options
  const statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Processing', label: 'Processing' },
    { value: 'Shipped', label: 'Shipped' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/orders/${id}`);
        const orderData = response.data.data || response.data;
        
        if (!orderData) {
          throw new Error('Order not found');
        }
        
        // Check if this seller has items in the order
        const hasSellerItems = orderData.items.some(
          item => item.sellerId === currentUser?.id
        );
        
        if (!hasSellerItems && currentUser?.role !== 'admin') {
          setError('You do not have permission to update this order');
          setLoading(false);
          return;
        }
        
        setOrder(orderData);
        setSelectedStatus(orderData.status);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id, currentUser]);
  
  // Handle status update
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    
    if (!selectedStatus) {
      setError('Please select a status');
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await api.put(`/api/orders/${id}/status`, { status: selectedStatus });
      
      // Add a note to history
      const noteText = `Status updated to ${selectedStatus} by ${currentUser?.name || 'seller'}`;
      await api.post(`/api/orders/${id}/history`, { 
        status: selectedStatus,
        note: noteText
      });
      
      setSuccess(`Order status successfully updated to ${selectedStatus}`);
      setSubmitting(false);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate(`/seller/orders/${id}`);
      }, 2000);
      
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err.response?.data?.message || 'Failed to update order status');
      setSubmitting(false);
    }
  };
  
  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-700 border-opacity-50 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading order details...</p>
      </div>
    );
  }
  
  if (error && !order) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
        <p>{error}</p>
        <button 
          onClick={() => navigate('/seller/orders')}
          className="mt-2 text-red-700 underline"
        >
          Return to orders list
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          to={`/seller/orders/${id}`}
          className="text-green-700 hover:text-green-900 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Order Details
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Update Order Status</h1>
              <p className="text-gray-600">Order #{order._id.substring(0, 8).toUpperCase()}</p>
            </div>
            
            <div className="flex items-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                Current: {order.status}
              </span>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
              <p>{success}</p>
            </div>
          )}

          {/* Status Update Form */}
          <form onSubmit={handleStatusUpdate} className="space-y-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                New Status
              </label>
              <div className="mt-1">
                <select
                  id="status"
                  name="status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Customer</p>
                  <p className="mt-1">{order.customerName || (order.customerId && order.customerId.name) || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="mt-1">{new Date(order.orderDate || order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Items</p>
                  <p className="mt-1">{order.items.length} items</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Amount</p>
                  <p className="mt-1">LKR {order.totalAmount?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </div>
            
            {/* Status History */}
            {order.history && order.history.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Status History</h3>
                <div className="space-y-2">
                  {order.history.map((historyItem, index) => (
                    <div key={index} className="flex items-start">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${getStatusColor(historyItem.status)}`}>
                        <span className="text-xs">{index + 1}</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">
                          {new Date(historyItem.date).toLocaleDateString()} at {new Date(historyItem.date).toLocaleTimeString()}
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(historyItem.status)}`}>
                          {historyItem.status}
                        </span>
                        <p className="text-sm mt-1">{historyItem.note || 'No note'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <Link
                to={`/seller/orders/${id}`}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || selectedStatus === order.status}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                  (submitting || selectedStatus === order.status) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  'Update Status'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateOrderStatus;