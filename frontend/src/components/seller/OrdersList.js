import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';

const SellerOrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [statusUpdateMessage, setStatusUpdateMessage] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/api/seller-orders/my-orders');
        console.log('Orders data:', response.data);
        setOrders(response.data.data || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch orders. Please make sure you are logged in as a seller.');
        setLoading(false);
        console.error('Error fetching orders:', err);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on status
  const filteredOrders = statusFilter
    ? orders.filter(order => order.status === statusFilter)
    : orders;

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate total amount for each order (seller's products only)
  const calculateTotal = (order) => {
    return order.items.reduce((total, item) => {
      // For seller orders, we should only count items from this seller
      // This logic would need to be enhanced based on your full implementation
      return total + (item.price * item.quantity);
    }, 0);
  };

  // Status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Handle order status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    setStatusUpdateMessage({ type: '', message: '' });
    
    try {
      console.log(`Attempting to update order ${orderId} to status: ${newStatus}`);
      
      // Update the order status via the API
      const statusResponse = await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
      console.log('Status update response:', statusResponse.data);
      
      try {
        // Add a history note - wrapped in separate try/catch to continue even if this fails
        const historyResponse = await api.post(`/api/orders/${orderId}/history`, { 
          status: newStatus,
          note: `Status updated to ${newStatus} by seller from orders list`
        });
        console.log('History update response:', historyResponse.data);
      } catch (historyErr) {
        console.error('History update failed but status was updated:', historyErr);
        // Continue execution since the main status update succeeded
      }
      
      // Update the local state to reflect the change
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      
      setStatusUpdateMessage({
        type: 'success',
        message: `Order ${orderId.substring(0, 8)} updated to ${newStatus}`
      });
      
      // Clear success message after a few seconds
      setTimeout(() => {
        setStatusUpdateMessage({ type: '', message: '' });
      }, 3000);
    } catch (err) {
      console.error('Error updating order status:', err);
      console.error('Error details:', err.response?.data);
      
      // More descriptive error message based on the error type
      let errorMessage = 'Failed to update order: ';
      
      if (err.response) {
        // The request was made and the server responded with an error status
        errorMessage += err.response.data?.message || `Server error (${err.response.status})`;
        
        if (err.response.status === 403) {
          errorMessage = 'Access denied. You may not have permission to update this order.';
        } else if (err.response.status === 404) {
          errorMessage = 'Order not found. It may have been deleted.';
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage += 'Network error - please check your connection and try again';
      } else {
        // Something happened in setting up the request
        errorMessage += err.message;
      }
      
      setStatusUpdateMessage({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
        <div className="flex items-center">
          <select
            className="bg-white border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      {statusUpdateMessage.message && (
        <div className={`mb-4 p-3 rounded ${statusUpdateMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {statusUpdateMessage.message}
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No orders found.</p>
          {statusFilter && (
            <button
              onClick={() => setStatusFilter('')}
              className="mt-2 text-green-600 hover:text-green-800"
            >
              Clear filter
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{order._id.substring(0, 8)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(order.orderDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.customerId ? order.customerId.name : 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.customerId ? order.customerId.email : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.items.length} items</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">LKR {calculateTotal(order).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <Link to={`/seller/orders/${order._id}`} className="text-blue-600 hover:text-blue-900">
                        View Details
                      </Link>
                      <div className="flex items-center">
                        <select
                          disabled={updatingOrderId === order._id}
                          value={order.status || ""}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          className="text-sm border border-gray-300 rounded py-1 px-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        {updatingOrderId === order._id && (
                          <div className="ml-2">
                            <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-green-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SellerOrdersList;
