import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { AuthContext } from '../../context/AuthContext';
import { getFullImageUrl, handleImageError } from '../../utils/imageUtils';

const ProductList = () => {
  const context = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [editingStock, setEditingStock] = useState(null); // Product ID currently being edited
  const [stockValue, setStockValue] = useState(''); // New stock value
  const [updatingStock, setUpdatingStock] = useState(false); // Loading state for stock update

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/api/seller-products/my-products');
        
        const productsData = response.data.data || response.data;
        setProducts(productsData);
        
        // Extract unique categories from products
        const uniqueCategories = [...new Set(productsData.map(product => product.category))];
        setCategories(uniqueCategories);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch products. Please make sure you are logged in as a seller.');
        setLoading(false);
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, []);

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter products based on category and search term
  const filteredProducts = products.filter(product => {
    const matchesCategory = categoryFilter === '' || product.category === categoryFilter;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // Call API to delete product
        await api.delete(`/api/seller-products/delete/${productId}`);
        
        // Update the UI by filtering out the deleted product
        setProducts(products.filter(product => product._id !== productId));
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product: ' + (err.response?.data?.message || err.message));
      }
    }
  };
  
  // Begin editing stock for a product
  const startEditStock = (productId, currentStock) => {
    setEditingStock(productId);
    setStockValue(currentStock.toString());
  };
  
  // Cancel editing stock
  const cancelEditStock = () => {
    setEditingStock(null);
    setStockValue('');
  };
  
  // Update stock value
  const handleStockChange = (e) => {
    // Only allow positive numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setStockValue(value);
  };
  
  // Save updated stock value
  const saveStockUpdate = async (productId) => {
    // Validate input
    const newStock = parseInt(stockValue);
    if (isNaN(newStock) || newStock < 0) {
      alert('Please enter a valid positive number for stock');
      return;
    }
    
    setUpdatingStock(true);
    try {
      // Call API to update stock
      await api.put(`/api/seller-products/update-stock/${productId}`, {
        stock: newStock
      });
      
      // Update the products array with the new stock value
      setProducts(products.map(product => 
        product._id === productId ? {...product, stock: newStock} : product
      ));
      
      // Reset editing state
      setEditingStock(null);
      setStockValue('');
    } catch (err) {
      console.error('Error updating stock:', err);
      alert('Failed to update stock: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingStock(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Products</h1>
        <div className="flex space-x-2">
          <Link
            to="/seller/inventory"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
            Update Inventory
          </Link>
          <Link
            to="/seller/products/add"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add New Product
          </Link>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/4">
          <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Category
          </label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={handleCategoryFilterChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-3/4">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Products
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by name or description"
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
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
                Stock
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
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
                        onError={(e) => {
                          console.log('Seller product list image failed to load:', e.target.src);
                          handleImageError(e);
                        }}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.description.substring(0, 50)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{product.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">Rs.{product.price}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingStock === product._id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={stockValue}
                        onChange={handleStockChange}
                        className="w-16 border border-gray-300 rounded px-2 py-1"
                        autoFocus
                      />
                      <button
                        onClick={() => saveStockUpdate(product._id)}
                        disabled={updatingStock}
                        className="text-green-600 hover:text-green-900"
                      >
                        {updatingStock ? 
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          : '✓'
                        }
                      </button>
                      <button
                        onClick={cancelEditStock}
                        className="text-red-600 hover:text-red-900"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className={`text-sm ${product.stock < 10 ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                        {product.stock}
                      </div>
                      <button
                        onClick={() => startEditStock(product._id, product.stock)}
                        className="ml-2 text-blue-600 hover:text-blue-900 text-sm"
                        title="Update Stock"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    product.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {product.isApproved ? 'Approved' : 'Pending Review'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link to={`/seller/products/${product._id}`} className="text-blue-600 hover:text-blue-900">
                      View
                    </Link>
                    <Link to={`/seller/products/edit/${product._id}`} className="text-green-600 hover:text-green-900">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-4">
          <p className="text-gray-500">No products found.</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;
