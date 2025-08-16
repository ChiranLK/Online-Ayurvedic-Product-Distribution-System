import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { clearCart } from '../../utils/cartUtils';
import { getFullImageUrl, handleImageError } from '../../utils/imageUtils';
import { AuthContext } from '../../context/AuthContext';
import api from '../../config/api';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, totalPrice } = location.state || { cartItems: [], totalPrice: 0 };
  const { currentUser } = useContext(AuthContext);
  
  // Debug cart items and auth state
  console.log('Checkout received cart items:', cartItems);
  if (cartItems.length > 0) {
    console.log('Sample item structure:', cartItems[0]);
  }
  
  // Debug auth state
  console.log('Auth state:', {
    token: localStorage.getItem('token'),
    userId: localStorage.getItem('userId'),
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    currentUser
  });
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'cod'
  });
  
  // Populate form with user data if available
  useEffect(() => {
    if (currentUser) {
      setFormData(prevData => ({
        ...prevData,
        fullName: currentUser.name || '',
        email: currentUser.email || ''
      }));
    }
  }, [currentUser]);
  
  const [errors, setErrors] = useState({});
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear specific error when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;
    
    // Validate form fields
    if (!formData.fullName.trim()) {
      tempErrors.fullName = 'Full name is required';
      isValid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    const phoneRegex = /^\d{10}$/;
    if (!formData.phone.trim()) {
      tempErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!phoneRegex.test(formData.phone)) {
      tempErrors.phone = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }
    
    if (!formData.address.trim()) {
      tempErrors.address = 'Address is required';
      isValid = false;
    }
    
    if (!formData.city.trim()) {
      tempErrors.city = 'City is required';
      isValid = false;
    }
    
    if (!formData.state.trim()) {
      tempErrors.state = 'State is required';
      isValid = false;
    }
    
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!formData.zipCode.trim()) {
      tempErrors.zipCode = 'Zip code is required';
      isValid = false;
    } else if (!zipRegex.test(formData.zipCode)) {
      tempErrors.zipCode = 'Please enter a valid zip code (e.g., 12345 or 12345-6789)';
      isValid = false;
    }
    
    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setOrderProcessing(true);
    
    try {
      console.log('Submitting order with data:', {
        items: cartItems,
        totalPrice,
        customer: formData
      });
      
      if (!currentUser || !currentUser.id) {
        console.error('No authenticated user found');
        setErrors({
          submit: 'You must be logged in to place an order. Please login and try again.'
        });
        setOrderProcessing(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      const userId = currentUser.id;
      
      console.log('Authentication info:', { 
        token, 
        userId, 
        currentUser,
        role: currentUser.role 
      });
      
      // Prepare order data
      const orderData = {
        customerId: userId, // This will actually be overridden on the server with the ID from the token
        items: cartItems.map(item => ({
          // Make sure to properly extract the product ID from cart items
          productId: item.product?._id || item._id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: totalPrice,
        deliveryAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
        paymentMethod: formData.paymentMethod
      };
      
      console.log('Sending order data to backend:', orderData);
      
      // Send order data to the backend using api instance with authentication token
      const response = await api.post('/api/orders', orderData);
      
      // Axios automatically throws an error if the request fails
      // The response data is in response.data
      const createdOrder = response.data;
      console.log('Order created successfully:', createdOrder);
      
      // Generate order number based on the returned order ID
      const randomOrderNumber = 'ORD-' + (createdOrder._id || Math.floor(100000 + Math.random() * 900000));
      setOrderNumber(randomOrderNumber);
      
      // Clear cart
      clearCart();
      
      // Set order complete
      setOrderComplete(true);
      setOrderProcessing(false);
      
    } catch (error) {
      console.error('Error processing order:', error);
      
      // Detailed error logging
      if (error.response) {
        console.error('Server response error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      
      // Check for authentication errors
      if (error.response?.status === 401) {
        // Auth error - token might be expired
        setErrors({
          submit: 'Your session has expired. Please login again to place your order.'
        });
      } else {
        // Other errors
        setErrors({
          submit: `Failed to process your order: ${error.response?.data?.message || error.message || 'Unknown error'}`
        });
      }
      
      setOrderProcessing(false);
    }
  };

  if (cartItems.length === 0 && !orderComplete) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Checkout</h2>
        <div className="bg-gray-100 p-8 rounded-md mb-4">
          <p className="text-lg mb-4">Your cart is empty</p>
          <button 
            onClick={() => navigate('/products')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-green-50 border-2 border-green-100 p-8 rounded-lg text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-green-800 mb-4">Order Confirmed!</h2>
          <p className="text-lg text-gray-700 mb-2">Thank you for your purchase.</p>
          <p className="text-gray-600 mb-6">Your order number is: <span className="font-semibold">{orderNumber}</span></p>
          <p className="text-gray-600 mb-8">We'll send you a confirmation email with your order details shortly.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Checkout</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Order Summary</h3>
            <div className="space-y-4 mb-4">
              {cartItems.map((item) => (
                <div key={item._id} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-12 w-12 flex-shrink-0 mr-4">
                      <img 
                        className="h-full w-full object-cover rounded" 
                        src={item.fullImageUrl || getFullImageUrl(item.product?.imageUrl || item.imageUrl)} 
                        alt={item.name || item.product?.name} 
                        onError={(e) => {
                          console.log('Checkout image failed to load:', e.target.src);
                          handleImageError(e);
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name || item.product?.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    Rs.{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">Rs.{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">Rs.0.00</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 text-lg font-bold">
                <span>Total</span>
                <span>Rs.{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                {errors.submit}
              </div>
            )}
            
            <h3 className="text-xl font-semibold mb-6">Shipping Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
              <div className="md:col-span-2">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md ${errors.fullName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'}`}
                />
                {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'}`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md ${errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'}`}
                  placeholder="10-digit number"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md ${errors.address ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'}`}
                />
                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md ${errors.city ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'}`}
                />
                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md ${errors.state ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'}`}
                />
                {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
              </div>
              
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">Zip Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md ${errors.zipCode ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'}`}
                />
                {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>}
              </div>
              
              <div className="md:col-span-2 pt-4 mt-2 border-t border-gray-200">
                <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input 
                      id="cod" 
                      name="paymentMethod" 
                      type="radio"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleChange}
                      className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                    />
                    <label htmlFor="cod" className="ml-3 block text-sm font-medium text-gray-700">
                      Cash on Delivery
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      id="card" 
                      name="paymentMethod" 
                      type="radio"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleChange}
                      className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                    />
                    <label htmlFor="card" className="ml-3 block text-sm font-medium text-gray-700">
                      Credit/Debit Card (Payment will be collected upon order processing)
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-between items-center">
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Back to Cart
              </button>
              <button
                type="submit"
                disabled={orderProcessing}
                className={`px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center ${orderProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {orderProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
