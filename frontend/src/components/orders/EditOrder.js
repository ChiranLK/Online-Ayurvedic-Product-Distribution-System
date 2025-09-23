import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { AuthContext } from '../../context/AuthContext';

// Debug log when component loads
console.log('EditOrder component loaded');

const EditOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [canEdit, setCanEdit] = useState(false);
  const { currentUser } = useContext(AuthContext);
  
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
        setLoading(true);
        console.log('Fetching order data for ID:', id);
        
        // Fetch order details from the API
        const response = await api.get(`/api/orders/${id}`);
        console.log('API response:', response);
        
        // Handle both data structures: response.data.data or response.data directly
        const orderData = response.data.data || response.data;
        
        if (!orderData) {
          throw new Error('Order not found');
        }
        
        console.log('Order data loaded:', orderData);
        console.log('Current user:', currentUser);
        
        // Check if user is authorized to edit this order
        const customerId = typeof orderData.customerId === 'object' ? orderData.customerId._id : orderData.customerId;
        console.log('Order customerId:', customerId, 'Current user ID:', currentUser?.id);
        
        const isCustomerOrder = currentUser && 
          (customerId === currentUser.id || 
           customerId === currentUser._id);
        
        console.log('Is customer order?', isCustomerOrder);
        
        // Only allow editing if:
        // 1. The order belongs to the current user
        // 2. The order status is Pending or Processing (not shipped, delivered, or cancelled)
        const editableStatus = ['Pending', 'Processing'].includes(orderData.status);
        console.log('Order status:', orderData.status, 'Is status editable?', editableStatus);
        
        setCanEdit(isCustomerOrder && editableStatus);
        
        if (!isCustomerOrder) {
          console.log('Access denied: Not customer order');
          setError("You can only edit your own orders");
        } else if (!editableStatus) {
          console.log('Access denied: Order status not editable');
          setError(`Orders with status "${orderData.status}" cannot be edited`);
        }
        
        // Format the order data for the form
        setOrderData({
          _id: orderData._id,
          orderNumber: orderData.orderNumber,
          customerId: orderData.customerId && typeof orderData.customerId === 'object' ? orderData.customerId._id : orderData.customerId,
          customerName: orderData.customerName || (orderData.customerId && typeof orderData.customerId === 'object' ? orderData.customerId.name : ''),
          customerEmail: orderData.customerEmail || (orderData.customerId && typeof orderData.customerId === 'object' ? orderData.customerId.email : ''),
          customerPhone: orderData.customerPhone || (orderData.customerId && typeof orderData.customerId === 'object' ? orderData.customerId.phone : ''),
          shippingAddress: orderData.shippingAddress || orderData.deliveryAddress || '',
          billingAddress: orderData.billingAddress || orderData.deliveryAddress || '',
          orderDate: orderData.orderDate || orderData.createdAt,
          status: orderData.status || 'Pending',
          paymentMethod: orderData.paymentMethod || 'COD',
          paymentStatus: orderData.paymentStatus || 'Pending',
          totalAmount: orderData.totalAmount,
          shippingFee: orderData.shippingFee || 0,
          discount: orderData.discount || 0,
          tax: orderData.tax || 0,
          trackingNumber: orderData.trackingNumber || '',
          notes: orderData.notes || '',
          items: (orderData.items || []).map(item => {
            // Handle both populated and non-populated items
            const productId = item.productId && typeof item.productId === 'object' ? item.productId._id : item.productId;
            const productName = item.name || (item.productId && typeof item.productId === 'object' ? item.productId.name : 'Unknown Product');
            const image = item.image || (item.productId && typeof item.productId === 'object' ? item.productId.image : null);
            
            return {
              productId,
              productName,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.price * item.quantity,
              image: image || '/images/product-placeholder.jpg'
            };
          })
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order data:', err);
        setError('Failed to load order data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchOrderData();
  }, [id, currentUser]);


  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData({
      ...orderData,
      [name]: value
    });
  };

  // Handle quantity changes for order items
  const handleQuantityChange = (index, newQuantity) => {
    // Ensure quantity is at least 1
    newQuantity = Math.max(1, parseInt(newQuantity) || 1);
    
    const updatedItems = [...orderData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: newQuantity,
      subtotal: newQuantity * updatedItems[index].price
    };
    
    setOrderData({
      ...orderData,
      items: updatedItems
    });
  };

  // Calculate order totals
  const calculateTotals = () => {
    const subtotal = orderData.items.reduce((sum, item) => sum + item.subtotal, 0);
    const shippingFee = orderData.shippingFee || 0;
    const tax = orderData.tax || 0;
    const discount = orderData.discount || 0;
    const total = subtotal + shippingFee + tax - discount;
    
    return { subtotal, shippingFee, tax, discount, total };
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canEdit) {
      setError("This order cannot be edited");
      return;
    }
    
    setSubmitting(true);
    setError('');
    console.log('Submitting order update...');

    try {
      // Validate form
      if (!orderData.shippingAddress) {
        throw new Error('Shipping address is required');
      }

      // Prepare data for API - only include fields customers can edit
      const updateData = {
        shippingAddress: orderData.shippingAddress,
        notes: orderData.notes,
        items: orderData.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };
      
      console.log('Update data to send:', updateData);

      // Call API to update order
      const response = await api.put(`/api/orders/${id}`, updateData);
      console.log('Order update successful:', response.data);
      
      // Redirect on success
      setSubmitting(false);
      navigate(`/customer/orders/${id}`);
    } catch (err) {
      console.error('Error updating order:', err);
      setSubmitting(false);
      
      // Handle error message extraction
      let errorMessage = 'Failed to update order. Please try again later.';
      
      if (err.response && err.response.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.log('Setting error message:', errorMessage);
      setError(errorMessage);
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
    <div className="max-w-7xl mx-auto px-4 py-6">
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

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Edit Order {orderData.orderNumber}</h1>
              {!canEdit && (
                <p className="mt-2 text-sm text-red-600">
                  This order cannot be edited. Orders can only be modified while in "Pending" or "Processing" status.
                </p>
              )}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor(orderData.status)}`}>
                      {orderData.status}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Order status can only be updated by sellers or admin</p>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                    <div className="text-gray-900">{orderData.paymentStatus}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <div className="text-gray-900">{orderData.paymentMethod}</div>
                  </div>
              </div>
            </div>

              {/* Shipping Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Shipping Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700">
                      Shipping Address <span className="text-green-600">*</span>
                      {canEdit && <span className="text-xs text-green-600 ml-2">(Editable)</span>}
                    </label>
                    <textarea
                      id="shippingAddress"
                      name="shippingAddress"
                      rows="3"
                      value={orderData.shippingAddress}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md ${canEdit 
                        ? "border-green-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50" 
                        : "border-gray-300 bg-gray-100"}`}
                      required
                      disabled={!canEdit}
                    ></textarea>
                  </div>                  <div>
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

              {/* Additional Notes */}
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Additional Notes</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes for Delivery
                      {canEdit && <span className="text-xs text-green-600 ml-2">(Editable)</span>}
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows="3"
                      value={orderData.notes || ''}
                      onChange={handleInputChange}
                      placeholder="Add any special instructions for delivery"
                      className={`mt-1 block w-full rounded-md ${canEdit 
                        ? "border-green-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50" 
                        : "border-gray-300 bg-gray-100"}`}
                      disabled={!canEdit}
                    ></textarea>
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
                    {orderData.items.map((item, index) => (
                      <tr key={item.productId || `item-${index}`}>
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
                          {canEdit ? (
                            <div className="flex items-center">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(index, item.quantity - 1)}
                                className="text-gray-500 hover:text-gray-700"
                                disabled={item.quantity <= 1}
                              >
                                <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                  <path d="M20 12H4"></path>
                                </svg>
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(index, e.target.value)}
                                className="mx-2 w-16 text-center border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                              />
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(index, item.quantity + 1)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                  <path d="M12 4v16m8-8H4"></path>
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-900">{item.quantity}</div>
                          )}
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

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => navigate(`/orders/${id}`)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !canEdit}
                className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${(!canEdit || submitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
