import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // For status update
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // In a real app, fetch from API
        // const response = await axios.get(`http://localhost:5000/api/orders/${id}`);
        // setOrder(response.data);
        
        // Mock data
        const mockOrder = {
          _id: id,
          orderNumber: 'ORD-2023-' + id,
          customerId: '1',
          customerName: 'Kamal Perera',
          customerEmail: 'kamal@example.com',
          customerPhone: '0771234567',
          shippingAddress: '456 Beach Road, Colombo 03, Sri Lanka',
          billingAddress: '456 Beach Road, Colombo 03, Sri Lanka',
          orderDate: '2023-10-15T08:30:00.000Z',
          status: 'Delivered',
          paymentMethod: 'Credit Card',
          paymentStatus: 'Paid',
          totalAmount: 12500,
          shippingFee: 500,
          discount: 1000,
          tax: 1500,
          items: [
            {
              productId: '1',
              productName: 'Ashwagandha Powder',
              quantity: 2,
              price: 2500,
              subtotal: 5000,
              image: 'https://images.unsplash.com/photo-1626198226928-99ef1ba1d285?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
            },
            {
              productId: '3',
              productName: 'Turmeric Capsules',
              quantity: 3,
              price: 1500,
              subtotal: 4500,
              image: 'https://images.unsplash.com/photo-1626198138066-7891428d1a74?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
            },
            {
              productId: '5',
              productName: 'Aloe Vera Gel',
              quantity: 1,
              price: 2000,
              subtotal: 2000,
              image: 'https://images.unsplash.com/photo-1596046611348-7db3c12eac56?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
            }
          ],
          notes: 'Please deliver during work hours (9 AM - 5 PM)',
          trackingNumber: 'SLT12345678',
          deliveryDate: '2023-10-18T14:20:00.000Z',
          history: [
            { date: '2023-10-15T08:30:00.000Z', status: 'Pending', note: 'Order placed' },
            { date: '2023-10-15T10:45:00.000Z', status: 'Processing', note: 'Payment confirmed' },
            { date: '2023-10-16T09:15:00.000Z', status: 'Shipped', note: 'Order has been shipped' },
            { date: '2023-10-18T14:20:00.000Z', status: 'Delivered', note: 'Order has been delivered' }
          ]
        };
        
        setOrder(mockOrder);
        setNewStatus(mockOrder.status);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (order.status === newStatus) return;
    
    setIsUpdating(true);
    try {
      // In a real app, update via API
      // await axios.put(`http://localhost:5000/api/orders/${id}/status`, { status: newStatus });
      
      // Simulate API call
      console.log(`Updating order ${id} status to: ${newStatus}`);
      
      // Update local state
      setOrder({
        ...order,
        status: newStatus,
        history: [
          ...order.history,
          { date: new Date().toISOString(), status: newStatus, note: `Status updated to ${newStatus}` }
        ]
      });
      
      // Simulate successful API call
      setTimeout(() => {
        setIsUpdating(false);
      }, 1000);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. Please try again later.');
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        // In a real app, delete via API
        // await axios.delete(`http://localhost:5000/api/orders/${id}`);
        
        console.log(`Deleting order with ID: ${id}`);
        navigate('/orders');
      } catch (err) {
        console.error('Error deleting order:', err);
        setError('Failed to delete order. Please try again later.');
      }
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
          onClick={() => navigate('/orders')}
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
          onClick={() => navigate('/orders')}
          className="mt-2 text-yellow-800 underline"
        >
          Return to orders list
        </button>
      </div>
    );
  }

  // Status badge color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
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

  return (
    <div>
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          to="/orders"
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
              <h1 className="text-2xl font-bold text-gray-800">{order.orderNumber}</h1>
              <p className="text-gray-600">
                {new Date(order.orderDate).toLocaleDateString()} at {new Date(order.orderDate).toLocaleTimeString()}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center mt-4 sm:mt-0">
              <div className="mr-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              
              <div className="flex space-x-2 mt-2 sm:mt-0">
                <Link
                  to={`/orders/edit/${id}`}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit
                </Link>
                
                <button
                  onClick={handleDelete}
                  className="flex items-center text-red-600 hover:text-red-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Order Status Update */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Update Order Status</h2>
            <div className="flex flex-wrap items-center">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 mr-3"
                disabled={isUpdating}
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Returned">Returned</option>
              </select>
              
              <button
                onClick={handleUpdateStatus}
                disabled={isUpdating || order.status === newStatus}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${(isUpdating || order.status === newStatus) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isUpdating ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : 'Update Status'}
              </button>
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Customer Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {order.customerName}</p>
                <p><span className="font-medium">Email:</span> {order.customerEmail}</p>
                <p><span className="font-medium">Phone:</span> {order.customerPhone}</p>
                <div className="pt-2">
                  <Link
                    to={`/customers/${order.customerId}`}
                    className="text-green-600 hover:text-green-800 text-sm"
                  >
                    View Customer Profile
                  </Link>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Shipping Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Address:</span> {order.shippingAddress}</p>
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
                    {order.paymentStatus}
                  </span>
                </p>
                <p className="font-medium pt-2">Price Breakdown:</p>
                <div className="pl-2 space-y-1">
                  <p className="text-sm">Subtotal: LKR {(order.totalAmount - order.shippingFee - order.tax + order.discount).toLocaleString()}</p>
                  <p className="text-sm">Shipping: LKR {order.shippingFee.toLocaleString()}</p>
                  <p className="text-sm">Tax: LKR {order.tax.toLocaleString()}</p>
                  <p className="text-sm">Discount: -LKR {order.discount.toLocaleString()}</p>
                  <p className="font-medium pt-1">Total: LKR {order.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
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
                  {order.items.map((item) => (
                    <tr key={item.productId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img className="h-10 w-10 rounded object-cover" src={item.image} alt={item.productName} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">LKR {item.price.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">LKR {item.subtotal.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link 
                          to={`/products/${item.productId}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Product
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan="3" className="px-6 py-3 text-right font-medium">Total:</td>
                    <td className="px-6 py-3 font-medium">LKR {order.totalAmount.toLocaleString()}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Order History */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Order History</h2>
            <div className="space-y-4">
              {order.history.map((historyItem, index) => (
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
                    <p className="mt-1 text-gray-800">{historyItem.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
