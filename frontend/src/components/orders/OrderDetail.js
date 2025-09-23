import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../config/api';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fetch order details when component mounts
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        
        const response = await api.get(`/api/orders/${id}`);
        
        
        console.log('Order API response:', response);
        
        
        const orderData = response.data.data || response.data;
        
        
        console.log('Extracted order data:', orderData);
        
        if (!orderData) {
          throw new Error('Order not found');
        }
        
        const populatedCustomer = orderData.customerId && typeof orderData.customerId === 'object' 
          ? orderData.customerId 
          : null;
          
        console.log('Populated customer data:', populatedCustomer);
        
        let formattedOrder = {
          ...orderData,
          // Ensure all required fields exist with default values if not present
          orderNumber: orderData.orderNumber || `ORD-${id.substring(0, 8).toUpperCase()}`,
          orderDate: orderData.orderDate || orderData.createdAt || new Date().toISOString(),
          status: orderData.status || 'Pending',
          paymentStatus: orderData.paymentStatus || 'Unknown',
          paymentMethod: orderData.paymentMethod || 'Unknown',
          shippingAddress: orderData.shippingAddress || orderData.deliveryAddress || 'Not provided',
          shippingFee: orderData.shippingFee || 0,
          tax: orderData.tax || 0,
          discount: orderData.discount || 0,
          notes: orderData.notes || '',
          history: orderData.history || [
            { date: orderData.createdAt || orderData.orderDate || new Date().toISOString(), status: orderData.status || 'Pending', note: 'Order placed' }
          ],
          
          // Extract customer info from populated data if available
          customerName: populatedCustomer?.name || orderData.customerName || 'Customer',
          customerEmail: populatedCustomer?.email || orderData.customerEmail || '',
          customerPhone: populatedCustomer?.phone || orderData.customerPhone || '',
          
          // Store the customer object for reference
          customer: populatedCustomer || null
        };
        
        // Try to get customer details - first directly from the order if available
        let customerInfo = {
          customerName: orderData.customerName || 'Customer',
          customerEmail: orderData.customerEmail || '',
          customerPhone: orderData.customerPhone || ''
        };
        
        // Check if there's a customer object directly in the order
        if (orderData.customer && typeof orderData.customer === 'object') {
          console.log('Customer data found directly in order:', orderData.customer);
          customerInfo = {
            customerName: orderData.customer.name || customerInfo.customerName,
            customerEmail: orderData.customer.email || customerInfo.customerEmail,
            customerPhone: orderData.customer.phone || customerInfo.customerPhone,
            customerId: orderData.customer._id || orderData.customerId
          };
        } 
        // If no embedded customer object, try to fetch from API if we have an ID
        else if (orderData.customerId && typeof orderData.customerId === 'string') {
          try {
            console.log(`Fetching customer data for ID: ${orderData.customerId}`);
            const customerResponse = await api.get(`/api/customers/${orderData.customerId}`);
            console.log('Customer API response:', customerResponse);
            
            const customerData = customerResponse.data.data || customerResponse.data;
            if (customerData) {
              customerInfo = {
                customerName: customerData.name || customerInfo.customerName,
                customerEmail: customerData.email || customerInfo.customerEmail,
                customerPhone: customerData.phone || customerInfo.customerPhone,
                customerId: orderData.customerId
              };
              console.log('Updated customer info from API:', customerInfo);
            }
          } catch (customerErr) {
            console.warn('Could not fetch customer details:', customerErr);
          }
        } else {
          console.warn('No valid customer data or ID found in order:', orderData);
        }
        
        // Update formattedOrder with customer info
        formattedOrder = {
          ...formattedOrder,
          ...customerInfo
        };
        
        // Process order items and extract product details from populated data
        const processedItems = orderData.items.map((item, index) => {
          // Debug log the original item
          console.log(`Processing order item ${index}:`, item);
          
          // Check for populated product data
          const populatedProduct = item.productId && typeof item.productId === 'object' 
            ? item.productId 
            : null;
          
          console.log(`Populated product data for item ${index}:`, populatedProduct);
          
          // Initialize with default values
          let productName = item.name || 'Unknown Product';
          let imageUrl = null;
          let productDetails = {};
          
          // Extract data from populated product if available
          if (populatedProduct) {
            productName = populatedProduct.name || productName;
            imageUrl = populatedProduct.image || populatedProduct.imageUrl || null;
            productDetails = populatedProduct;
          }
          
          // Use any available image URL or use fallbacks
          const finalImageUrl = imageUrl || 
                              item.imageUrl || 
                              item.image || 
                              '/images/product-placeholder.jpg';
                              
          console.log(`Final image URL for ${productName}:`, finalImageUrl);
          
          // Format seller info if available
          const populatedSeller = item.sellerId && typeof item.sellerId === 'object' 
            ? item.sellerId 
            : null;
            
          console.log(`Populated seller data for item ${index}:`, populatedSeller);
          
          return {
            ...item,
            productName,
            subtotal: item.price * item.quantity,
            image: finalImageUrl,
            productDetails,
            sellerName: populatedSeller?.name || null
          };
        });
        
        // Update the formatted order with processed items
        formattedOrder.items = processedItems;
        
        setOrder(formattedOrder);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        // Delete the order through the API
        await api.delete(`/api/orders/${id}`);
        
        // On success, redirect to orders list
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
    if (!status) {
      return 'bg-gray-100 text-gray-800'; // Default style if status is undefined
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
                  onClick={(e) => {
                    console.log('Edit link clicked for order', id);
                  }}
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

          {/* Order Status Update section removed */}

          {/* Order Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Customer Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span>{' '}
                  {order.customerName || order.customer?.name || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{' '}
                  {order.customerEmail || order.customer?.email || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{' '}
                  {order.customerPhone || order.customer?.phone || 'N/A'}
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
                <p className="font-medium pt-2">Price Breakdown:</p>
                <div className="pl-2 space-y-1">
                    <p className="text-sm">
                    Subtotal: LKR {(order.totalAmount - 
                      (order.shippingFee || 0) - 
                      (order.tax || 0) + 
                      (order.discount || 0)).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    Shipping: LKR {order.shippingFee ? order.shippingFee.toLocaleString() : '0'}
                  </p>
                  <p className="text-sm">
                    Tax: LKR {order.tax ? order.tax.toLocaleString() : '0'}
                  </p>
                  <p className="text-sm">
                    Discount: -LKR {order.discount ? order.discount.toLocaleString() : '0'}
                  </p>
                  <p className="font-medium pt-1">
                    Total: LKR {order.totalAmount ? order.totalAmount.toLocaleString() : '0'}
                  </p>
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
                  {order.items.map((item, index) => (
                    <tr key={typeof item.productId === 'string' ? item.productId : `item-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img 
                              className="h-10 w-10 rounded object-cover" 
                              src={item.image || '/images/product-placeholder.jpg'} 
                              alt={item.productName}
                              onError={(e) => {
                                console.log('Image failed to load:', e.target.src);
                                e.target.onerror = null;
                                e.target.src = '/images/product-placeholder.jpg';
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                            {item.sellerId && (
                              <div className="text-xs text-gray-500">Seller ID: {item.sellerId}</div>
                            )}
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
                          LKR {item.subtotal ? item.subtotal.toLocaleString() : '0'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {typeof item.productId === 'string' ? (
                          <Link 
                            to={`/products/${item.productId}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Product
                          </Link>
                        ) : (
                          <span className="text-gray-500">Product Details Unavailable</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan="3" className="px-6 py-3 text-right font-medium">Total:</td>
                    <td className="px-6 py-3 font-medium">
                      LKR {order.totalAmount ? order.totalAmount.toLocaleString() : '0'}
                    </td>
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
