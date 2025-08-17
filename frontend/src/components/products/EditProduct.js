import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { useModal } from '../../context/ModalContext';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openModal } = useModal();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => {
    const fetchProductAndSellers = async () => {
      try {
        // Fetch product data from API
        const productResponse = await api.get(`/api/products/${id}`);
        const sellersResponse = await api.get('/api/sellers');
        
        // Get the product data
        const productData = productResponse.data.data || productResponse.data;
        
        setFormData({
          name: productData.name,
          description: productData.description,
          price: productData.price.toString(),
          category: productData.category,
          stock: productData.stock.toString(),
          imageUrl: productData.imageUrl,
          sellerId: productData.sellerId
        });
        
        // Get sellers data
        const sellersData = sellersResponse.data.data || sellersResponse.data;
        setSellers(sellersData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product or sellers:', error);
        setError('Failed to load product details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProductAndSellers();
  }, [id]);

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
    
    setSubmitting(true);
    setError('');

    try {
      // Prepare product data for update
      const updatedProduct = {
        name,
        description,
        price: parseFloat(price),
        category,
        stock: parseInt(stock),
        imageUrl,
        sellerId
      };
      
      // Submit to API
      await api.put(`/api/products/${id}`, updatedProduct);
      
      setSubmitting(false);
      
      // Show success modal
      openModal({
        title: 'Product Updated',
        message: `${name} has been successfully updated.`,
        type: 'success',
        confirmText: 'OK',
        onConfirm: () => navigate(`/admin/products/${id}`)
      });
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product. Please try again.');
      setSubmitting(false);
      
      // Show error modal
      openModal({
        title: 'Update Failed',
        message: err.response?.data?.message || 'Failed to update product. Please try again.',
        type: 'error',
        confirmText: 'OK'
      });
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-700 border-opacity-50 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading product details...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-green-800 mb-8">Edit Product</h1>

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

          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => {
                openModal({
                  title: 'Delete Product',
                  message: 'Are you sure you want to delete this product? This action cannot be undone.',
                  type: 'warning',
                  confirmText: 'Delete',
                  cancelText: 'Cancel',
                  onConfirm: async () => {
                    try {
                      await api.delete(`/api/products/${id}`);
                      
                      openModal({
                        title: 'Product Deleted',
                        message: 'The product has been successfully deleted.',
                        type: 'success',
                        confirmText: 'OK',
                        onConfirm: () => navigate('/admin/products')
                      });
                    } catch (err) {
                      openModal({
                        title: 'Delete Failed',
                        message: err.response?.data?.message || 'Failed to delete product. Please try again.',
                        type: 'error',
                        confirmText: 'OK'
                      });
                    }
                  }
                });
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
            >
              Delete
            </button>

            <div>
              <button
                type="button"
                onClick={() => navigate(`/products/${id}`)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg mr-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded-lg"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                    <span>Updating...</span>
                  </div>
                ) : 'Update Product'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
