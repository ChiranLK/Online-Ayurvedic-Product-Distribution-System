import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { AuthContext } from '../../context/AuthContext';
import categories from '../../config/categories';

const AddProduct = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext) || { currentUser: null };
  const [isLoading, setIsLoading] = useState(false);
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
  
  // Use predefined categories from config

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
          !formData.category || !formData.stock || !formData.image) {
        throw new Error('Please fill all required fields');
      }

      // Check if user is logged in
      if (!currentUser || !currentUser.role || currentUser.role !== 'seller') {
        throw new Error('You must be logged in as a seller to add products');
      }

      // Create FormData object for image upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('category', formData.category);
      submitData.append('stock', formData.stock);
      submitData.append('image', formData.image);

      // Send the data to the server
      console.log('Sending product data to server...');
      
      const response = await api.post('/api/seller-products/add', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Product added successfully:', response.data);
      setIsLoading(false);
      navigate('/seller/products');
    } catch (err) {
      console.error('Error details:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Something went wrong. Please try again.'
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Product</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
          {error.includes('token') && (
            <p className="mt-2">Please make sure you're logged in as a seller to add products.</p>
          )}
        </div>
      )}
      
      {!currentUser && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-6">
          <p className="font-bold">Warning:</p>
          <p>You must be logged in as a seller to add products.</p>
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
            Product Image *
          </label>
          <div className="mt-1 flex items-center">
            {previewImage && (
              <div className="mr-4">
                <img
                  src={previewImage}
                  alt="Product preview"
                  className="h-32 w-32 object-cover rounded-md"
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
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Upload a clear image of the product. JPG, PNG or GIF. Max 2MB.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
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
            {isLoading ? 'Adding...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
