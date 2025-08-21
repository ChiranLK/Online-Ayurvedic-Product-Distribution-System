import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/api';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        console.log(`Fetching order details for ID: ${id}`);
        const response = await api.get(`/api/orders/${id}`);
        console.log('Order details response:', response.data);
        
        // Handle both data structures: response.data.data or response.data directly
        const orderData = response.data.data || response.data;
        
        if (!orderData) {
          throw new Error('Order not found');
        }
        
        setOrder(orderData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(`Failed to fetch order: ${err.message}`);
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const updateOrderStatus = async (newStatus) => {
    try {
      console.log(`Updating order ${id} to status: ${newStatus}`);
      
      await api.put(`/api/orders/${id}`, { status: newStatus });
      
      // Update the local state
      setOrder({ ...order, status: newStatus });
      
      alert(`Order status updated to ${newStatus} successfully`);
    } catch (err) {
      console.error('Error updating order status:', err);
      alert(`Failed to update order status: ${err.message}`);
    }
  };

  const getStatusBadgeColor = (status) => {
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

  const handleGoBack = () => {
    navigate(-1);
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
        <button 
          onClick={handleGoBack}
          className="mt-2 bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg mb-6">
        <p>Order not found</p>
        <button 
          onClick={handleGoBack}
          className="mt-2 bg-yellow-600 text-white py-1 px-3 rounded hover:bg-yellow-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Order Detail</h1>
        <button 
          onClick={handleGoBack}
          className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
        >
          Back to Orders
        </button>
      </div>

      {/* Order Summary Card */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Order #{order._id}
            </h2>
            <p className="text-sm text-gray-500">
              {new Date(order.createdAt || order.orderDate).toLocaleDateString()} at {new Date(order.createdAt || order.orderDate).toLocaleTimeString()}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
              {order.status || 'Unknown'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-base font-medium text-gray-700 mb-2">Customer Information</h3>
            <div className="bg-gray-50 rounded p-3">
              {order.customerId ? (
                <div>
                  <p className="text-sm font-medium">
                    {typeof order.customerId === 'object' ? order.customerId.name : 'Customer ID: ' + order.customerId}
                  </p>
                  {typeof order.customerId === 'object' && order.customerId.email && (
                    <p className="text-sm text-gray-500">{order.customerId.email}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Customer information not available</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-base font-medium text-gray-700 mb-2">Delivery Address</h3>
            <div className="bg-gray-50 rounded p-3">
              <p className="text-sm text-gray-800">
                {order.deliveryAddress ? (
                  typeof order.deliveryAddress === 'object' ? (
                    <>
                      {order.deliveryAddress.street && <span>{order.deliveryAddress.street}, </span>}
                      {order.deliveryAddress.city && <span>{order.deliveryAddress.city}, </span>}
                      {order.deliveryAddress.state && <span>{order.deliveryAddress.state}, </span>}
                      {order.deliveryAddress.zip && <span>{order.deliveryAddress.zip}</span>}
                    </>
                  ) : (
                    order.deliveryAddress
                  )
                ) : 'Address not provided'}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-base font-medium text-gray-700 mb-2">Payment Information</h3>
          <div className="bg-gray-50 rounded p-3">
            <div className="flex justify-between">
              <p className="text-sm font-medium">Payment Method:</p>
              <p className="text-sm">
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                 order.paymentMethod === 'card' ? 'Credit/Debit Card' : 
                 order.paymentMethod || 'Not specified'}
              </p>
            </div>
            <div className="flex justify-between mt-1">
              <p className="text-sm font-medium">Payment Status:</p>
              <p className="text-sm">
                {order.paymentStatus || (order.status === 'Delivered' ? 'Paid' : 'Pending')}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-medium text-gray-700 mb-2">Order Status</h3>
          <div className="bg-gray-50 rounded p-3">
            <p className="text-sm mb-2">Current Status: <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>{order.status}</span></p>
            
            <div className="mt-3">
              <label htmlFor="status-update" className="block text-sm font-medium text-gray-700 mb-1">
                Update Status
              </label>
              <div className="flex space-x-2">
                <select
                  id="status-update"
                  className="border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  defaultValue=""
                >
                  <option value="" disabled>Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <button
                  onClick={() => {
                    const select = document.getElementById('status-update');
                    if (select.value) {
                      updateOrderStatus(select.value);
                      select.value = "";
                    }
                  }}
                  className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Order Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seller
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.productId && (typeof item.productId === 'object' ? 
                              `ID: ${item.productId._id}` : `ID: ${item.productId}`)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.sellerId && (typeof item.sellerId === 'object' ? 
                          item.sellerId.name : 'Seller ID: ' + item.sellerId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      LKR {Number(item.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      LKR {(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No items found in this order
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan="4" className="px-6 py-4 text-right font-medium">
                  Total:
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-gray-900">
                  LKR {Number(order.totalAmount).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Order Timeline */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Timeline</h2>
        <div className="flow-root">
          <ul className="-mb-8">
            <li>
              <div className="relative pb-8">
                <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                <div className="relative flex items-start space-x-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                      <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      Order Placed
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {new Date(order.createdAt || order.orderDate).toLocaleDateString()} at {new Date(order.createdAt || order.orderDate).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </li>
            {order.status !== 'Pending' && (
              <li>
                <div className="relative pb-8">
                  <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                        <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        Order Processing
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() + ' at ' + new Date(order.updatedAt).toLocaleTimeString() : 'Date not available'}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            )}
            {(order.status === 'Shipped' || order.status === 'Delivered') && (
              <li>
                <div className="relative pb-8">
                  <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center ring-8 ring-white">
                        <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                        </svg>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        Order Shipped
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() + ' at ' + new Date(order.updatedAt).toLocaleTimeString() : 'Date not available'}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            )}
            {order.status === 'Delivered' && (
              <li>
                <div className="relative">
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                        <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        Order Delivered
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() + ' at ' + new Date(order.updatedAt).toLocaleTimeString() : 'Date not available'}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            )}
            {order.status === 'Cancelled' && (
              <li>
                <div className="relative">
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center ring-8 ring-white">
                        <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        Order Cancelled
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() + ' at ' + new Date(order.updatedAt).toLocaleTimeString() : 'Date not available'}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
