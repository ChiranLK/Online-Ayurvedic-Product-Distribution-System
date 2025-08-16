import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { getFullImageUrl, handleImageError } from '../../utils/imageUtils';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      // Get cart from local storage
      const cart = JSON.parse(localStorage.getItem('ayurvedicCart')) || [];
      console.log('Cart from localStorage:', cart);
      
      if (cart.length === 0) {
        console.log('Cart is empty');
        setCartItems([]);
        setLoading(false);
        return;
      }

      // Get product details for each cart item
      const productIds = cart.map(item => item.productId);
      const productDetailsPromises = productIds.map(id => 
        api.get(`/api/products/${id}`)
          .catch(err => {
            console.error(`Error fetching product with ID ${id}:`, err);
            return { data: null }; // Return null data for products that can't be fetched
          })
      );
      
      const responses = await Promise.all(productDetailsPromises);
      console.log('API responses:', responses);
      
      const products = responses.map(response => {
          if (response && response.data && response.data.data) {
            console.log('Response has nested data structure:', response.data);
            return response.data.data; // Handle nested data structure
          } else if (response && response.data) {
            console.log('Response has direct data structure:', response.data);
            return response.data; // Handle direct data structure
          }
          return null;
        }).filter(product => product !== null);

        console.log('Products fetched:', products);      // Combine cart quantities with product details
      const itemsWithDetails = cart.map(cartItem => {
        const product = products.find(p => p && p._id === cartItem.productId);
        if (!product) {
          console.log('Product not found for ID:', cartItem.productId);
          return null; // Skip this item if product not found
        }
        
        // Log the product data to see the image URL structure
        console.log('Product data:', product);
        console.log('Image URL:', product.imageUrl);
        const fullImageUrl = getFullImageUrl(product.imageUrl);
        console.log('Full image URL:', fullImageUrl);
        
        return {
          ...product,
          imageUrl: product.imageUrl, // Ensure we have the imageUrl
          fullImageUrl: fullImageUrl, // Store the full URL for direct access
          quantity: cartItem.quantity
        };
      }).filter(item => item !== null); // Remove null items
      
      console.log('Items with details:', itemsWithDetails);      setCartItems(itemsWithDetails);
      
      // Calculate total price
      const total = itemsWithDetails.reduce(
        (sum, item) => sum + (item.price * item.quantity), 0
      );
      setTotalPrice(total);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setError('Failed to load cart. Please try again.');
      setLoading(false);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Update local storage
    const cart = JSON.parse(localStorage.getItem('ayurvedicCart')) || [];
    const updatedCart = cart.map(item => 
      item.productId === productId 
        ? { ...item, quantity: newQuantity } 
        : item
    );
    
    localStorage.setItem('ayurvedicCart', JSON.stringify(updatedCart));
    
    // Update state
    const updatedCartItems = cartItems.map(item => 
      item._id === productId 
        ? { ...item, quantity: newQuantity } 
        : item
    );
    
    setCartItems(updatedCartItems);
    
    // Recalculate total
    const total = updatedCartItems.reduce(
      (sum, item) => sum + (item.price * item.quantity), 0
    );
    setTotalPrice(total);
  };

  const removeItem = (productId) => {
    // Update local storage
    const cart = JSON.parse(localStorage.getItem('ayurvedicCart')) || [];
    const updatedCart = cart.filter(item => item.productId !== productId);
    localStorage.setItem('ayurvedicCart', JSON.stringify(updatedCart));
    
    // Update state
    const updatedCartItems = cartItems.filter(item => item._id !== productId);
    setCartItems(updatedCartItems);
    
    // Recalculate total
    const total = updatedCartItems.reduce(
      (sum, item) => sum + (item.price * item.quantity), 0
    );
    setTotalPrice(total);
  };

  const clearCart = () => {
    localStorage.removeItem('ayurvedicCart');
    setCartItems([]);
    setTotalPrice(0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }
    
    // Navigate to checkout page
    navigate('/checkout', { state: { cartItems, totalPrice } });
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
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-100 p-4 rounded-md text-red-800 mb-4">
          {error}
        </div>
        <button 
          onClick={() => navigate('/products')}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Browse Products
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Cart</h2>
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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Cart</h2>
      
      <div className="bg-white shadow-md rounded-md overflow-hidden mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cartItems.map((item) => (
              <tr key={item._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-16 w-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                      {item.imageUrl ? (
                        <img 
                          className="h-full w-full object-cover" 
                          src={item.fullImageUrl || getFullImageUrl(item.imageUrl)} 
                          alt={item.name}
                          onError={(e) => {
                            console.log('Image failed to load:', e.target.src);
                            handleImageError(e);
                          }}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-400">
                          <span className="text-xs">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.category}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${(item.price || 0).toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="bg-gray-200 px-2 py-1 rounded-md"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="text-sm text-gray-900">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="bg-gray-200 px-2 py-1 rounded-md"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${((item.price || 0) * item.quantity).toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => removeItem(item._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-gray-100 p-6 rounded-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">Subtotal:</span>
          <span className="text-lg">${(totalPrice || 0).toFixed(2)}</span>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Shipping and taxes calculated at checkout
        </p>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <button 
            onClick={handleCheckout}
            className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Proceed to Checkout
          </button>
          <button 
            onClick={() => navigate('/products')}
            className="w-full sm:w-auto px-6 py-3 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Continue Shopping
          </button>
          <button 
            onClick={clearCart}
            className="w-full sm:w-auto px-6 py-3 border border-gray-300 bg-white text-red-600 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
