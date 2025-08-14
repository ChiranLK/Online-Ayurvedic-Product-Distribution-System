import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const EditOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Order data
  const [orderData, setOrderData] = useState({
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    billingAddress: '',
    paymentMethod: '',
    paymentStatus: '',
    status: '',
    notes: '',
    trackingNumber: '',
    orderDate: '',
    items: []
  });

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        // In a real app, fetch from API
        // const response = await axios.get(`http://localhost:5000/api/orders/${id}`);
        // setOrderData(response.data);
        
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
          status: 'Processing',
          paymentMethod: 'Credit Card',
          paymentStatus: 'Paid',
          totalAmount: 12500,
          shippingFee: 500,
          discount: 1000,
          tax: 1500,
          trackingNumber: 'SLT12345678',
          notes: 'Please deliver during work hours (9 AM - 5 PM)',
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
          ]
        };
        
        setOrderData(mockOrder);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order data:', err);
        setError('Failed to load order data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchOrderData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData({
      ...orderData,
      [name]: value
    });
  };

  const calculateTotals = () => {
    const subtotal = orderData.items.reduce((sum, item) => sum + item.subtotal, 0);
    const shippingFee = orderData.shippingFee || 500;
    const tax = orderData.tax || Math.round(subtotal * 0.15);
    const discount = orderData.discount || 0;
    const total = subtotal + shippingFee + tax - discount;
    
    return { subtotal, shippingFee, tax, discount, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Validate form
      if (!orderData.shippingAddress || !orderData.billingAddress) {
        throw new Error('Shipping and billing addresses are required');
      }

      // In a real app, put to API
      // const response = await axios.put(`http://localhost:5000/api/orders/${id}`, orderData);
      
      // Simulate API call
      console.log('Updating order:', orderData);
      
      // Redirect on success
      setTimeout(() => {
        setSubmitting(false);
        navigate(`/orders/${id}`);
      }, 1000);
    } catch (err) {
      setSubmitting(false);
      setError(err.message || 'Failed to update order. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-700 border-opacity-50 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading order data...</p>
      </div>
    );
  }

  if (error && !orderData.customerId) {
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

  return (
    <div>
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          to={`/orders/${id}`}
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
              <h1 className="text-2xl font-bold text-gray-800">Edit Order {orderData.orderNumber}</h1>
              <p className="text-gray-600">
                Created on {new Date(orderData.orderDate).toLocaleDateString()}
              </p>
            </div>
            
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderData.status)}`}>
              {orderData.status}
            </span>
          </div>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Customer Information (Read-only) */}
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Customer Information</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                    <div className="text-gray-900">{orderData.customerName}</div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="text-gray-900">{orderData.customerEmail}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="text-gray-900">{orderData.customerPhone}</div>
                  </div>
                </div>
              </div>

              {/* Order Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Order Information</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-4">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={orderData.status}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Returned">Returned</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                    <select
                      id="paymentStatus"
                      name="paymentStatus"
                      value={orderData.paymentStatus}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Failed">Failed</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      value={orderData.paymentMethod}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                    >
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Cash on Delivery">Cash on Delivery</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="PayPal">PayPal</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Shipping Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700">
                      Shipping Address
                    </label>
                    <textarea
                      id="shippingAddress"
                      name="shippingAddress"
                      rows="3"
                      value={orderData.shippingAddress}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                      required
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700">
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      id="trackingNumber"
                      name="trackingNumber"
                      value={orderData.trackingNumber || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Billing Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Billing Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700">
                      Billing Address
                    </label>
                    <textarea
                      id="billingAddress"
                      name="billingAddress"
                      rows="3"
                      value={orderData.billingAddress}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sameAsBilling"
                      checked={orderData.shippingAddress === orderData.billingAddress}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setOrderData({
                            ...orderData,
                            billingAddress: orderData.shippingAddress
                          });
                        }
                      }}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sameAsBilling" className="ml-2 block text-sm text-gray-900">
                      Billing address same as shipping address
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items (Read-only) */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Order Items</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderData.items.map((item) => (
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
                          <div className="text-sm text-gray-900">Rs. {item.price.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.quantity}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">Rs. {item.subtotal.toLocaleString()}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    {Object.entries(calculateTotals()).map(([key, value]) => {
                      if (key === 'total') return null;
                      const label = key.charAt(0).toUpperCase() + key.slice(1);
                      return (
                        <tr key={key} className="bg-gray-50">
                          <td colSpan="3" className="px-6 py-3 text-right font-medium">{label}:</td>
                          <td className="px-6 py-3 font-medium">Rs. {value.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-100">
                      <td colSpan="3" className="px-6 py-3 text-right font-medium text-lg">Total:</td>
                      <td className="px-6 py-3 font-medium text-lg">Rs. {calculateTotals().total.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Additional Information</h2>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Order Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows="3"
                  value={orderData.notes || ''}
                  onChange={handleInputChange}
                  placeholder="Special instructions for delivery or any other notes"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(`/orders/${id}`)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${submitting ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {submitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Update Order'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditOrder;
