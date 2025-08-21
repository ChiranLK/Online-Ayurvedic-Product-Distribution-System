import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaShoppingCart } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { addToCart } from '../../utils/cartUtils';
import { getFullImageUrl } from '../../utils/imageUtils';
import api from '../../config/api';

const ProductCard = ({ product }) => {
  const { token, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { openModal } = useModal();
  const isAuthenticated = !!token;
  const isCustomer = currentUser && currentUser.role === 'customer';
  
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  useEffect(() => {
    // Check if product is in wishlist
    const checkWishlist = async () => {
      if (isAuthenticated && isCustomer) {
        try {
          const response = await api.get('/api/wishlist');
          
          if (response.status === 200) {
            const data = response.data;
            const wishlistItems = data.wishlist || [];
            const inWishlist = wishlistItems.some(item => item._id === product._id);
            setIsInWishlist(inWishlist);
          }
        } catch (error) {
          console.error('Error checking wishlist:', error);
        }
      }
    };
    
    if (token && currentUser && currentUser.role === 'customer') {
      checkWishlist();
    }
  }, [product._id, isAuthenticated, isCustomer, token, currentUser]);
  
  const handleToggleWishlist = async (e) => {
    e.preventDefault(); // Prevent navigating to product detail
    
    if (!isAuthenticated) {
      // Prompt user to login
      openModal({
        title: 'Login Required',
        message: 'Please login to add items to your wishlist',
        confirmText: 'Login',
        cancelText: 'Cancel',
        type: 'info',
        onConfirm: () => navigate('/login')
      });
      return;
    }
    
    if (!isCustomer) {
      openModal({
        title: 'Customer Account Required',
        message: 'Only customers can add items to their wishlist',
        confirmText: 'OK',
        type: 'info'
      });
      return;
    }
    
    setWishlistLoading(true);
    
    try {
      if (isInWishlist) {
        // Remove from wishlist
        const response = await api.delete(`/api/wishlist/${product._id}`);
        
        if (response.status === 200) {
          setIsInWishlist(false);
          openModal({
            title: 'Removed from Wishlist',
            message: `${product.name} has been removed from your wishlist`,
            confirmText: 'OK',
            type: 'success'
          });
        } else {
          throw new Error('Failed to remove from wishlist');
        }
      } else {
        // Add to wishlist
        const response = await api.post(`/api/wishlist/${product._id}`);
        
        if (response.status === 200 || response.status === 201) {
          setIsInWishlist(true);
          openModal({
            title: 'Added to Wishlist',
            message: `${product.name} has been added to your wishlist`,
            confirmText: 'View Wishlist',
            cancelText: 'Continue Shopping',
            type: 'success',
            onConfirm: () => navigate('/customer/wishlist')
          });
        } else {
          throw new Error('Failed to add to wishlist');
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      openModal({
        title: 'Error',
        message: 'Failed to update wishlist. Please try again.',
        confirmText: 'OK',
        type: 'error'
      });
    }
    
    setWishlistLoading(false);
  };
  
  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent navigating to product detail
    
    // Add to cart using cart utility function
    addToCart(product._id, 1);
    
    // Show notification
    openModal({
      title: 'Added to Cart',
      message: `${product.name} has been added to your cart!`,
      confirmText: 'View Cart',
      cancelText: 'Continue Shopping',
      type: 'success',
      onConfirm: () => navigate('/customer/cart')
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/products/${product._id}`} className="block relative">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={getFullImageUrl(product.imageUrl)} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'}
          />
          
          {isAuthenticated && isCustomer && (
            <button
              onClick={handleToggleWishlist}
              className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-colors ${
                wishlistLoading ? 'bg-gray-200' : isInWishlist ? 'bg-red-50 hover:bg-red-100' : 'bg-white hover:bg-gray-100'
              }`}
            >
              {wishlistLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-red-500 border-opacity-50"></div>
              ) : isInWishlist ? (
                <FaHeart className="text-red-500 text-lg" />
              ) : (
                <FaRegHeart className="text-gray-500 text-lg" />
              )}
            </button>
          )}
          
          {product.discount > 0 && (
            <div className="absolute top-0 left-0 bg-red-500 text-white px-2 py-1 text-xs font-semibold">
              {product.discount}% OFF
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/products/${product._id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-green-600 transition">{product.name}</h3>
        </Link>
        
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-green-600 font-bold">LKR {product.price.toFixed(2)}</span>
            {product.discount > 0 && (
              <span className="text-sm text-gray-500 line-through ml-2">
                LKR {(product.price / (1 - product.discount / 100)).toFixed(2)}
              </span>
            )}
          </div>
          <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>
        
        <div className="flex space-x-2">
          <Link 
            to={`/products/${product._id}`}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-3 rounded text-sm text-center"
          >
            View Details
          </Link>
          {product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm flex items-center justify-center"
              disabled={product.stock <= 0}
            >
              <FaShoppingCart className="mr-1" />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
