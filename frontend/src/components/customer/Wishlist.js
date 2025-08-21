import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaHeart, FaTrashAlt, FaShoppingCart } from 'react-icons/fa';
import api from '../../config/api';
import { getFullImageUrl } from '../../utils/imageUtils';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        console.log('Fetching wishlist with token:', token ? 'Token exists' : 'No token');
        
        const response = await api.get('/api/wishlist');

        console.log('Wishlist API response:', response);
        
        if (response.data) {
          setWishlist(response.data.wishlist || []);
        } else {
          setWishlist([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setError(`Failed to load wishlist. ${error.response?.data?.message || error.message}`);
        setLoading(false);
      }
    };

    if (token && currentUser && currentUser.role === 'customer') {
      fetchWishlist();
    } else {
      setLoading(false);
      setError('Please login as a customer to view your wishlist.');
    }
  }, [token, currentUser]);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      const response = await api.delete(`/api/wishlist/${productId}`);

      if (response.status === 200) {
        // Update the wishlist state
        setWishlist(wishlist.filter(item => item._id !== productId));
      } else {
        throw new Error('Failed to remove item from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setError(`Failed to remove item. ${error.response?.data?.message || error.message}`);
    }
  };

  const handleClearWishlist = async () => {
    if (!window.confirm('Are you sure you want to clear your entire wishlist?')) {
      return;
    }

    try {
      const response = await api.delete('/api/wishlist');

      if (response.status === 200) {
        // Update the wishlist state
        setWishlist([]);
      } else {
        throw new Error('Failed to clear wishlist');
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      setError(`Failed to clear wishlist. ${error.response?.data?.message || error.message}`);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      const response = await api.post('/api/cart', { 
        productId, 
        quantity: 1 
      });

      if (response.status !== 200 && response.status !== 201) {
        throw new Error('Failed to add item to cart');
      }

      // Show success message
      alert('Product added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Failed to add item to cart. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        <div className="ml-3 text-lg">Loading wishlist...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={() => window.location.reload()} 
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
          >
            Try Again
          </button>
          <Link to="/customer" className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Wishlist</h1>
        <div>
          <button
            onClick={handleClearWishlist}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded flex items-center"
            disabled={wishlist.length === 0}
          >
            <FaTrashAlt className="mr-2" />
            Clear Wishlist
          </button>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <div className="text-5xl text-gray-300 mb-4 flex justify-center">
            <FaHeart />
          </div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Add items to your wishlist to save them for later</p>
          <Link to="/products" className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={getFullImageUrl(product.imageUrl)} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'}
                />
                <button
                  onClick={() => handleRemoveFromWishlist(product._id)}
                  className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-red-100 transition"
                >
                  <FaHeart className="text-red-500" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-green-600 font-bold">LKR {product.price}</span>
                  {product.discount > 0 && (
                    <span className="text-sm text-gray-500 line-through">LKR {(product.price / (1 - product.discount / 100)).toFixed(2)}</span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Link to={`/products/${product._id}`} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-3 rounded text-sm text-center">
                    View Details
                  </Link>
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm"
                  >
                    <FaShoppingCart className="mr-1" /> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link to="/customer" className="text-green-600 hover:underline flex items-center">
          &larr; Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Wishlist;
