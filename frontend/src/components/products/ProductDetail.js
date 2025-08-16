import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { addToCart } from '../../utils/cartUtils';
import { getFullImageUrl, handleImageError } from '../../utils/imageUtils';
import { AuthContext } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';

const ProductDetail = () => {
  const { currentUser, token } = useContext(AuthContext);
  const isAuthenticated = !!token;
  const isAdmin = currentUser && currentUser.role === 'admin';
  const isSeller = currentUser && currentUser.role === 'seller';
  const { openModal } = useModal();
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        // Fetch product data from API
        const productResponse = await api.get(`/api/products/${id}`);
        
        // Get the product data - handle different response structures
        const productData = productResponse.data.data || productResponse.data;
        
        if (!productData) {
          throw new Error('Product data not found');
        }
        
        setProduct(productData);
        
        // Fetch seller data if the product has a sellerId
        if (productData.sellerId) {
          try {
            const sellerResponse = await api.get(`/api/sellers/${productData.sellerId}`);
            setSeller(sellerResponse.data.data || sellerResponse.data);
          } catch (sellerError) {
            console.error('Error fetching seller details:', sellerError);
            // We can still show the product even if seller info fails to load
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product details:', error);
        setError('Failed to fetch product details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [id]);

  const handleAddToCart = () => {
    // Add to cart using cart utility function
    const updatedCart = addToCart(product._id, quantity);
    console.log('Added to cart:', updatedCart);
    
    // Show custom notification modal instead of browser alert
    openModal({
      title: 'Added to Cart',
      message: `${quantity} ${product.name} ${quantity > 1 ? 'have' : 'has'} been added to your cart!`,
      confirmText: 'View Cart',
      cancelText: 'Continue Shopping',
      type: 'success',
      onConfirm: () => navigate('/cart')
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-700 border-opacity-50 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
        <p>{error}</p>
        <button 
          className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          onClick={() => navigate('/products')}
        >
          Back to Products
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
        <p className="text-gray-600 mb-6">The product you're looking for does not exist or has been removed.</p>
        <Link 
          to="/products" 
          className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link 
          to="/products" 
          className="text-green-700 hover:text-green-800 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Products
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image */}
          <div className="p-6">
            <img 
              src={getFullImageUrl(product.imageUrl)} 
              alt={product.name} 
              className="w-full h-96 object-cover rounded-lg"
              onError={(e) => {
                console.log('Product detail image failed to load:', e.target.src);
                handleImageError(e);
              }}
            />
          </div>
          
          {/* Product Details */}
          <div className="p-6">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
              <span className="bg-green-100 text-green-800 text-sm py-1 px-3 rounded-full">
                {product.category}
              </span>
            </div>
            
            <div className="mt-6">
              <p className="text-2xl font-bold text-green-700">Rs. {product.price.toFixed(2)}</p>
              <p className={`mt-2 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </p>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
            
            {product.stock > 0 && (
              <div className="mt-8">
                <div className="flex items-center mb-4">
                  <label className="mr-4 font-medium text-gray-700">Quantity:</label>
                  <div className="flex items-center border rounded">
                    <button 
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </button>
                    <span className="px-4 py-1">{quantity}</span>
                    <button 
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <button
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg flex items-center justify-center"
                  onClick={handleAddToCart}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  Add to Cart
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Seller Information */}
        {seller && (
          <div className="p-6 border-t">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Seller Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-800">{seller.name}</p>
              <p className="text-gray-600 mt-2">
                <span className="font-medium">Contact:</span> {seller.phone}
              </p>
              <p className="text-gray-600 mt-1">
                <span className="font-medium">Email:</span> {seller.email}
              </p>
              <p className="text-gray-600 mt-1">
                <span className="font-medium">Address:</span> {seller.address}
              </p>
            </div>
          </div>
        )}
        
        {/* Admin/Seller Actions */}
        {(isAdmin || isSeller) && (
          <div className="p-6 border-t bg-gray-50 flex justify-end space-x-4">
            <Link 
              to={`/products/edit/${product._id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Edit Product
            </Link>
            <button 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete this product?')) {
                  // In a real app, delete via API
                  try {
                    await api.delete(`/api/products/${product._id}`);
                    navigate('/products');
                  } catch (error) {
                    console.error('Error deleting product:', error);
                    alert('Failed to delete product. Please try again.');
                  }
                }
              }}
            >
              Delete Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
