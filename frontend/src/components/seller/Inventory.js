import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { AuthContext } from '../../context/AuthContext';
import { getFullImageUrl, handleImageError } from '../../utils/imageUtils';

const Inventory = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext) || { currentUser: null };
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [stockUpdates, setStockUpdates] = useState({}); // Store stock updates for all products
  const [updatingInventory, setUpdatingInventory] = useState(false);

  useEffect(() => {
    // Check if user is a seller
    if (!currentUser || currentUser.role !== 'seller') {
      navigate('/login');
      return;
    }

    const fetchProducts = async () => {
      try {
        const response = await api.get('/api/seller-products/my-products');
        
        const productsData = response.data.data || response.data;
        setProducts(productsData);
        
        // Initialize stock updates with current values
        const initialStockValues = {};
        productsData.forEach(product => {
          initialStockValues[product._id] = product.stock.toString();
        });
        setStockUpdates(initialStockValues);
        
        // Extract unique categories
        const uniqueCategoryNames = [...new Set(productsData.map(product => product.categoryName))];
        setCategories(uniqueCategoryNames);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch products. Please make sure you are logged in as a seller.');
        setLoading(false);
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, [currentUser, navigate]);

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  // Handle stock value change for a specific product
  const handleStockChange = (productId, value) => {
    // Only allow positive numbers
    const sanitizedValue = value.replace(/[^0-9]/g, '');
    setStockUpdates(prev => ({
      ...prev,
      [productId]: sanitizedValue
    }));
  };

  // Check if any stock value has been changed
  const hasChanges = () => {
    return products.some(product => 
      stockUpdates[product._id] && 
      parseInt(stockUpdates[product._id]) !== product.stock
    );
  };

  // Filter products based on category
  const filteredProducts = products.filter(product => {
    return categoryFilter === '' || product.categoryName === categoryFilter;
  });

  // Save all stock updates in one go
  const saveAllStockUpdates = async () => {
    setUpdatingInventory(true);
    setError(null);
    setSuccessMessage('');

    try {
      // Create array of update promises
      const updatePromises = products
        .filter(product => {
          const newStock = parseInt(stockUpdates[product._id]);
          return !isNaN(newStock) && newStock !== product.stock;
        })
        .map(product => {
          return api.put(`/api/seller-products/update-stock/${product._id}`, {
            stock: parseInt(stockUpdates[product._id])
          });
        });

      if (updatePromises.length === 0) {
        setSuccessMessage('No changes detected');
        setUpdatingInventory(false);
        return;
      }

      // Execute all updates in parallel
      await Promise.all(updatePromises);

      // Update the products with new stock values
      setProducts(products.map(product => {
        const newStock = parseInt(stockUpdates[product._id]);
        if (!isNaN(newStock) && newStock !== product.stock) {
          return { ...product, stock: newStock };
        }
        return product;
      }));

      setSuccessMessage('Inventory updated successfully!');
    } catch (err) {
      console.error('Error updating inventory:', err);
      setError('Failed to update inventory: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingInventory(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Update Inventory</h1>
          <div className="flex space-x-2">
            <Link
              to="/seller/products"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back to Products
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
            <p>{successMessage}</p>
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Category
          </label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={handleCategoryFilterChange}
            className="w-full md:w-1/3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {filteredProducts.length > 0 ? (
          <>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Stock
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      New Stock
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product._id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img 
                              className="h-10 w-10 rounded-full object-cover" 
                              src={getFullImageUrl(product.imageUrl)} 
                              alt={product.name} 
                              onError={handleImageError}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.description.substring(0, 50)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{product.categoryName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">Rs.{product.price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${product.stock < 10 ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                          {product.stock}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={stockUpdates[product._id] || ''}
                          onChange={(e) => handleStockChange(product._id, e.target.value)}
                          className={`w-20 border rounded px-2 py-1 ${
                            stockUpdates[product._id] && parseInt(stockUpdates[product._id]) !== product.stock 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-300'
                          }`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                onClick={saveAllStockUpdates}
                disabled={updatingInventory || !hasChanges()}
                className={`px-4 py-2 rounded-md text-white ${
                  hasChanges() && !updatingInventory
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {updatingInventory ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </div>
                ) : 'Save All Changes'}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No products found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
