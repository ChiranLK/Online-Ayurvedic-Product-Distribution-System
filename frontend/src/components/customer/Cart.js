import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Cart = () => {
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    shipping: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        // Fetch cart data from API
        const response = await axios.get('/api/customer/cart');
        
        if (response.data && response.data.items) {
          setCart(response.data);
        } else {
          // Initialize with empty cart if API doesn't return expected data
          setCart({
            items: [],
            subtotal: 0,
            shipping: 0,
            total: 0
          });
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch cart');
        setLoading(false);
        console.error('Error fetching cart:', err);
      }
    };
    
    fetchCart();
  }, []);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      // Make API call to update quantity
      await axios.put(`/api/customer/cart/${itemId}`, { quantity: newQuantity });
      
      // Update local state after successful API call
      const updatedItems = cart.items.map(item => {
        if (item._id === itemId) {
          const updatedItem = {
            ...item,
            quantity: newQuantity,
            total: item.price * newQuantity
          };
          return updatedItem;
        }
        return item;
      });

      const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
      const shipping = subtotal > 1500 ? 0 : 150; // Free shipping over Rs.1500
      const total = subtotal + shipping;

      setCart({
        items: updatedItems,
        subtotal,
        shipping,
        total
      });
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const removeItem = async (itemId) => {
    try {
      // Make API call to remove item
      await axios.delete(`/api/customer/cart/${itemId}`);

      // Update local state after successful API call
      const updatedItems = cart.items.filter(item => item._id !== itemId);
      
      const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
      const shipping = subtotal > 1500 ? 0 : 150; // Free shipping over Rs.1500
      const total = subtotal + shipping;

      setCart({
        items: updatedItems,
        subtotal,
        shipping,
        total
      });
    } catch (err) {
      console.error('Error removing item:', err);
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Shopping Cart</h1>

      {cart.items.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start adding items to your cart to continue shopping.
          </p>
          <div className="mt-6">
            <Link
              to="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Browse Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <li key={item._id} className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-24 sm:h-24 flex-shrink-0 mb-4 sm:mb-0">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 sm:ml-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-800">{item.product.name}</h3>
                            <p className="mt-1 text-sm text-gray-500">{item.product.description.substring(0, 100)}</p>
                            <p className="mt-1 text-sm font-medium text-gray-800">Rs.{item.price}</p>
                          </div>
                          <div className="mt-4 sm:mt-0">
                            <div className="flex items-center justify-between sm:justify-end">
                              <div className="flex items-center border border-gray-300 rounded">
                                <button
                                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                >
                                  -
                                </button>
                                <span className="px-3 py-1 text-gray-800">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => removeItem(item._id)}
                                className="ml-4 text-red-500 hover:text-red-700"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                            <p className="mt-2 text-right text-sm font-semibold text-gray-800">Rs.{item.total}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-200 pb-4">
                  <p className="text-gray-600">Subtotal</p>
                  <p className="font-medium text-gray-800">Rs.{cart.subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-4">
                  <p className="text-gray-600">Shipping</p>
                  <p className="font-medium text-gray-800">
                    {cart.shipping > 0 ? `Rs.${cart.shipping.toFixed(2)}` : 'Free'}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-800 font-medium">Total</p>
                  <p className="text-green-600 font-bold">Rs.{cart.total.toFixed(2)}</p>
                </div>
                
                {cart.subtotal < 1500 && (
                  <div className="bg-blue-50 text-blue-700 p-3 rounded-md text-sm mt-4">
                    Add Rs.{(1500 - cart.subtotal).toFixed(2)} more to get free shipping!
                  </div>
                )}

                <div className="pt-4">
                  <Link
                    to="/customer/checkout"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md text-center block"
                  >
                    Proceed to Checkout
                  </Link>
                  <Link
                    to="/products"
                    className="w-full border border-green-600 text-green-600 hover:bg-green-50 font-medium py-3 px-4 rounded-md text-center block mt-2"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
