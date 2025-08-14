import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddProduct = () => {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    imageUrl: '',
    sellerId: ''
  });

  // Get list of sellers for dropdown
  useEffect(() => {
    const fetchSellers = async () => {
      try {
        // In real app, fetch from API
        // const response = await axios.get('http://localhost:5000/api/sellers');
        // setSellers(response.data);
        
        // Mock data
        setSellers([
          {
            _id: '101',
            name: 'Herbal Distributors Pvt Ltd'
          },
          {
            _id: '102',
            name: 'Ayurveda Wellness Products'
          },
          {
            _id: '103',
            name: 'Natural Health Solutions'
          },
          {
            _id: '104',
            name: 'Traditional Remedies Inc'
          },
          {
            _id: '105',
            name: 'Green Leaf Herbs'
          }
        ]);
      } catch (error) {
        console.error('Error fetching sellers:', error);
        setError('Failed to load sellers. Please try again later.');
      }
    };
    
    fetchSellers();
  }, []);

  const { name, description, price, category, stock, imageUrl, sellerId } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    // Validation
    if (!name || !description || !price || !category || !stock || !imageUrl || !sellerId) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // For a real app, submit to API
      // const newProduct = {
      //   name,
      //   description,
      //   price: parseFloat(price),
      //   category,
      //   stock: parseInt(stock),
      //   imageUrl,
      //   sellerId
      // };
      
      // await axios.post('http://localhost:5000/api/products', newProduct);
      
      // For demo purposes
      console.log('Adding new product:', { name, description, price, category, stock, imageUrl, sellerId });
      
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        navigate('/products');
      }, 1000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product. Please try again.');
      setLoading(false);
    }
  };

  const categories = [
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
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
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
              <label className="block text-gray-700 font-medium mb-2" htmlFor="imageUrl">
                Image URL
              </label>
              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                value={imageUrl}
                onChange={onChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter image URL"
                required
              />
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
