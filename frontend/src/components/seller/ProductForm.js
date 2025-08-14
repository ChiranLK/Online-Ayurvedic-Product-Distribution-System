import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [categories, setCategories] = useState([
    'Powders', 'Oils', 'Supplements', 'Herbs', 'Tonics', 'Capsules'
  ]);
  const [previewImage, setPreviewImage] = useState(null);
  
  const isEditMode = !!id;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    // In a real application, uncomment to fetch categories
    // fetchCategories();

    if (isEditMode) {
      const fetchProduct = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(`/api/seller/products/${id}`);
          const product = response.data;
          setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            category: product.category,
            stock: product.stock.toString(),
            image: null // Image would be handled separately
          });
          if (product.imageUrl) {
            setPreviewImage(product.imageUrl);
          }
          setIsLoading(false);
        } catch (err) {
          setError('Failed to fetch product');
          setIsLoading(false);
          console.error('Error fetching product:', err);
        }
      };

      // For demonstration, we'll use mock data
      if (id === '1') {
        setFormData({
          name: 'Ashwagandha Powder',
          description: 'Organic Ashwagandha Root Powder',
          price: '450',
          category: 'Powders',
          stock: '28',
          image: null
        });
        setPreviewImage('https://via.placeholder.com/150');
      } else if (id === '2') {
        setFormData({
          name: 'Triphala Churna',
          description: 'Traditional Ayurvedic Formula for Digestive Health',
          price: '350',
          category: 'Powders',
          stock: '15',
          image: null
        });
        setPreviewImage('https://via.placeholder.com/150');
      }
      setIsLoading(false);

      // Uncomment to use real API
      // fetchProduct();
    }
  }, [id, isEditMode]);

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
      if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.stock) {
        throw new Error('Please fill all required fields');
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

      let response;
      if (isEditMode) {
        // Update existing product
        response = await axios.put(`/api/seller/products/${id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Create new product
        response = await axios.post('/api/seller/products', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      // In a real application, we would navigate after successful submission
      // For demo, we'll just simulate success
      console.log('Product saved successfully:', response?.data || 'mocked response');
      setIsLoading(false);
      navigate('/seller/products');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setIsLoading(false);
      console.error('Error saving product:', err);
    }
  };

  if (isLoading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditMode ? 'Edit Product' : 'Add New Product'}
      </h1>

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
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
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
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
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
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
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
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
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
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
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
            Product Image {isEditMode ? '' : '*'}
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
                required={!isEditMode && !previewImage}
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
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
          >
            {isLoading ? 'Saving...' : isEditMode ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
