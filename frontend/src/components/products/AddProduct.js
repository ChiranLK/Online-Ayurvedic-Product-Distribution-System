import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../config/api';

const AddProduct = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    categoryName: '',
    stock: '',
    imageUrl: '',
    sellerId: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  // Get list of sellers and categories for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch approved sellers
        const sellersResponse = await api.get('/api/sellers?status=approved');
        console.log('Sellers response:', sellersResponse);
        setSellers(sellersResponse.data?.data || []);
        
        // Fetch categories
        const categoriesResponse = await api.get('/api/categories');
        console.log('Categories response:', categoriesResponse);
        setCategories(categoriesResponse.data?.data || []);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load sellers or categories. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const { name, description, price, category, categoryName, stock, imageUrl, sellerId } = formData;

  const onChange = e => {
    if (e.target.name === 'category') {
      // When category is selected, also set the categoryName
      const selectedCategory = categories.find(cat => cat._id === e.target.value);
      setFormData({ 
        ...formData, 
        category: e.target.value,
        categoryName: selectedCategory ? selectedCategory.name : ''
      });
    } else if (e.target.name === 'image' && e.target.files) {
      // Handle file selection
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create a temporary URL for preview
      const imageUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        imageUrl: imageUrl
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    // Validation
    if (!name || !description || !price || !category || !stock || !sellerId) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Either an image file or image URL must be provided
    if (!selectedFile && !imageUrl) {
      setError('Please provide either an image file or image URL');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Create the product data - using FormData for file uploads
      const formDataToSend = new FormData();
      formDataToSend.append('name', name);
      formDataToSend.append('description', description);
      formDataToSend.append('price', parseFloat(price));
      formDataToSend.append('category', category);
      formDataToSend.append('categoryName', categoryName);
      formDataToSend.append('stock', parseInt(stock));
      
      // If we have a selected file, append it, otherwise use the imageUrl
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      } else {
        formDataToSend.append('imageUrl', imageUrl);
      }
      
      formDataToSend.append('sellerId', sellerId);
      
      console.log('Submitting product data:', {
        name,
        description,
        price: parseFloat(price),
        category,
        categoryName,
        stock: parseInt(stock),
        imageUrl,
        sellerId
      });
      
      // Send the request with the auth token automatically included via api instance
      const response = await api.post('/api/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Product added successfully:', response.data);
      setLoading(false);
      
      // Show success message
      alert('Product added successfully!');
      
      // Navigate back to products page
      navigate('/products');
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err.response?.data?.message || 'Failed to add product. Please try again.');
      setLoading(false);
    }
  };

  // Predefined category options in case API call fails
  const categoryOptions = [
    'Hair Care',
    'Skin Care',
    'Digestive Health',
    'Immunity Boosters',
    'Oral Care',
    'Sleep & Relaxation',
    'Joint & Muscle Care',
    'Women\'s Health',
    'Men\'s Health',
    'Weight Management'
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-green-800 mb-8">Add New Product</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* Debug info */}
      {(categories.length === 0 || sellers.length === 0) && !loading && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-6">
          <p className="font-bold">Debug Information:</p>
          <p>Categories loaded: {categories.length}</p>
          <p>Sellers loaded: {sellers.length}</p>
          <p>Please check the browser console for more details.</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <form onSubmit={onSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                Product Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={onChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter product name"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={category}
                onChange={onChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select a category</option>
                {categories && categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))
                ) : loading ? (
                  <option value="" disabled>Loading categories...</option>
                ) : (
                  categoryOptions.map((cat, index) => (
                    <option key={index} value={cat}>{cat}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="price">
                Price (Rs.)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                id="price"
                name="price"
                value={price}
                onChange={onChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter price"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="stock">
                Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                id="stock"
                name="stock"
                value={stock}
                onChange={onChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter stock quantity"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="image">
                Product Image
              </label>
              <div className="flex flex-col space-y-2">
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={onChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-sm text-gray-500">Or enter image URL:</p>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={imageUrl}
                  onChange={onChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter image URL"
                />
                {imageUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">Preview:</p>
                    <img 
                      src={imageUrl} 
                      alt="Product preview" 
                      className="w-32 h-32 object-cover border rounded-md" 
                      onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found'}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="sellerId">
                Seller
              </label>
              <select
                id="sellerId"
                name="sellerId"
                value={sellerId}
                onChange={onChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select a seller</option>
                {sellers.map((seller) => (
                  <option key={seller._id} value={seller._id}>
                    {seller.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={onChange}
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter product description"
                required
              ></textarea>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg mr-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded-lg"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                  <span>Adding...</span>
                </div>
              ) : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
