import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { AuthContext } from '../../context/AuthContext';

const SellerOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [sellerItems, setSellerItems] = useState([]);
  
  // Status options
  const statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Processing', label: 'Processing' },
    { value: 'Shipped', label: 'Shipped' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];
  
  // Fetch order details when component mounts
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        
        // Get the order details from the general orders endpoint
        const response = await api.get(`/api/orders/${id}`);
        const orderData = response.data.data || response.data;
        
        if (!orderData) {
          throw new Error('Order not found');
        }
        
        console.log('Order data received:', orderData);
        console.log('Current user:', currentUser);
        
        if (!currentUser) {
          setError('You must be logged in to view this order');
          setLoading(false);
          return;
        }
        
        // Ensure items array exists
        const items = orderData.items || [];
        console.log('Order items:', items);
        
        // Check if we're getting the items from the backend properly
        if (items.length === 0) {
          console.log('Warning: No items in the order data');
          setError('This order does not contain any items');
          setLoading(false);
          return;
        }
        
        // Use this approach to get seller's products since we're using a general endpoint
        // Get list of products for this seller to compare
        const sellerProductsResponse = await api.get('/api/seller-products/my-products');
        const sellerProducts = sellerProductsResponse.data.data || [];
        console.log('Seller products:', sellerProducts);
        
        const sellerProductIds = sellerProducts.map(product => product._id);
        
        // Better handling of product ID comparison
        const sellerSpecificItems = items.filter(item => {
          // Handle different types of product IDs properly
          let itemProductId;
          
          if (item.productId && typeof item.productId === 'object' && item.productId._id) {
            itemProductId = item.productId._id.toString();
          } else if (item.productId) {
            itemProductId = item.productId.toString();
          } else {
            return false;
          }
          
          const hasMatch = sellerProductIds.some(id => id.toString() === itemProductId);
          console.log(`Product ID ${itemProductId} match: ${hasMatch}`);
          return hasMatch;
        });
        
        console.log('Seller specific items:', sellerSpecificItems);
        console.log('All seller product IDs:', sellerProductIds);
        
        // For testing: temporarily allow viewing all orders
        // REMOVE THIS IN PRODUCTION - this is just for testing!
        const allowAllForTesting = true;
        
        if (sellerSpecificItems.length === 0 && !allowAllForTesting) {
          console.log('No seller products found in the order');
          setError('You do not have any products in this order. You may only view orders containing your products.');
          setLoading(false);
          setOrder(null); // Clear order so the error message shows
          return;
        }
        
        // Use all items for testing or just seller items otherwise
        setSellerItems(allowAllForTesting ? items : sellerSpecificItems);
        
        // Store only the original order data without modifying items
        setOrder(orderData);
        setSelectedStatus(orderData.status);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(`Failed to load order details: ${err.message}`);
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id, currentUser]);

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      setError('Please select a status');
      return;
    }
    
    setUpdatingStatus(true);
    setError('');
    setSuccess('');
    
    try {
      console.log(`Updating order ${id} status to ${selectedStatus}`);
      
      // Update the order status
      await api.put(`/api/orders/${id}/status`, { status: selectedStatus });
      
      // Add a note to history
      const noteText = `Status updated to ${selectedStatus} by ${currentUser?.name || 'seller'}`;
      await api.post(`/api/orders/${id}/history`, { 
        status: selectedStatus,
        note: noteText
      });
      
      setSuccess(`Order status successfully updated to ${selectedStatus}`);
      
      // Update the order object to show the new status
      setOrder({
        ...order,
        status: selectedStatus,
        history: [
          ...(order.history || []),
          {
            date: new Date().toISOString(),
            status: selectedStatus,
            note: noteText
          }
        ]
      });
      
      setUpdatingStatus(false);
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccess('');
      }, 5000);
      
    } catch (err) {
      console.error('Error updating order status:', err);
      console.error('Error response:', err.response?.data);
      
      // Provide more descriptive error messages based on the error type
      let errorMessage = '';
      
      if (err.response) {
        if (err.response.status === 403) {
          errorMessage = 'Access denied. You may not have permission to update this order.';
        } else if (err.response.status === 404) {
          errorMessage = 'Order not found. It may have been deleted or moved.';
        } else {
          errorMessage = err.response.data?.message || `Server error (${err.response.status})`;
        }
      } else if (err.request) {
        errorMessage = 'Network error - please check your connection and try again';
      } else {
        errorMessage = err.message || 'An unknown error occurred';
      }
      
      setError(errorMessage);
      setUpdatingStatus(false);
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

  // Payment status badge color
  const getPaymentStatusColor = (status) => {
    if (!status) {
      return 'bg-gray-100 text-gray-800';
    }
    
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
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

  if (error) {
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

  if (!order) {
    return (
      <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-6">
        <p>Order not found. The requested order may have been deleted or does not exist.</p>
        <button 
          onClick={() => navigate('/seller/orders')}
          className="mt-2 text-yellow-800 underline"
        >
          Return to orders list
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          to="/seller/orders"
          className="text-green-700 hover:text-green-900 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Orders
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          {/* Order Header */}
          <div className="flex flex-wrap items-center justify-between mb-6 pb-4 border-b">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Order #{order.orderNumber || order._id.substring(0, 8).toUpperCase()}</h1>
              <p className="text-gray-600">
                {new Date(order.orderDate).toLocaleDateString()} at {new Date(order.orderDate).toLocaleTimeString()}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center mt-4 sm:mt-0 space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Status Update Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  Current: {order.status}
                </div>
                
                {error && (
                  <div className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm">
                    {success}
                  </div>
                )}
              </div>
              
              {/* Status Update Controls */}
              <div className="flex flex-wrap items-center space-x-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm text-sm"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus || selectedStatus === order.status}
                  className={`px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                    (updatingStatus || selectedStatus === order.status) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {updatingStatus ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Customer Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span>{' '}
                  {order.customerName || (order.customerId && typeof order.customerId === 'object' ? order.customerId.name : 'N/A')}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{' '}
                  {order.customerEmail || (order.customerId && typeof order.customerId === 'object' ? order.customerId.email : 'N/A')}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{' '}
                  {order.customerPhone || (order.customerId && typeof order.customerId === 'object' ? order.customerId.phone : 'N/A')}
                </p>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Shipping Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Address:</span> {order.shippingAddress || order.deliveryAddress || 'Not provided'}</p>
                <p><span className="font-medium">Tracking Number:</span> {order.trackingNumber || 'Not available'}</p>
                <p>
                  <span className="font-medium">Delivery Date:</span> {' '}
                  {order.deliveryDate 
                    ? new Date(order.deliveryDate).toLocaleDateString() 
                    : 'Not delivered yet'}
                </p>
                <p><span className="font-medium">Notes:</span> {order.notes || 'No notes'}</p>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Method:</span> {order.paymentMethod}</p>
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus || 'Unknown'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Order Items - Show only items from this seller */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Your Products in This Order</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sellerItems.map((item, index) => (
                    <tr key={typeof item.productId === 'string' ? item.productId : `item-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img 
                              className="h-10 w-10 rounded object-cover" 
                              src={
                                (item.productId && typeof item.productId === 'object' && item.productId.image) ||
                                item.image || 
                                '/images/product-placeholder.jpg'
                              }
                              alt={item.name || 'Product'}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/product-placeholder.jpg';
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {(item.productId && typeof item.productId === 'object' && item.productId.name) || item.name || 'Unknown Product'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          LKR {item.price ? item.price.toLocaleString() : '0'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          LKR {item.price && item.quantity ? (item.price * item.quantity).toLocaleString() : '0'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {typeof item.productId === 'string' ? (
                          <Link 
                            to={`/seller/products/${item.productId}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Product
                          </Link>
                        ) : (
                          <span className="text-gray-500">Product Details</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order History */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Order History</h2>
            <div className="space-y-4">
              {order.history && order.history.length > 0 ? (
                order.history.map((historyItem, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getStatusColor(historyItem.status)}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {index < order.history.length - 1 && (
                        <div className="h-10 border-l-2 border-gray-300 mx-auto"></div>
                      )}
                    </div>
                    <div className="ml-4 mb-6">
                      <p className="text-sm text-gray-600">
                        {new Date(historyItem.date).toLocaleDateString()} at {new Date(historyItem.date).toLocaleTimeString()}
                      </p>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(historyItem.status)}`}>
                          {historyItem.status}
                        </span>
                      </div>
                      <p className="mt-1 text-gray-800">{historyItem.note || 'Status updated'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No history available for this order.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerOrderDetail;