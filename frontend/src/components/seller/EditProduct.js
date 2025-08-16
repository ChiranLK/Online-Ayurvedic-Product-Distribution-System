import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import categories from '../../config/categories';
import { useModal } from '../../context/ModalContext';
import { AuthContext } from '../../context/AuthContext';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openModal } = useModal();
  const { currentUser } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: null
  });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    // Check if user is a seller
    if (!currentUser || currentUser.role !== 'seller') {
      openModal({
        title: 'Access Denied',
        message: 'Only sellers can edit products',
        confirmText: 'OK',
        type: 'error',
        onConfirm: () => navigate('/unauthorized')
      });
      return;
    }

    const fetchProduct = async () => {
      setFetchLoading(true);
      try {
        const response = await api.get(`/api/seller-products/product/${id}`);
        
        const product = response.data.data || response.data;
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          category: product.category,
          stock: product.stock.toString(),
          image: null
        });
        
        if (product.imageUrl) {
          setPreviewImage(product.imageUrl);
        }
        
      } catch (err) {
        setError('Failed to fetch product details');
        console.error('Error fetching product:', err);
        
        // Show error modal
        openModal({
          title: 'Error',
          message: 'Failed to fetch product details. Please try again.',
          confirmText: 'OK',
          type: 'error',
          onConfirm: () => navigate('/seller/products')
        });
      } finally {
        setFetchLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate, openModal, currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image must be less than 2MB');
        return;
      }
      
      setFormData(prevState => ({
        ...prevState,
        image: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate form
      if (!formData.name || !formData.description || !formData.price || 
          !formData.category || !formData.stock) {
        throw new Error('Please fill all required fields');
      }

      // Price validation
      if (parseFloat(formData.price) <= 0) {
        throw new Error('Price must be greater than zero');
      }

      // Stock validation
      if (parseInt(formData.stock) < 0) {
        throw new Error('Stock cannot be negative');
      }

      // Create FormData object for image upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('category', formData.category);
      submitData.append('stock', formData.stock);
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      // Send the data to the server
      const response = await api.put(`/api/seller-products/edit/${id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Product updated successfully:', response.data);
      setIsLoading(false);
      
      // Show success modal
      openModal({
        title: 'Success',
        message: 'Product has been updated successfully',
        confirmText: 'OK',
        type: 'success',
        onConfirm: () => navigate('/seller/products')
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.');
      setIsLoading(false);
      console.error('Error updating product:', err);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Product</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price (Rs.) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity *
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
            Product Image {previewImage ? '(Leave empty to keep current image)' : '*'}
          </label>
          <div className="mt-1 flex items-center">
            {previewImage && (
              <div className="mr-4">
                <img
                  src={previewImage.startsWith('blob:') ? previewImage : `http://localhost:5000${previewImage}`}
                  alt="Product preview"
                  className="h-32 w-32 object-cover rounded-md"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                  }}
                />
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                className="w-full border border-gray-300 rounded-md p-2"
                required={!previewImage}
              />
              <p className="mt-1 text-sm text-gray-500">
                Upload a clear image of the product. JPG, PNG or GIF. Max 2MB.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between space-x-3">
          <button
            type="button"
            onClick={() => {
              openModal({
                title: 'Confirm Delete',
                message: 'Are you sure you want to delete this product? This action cannot be undone.',
                confirmText: 'Delete',
                cancelText: 'Cancel',
                type: 'warning',
                onConfirm: async () => {
                  try {
                    await api.delete(`/api/seller-products/delete/${id}`);
                    openModal({
                      title: 'Success',
                      message: 'Product has been deleted successfully',
                      confirmText: 'OK',
                      type: 'success',
                      onConfirm: () => navigate('/seller/products')
                    });
                  } catch (err) {
                    openModal({
                      title: 'Error',
                      message: err.response?.data?.message || 'Failed to delete product',
                      confirmText: 'OK',
                      type: 'error'
                    });
                  }
                }
              });
            }}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Delete Product
          </button>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => navigate('/seller/products')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                'Update Product'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
