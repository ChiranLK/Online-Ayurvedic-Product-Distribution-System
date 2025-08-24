import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { useModal } from '../../context/ModalContext';

const ProductList = () => {
  const { openModal } = useModal();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sellerFilter, setSellerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [sellers, setSellers] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/api/products');
        const productsData = response.data.data || [];
        setProducts(productsData);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(productsData
          .filter(product => product.category)
          .map(product => product.category))];
        setCategories(uniqueCategories);
        
        // Extract unique sellers
        const uniqueSellers = [...new Set(productsData
          .filter(product => product.sellerId && product.sellerId.name)
          .map(product => product.sellerId.name))];
        setSellers(uniqueSellers);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch products');
        setLoading(false);
        console.error('Error fetching products:', err);
      }
    };

    // Uncomment to use real API
    // fetchProducts();
    const mockProducts = [
      {
        _id: '2',
        name: 'Triphala Churna',
        description: 'Traditional Ayurvedic Formula for Digestive Health',
        price: 350,
        category: 'Powders',
        stock: 15,
        sellerId: { _id: 's1', name: 'Ayur Herbs' },
        isApproved: true,
        createdAt: '2023-07-15T14:45:00'
      },
      {
        _id: '3',
        name: 'Brahmi Ghrita',
        description: 'Ayurvedic Brain Tonic for Mental Clarity',
        price: 650,
        category: 'Oils',
        stock: 12,
        sellerId: { _id: 's2', name: 'Herbal Life' },
        isApproved: false,
        createdAt: '2023-07-20T09:15:00'
      },
      {
        _id: '4',
        name: 'Chyawanprash',
        description: 'Traditional Herbal Jam for Immunity',
        price: 450,
        category: 'Supplements',
        stock: 22,
        sellerId: { _id: 's2', name: 'Herbal Life' },
        isApproved: true,
        createdAt: '2023-07-25T16:30:00'
      },
      {
        _id: '5',
        name: 'Neem Capsules',
        description: 'Pure Neem Extract for Immunity',
        price: 350,
        category: 'Supplements',
        stock: 35,
        sellerId: { _id: 's3', name: 'Ayurveda Store' },
        isApproved: true,
        createdAt: '2023-07-30T11:20:00'
      }
    ];

    setProducts(mockProducts);
    
    // Extract unique categories from mock products
    const uniqueCategories = [...new Set(mockProducts.map(product => product.category))];
    setCategories(uniqueCategories);
    
    // Extract unique sellers from mock products
    const uniqueSellers = [...new Set(mockProducts.map(product => product.sellerId?.name))];
    setSellers(uniqueSellers);
    
    setLoading(false);
    
    // Uncomment to use real API
    // fetchProducts();
  }, []);

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  const handleSellerFilterChange = (e) => {
    setSellerFilter(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter products based on all filters
  const filteredProducts = products.filter(product => {
    const matchesCategory = categoryFilter === '' || product.category === categoryFilter;
    const matchesSeller = sellerFilter === '' || product.sellerId?.name === sellerFilter;
    const matchesStatus = statusFilter === '' || 
      (statusFilter === 'approved' && product.isApproved) || 
      (statusFilter === 'pending' && !product.isApproved);
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSeller && matchesStatus && matchesSearch;
  });

  const toggleProductApproval = async (productId, isCurrentlyApproved, productName) => {
    try {
      // Call the API to update product approval status
      await api.put(`/api/products/${productId}/approval`, { isApproved: !isCurrentlyApproved });
      
      // Update the local state after successful API call
      setProducts(products.map(product => 
        product._id === productId ? { ...product, isApproved: !isCurrentlyApproved } : product
      ));
      
      // Show success modal
      openModal({
        title: isCurrentlyApproved ? 'Product Unapproved' : 'Product Approved',
        message: `${productName} has been ${isCurrentlyApproved ? 'unapproved' : 'approved'} successfully.`,
        type: 'success',
        confirmText: 'OK'
      });
    } catch (err) {
      console.error('Error updating product approval status:', err);
      
      // Show error modal
      openModal({
        title: 'Action Failed',
        message: err.response?.data?.message || 'Failed to update product approval status.',
        type: 'error',
        confirmText: 'OK'
      });
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    // Show confirmation modal
    openModal({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
      type: 'warning',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          // Call the API to delete the product
          await api.delete(`/api/products/${productId}`);
          
          // Update the local state after successful API call
          setProducts(products.filter(product => product._id !== productId));
          
          // Show success modal
          openModal({
            title: 'Product Deleted',
            message: `${productName} has been deleted successfully.`,
            type: 'success',
            confirmText: 'OK'
          });
        } catch (err) {
          console.error('Error deleting product:', err);
          
          // Show error modal
          openModal({
            title: 'Delete Failed',
            message: err.response?.data?.message || 'Failed to delete product. Please try again.',
            type: 'error',
            confirmText: 'OK'
          });
        }
      }
    });
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
        <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
        {/* Add New Product button removed - Admins can only edit existing products */}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
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

        <div>
          <label htmlFor="seller-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Seller
          </label>
          <select
            id="seller-filter"
            value={sellerFilter}
            onChange={handleSellerFilterChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Sellers</option>
            {sellers.map((seller, index) => (
              <option key={index} value={seller}>{seller}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Approval</option>
          </select>
        </div>

        <div>
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
                Seller
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
                  <div className="text-sm text-gray-500">{product.sellerId.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">Rs.{product.price}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${product.stock < 10 ? 'text-red-600' : 'text-gray-500'}`}>
                    {product.stock}
                  </div>
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
                    <Link to={`/admin/products/${product._id}`} className="text-blue-600 hover:text-blue-900">
                      View
                    </Link>
                    <Link to={`/admin/products/${product._id}/edit`} className="text-green-600 hover:text-green-900">
                      Edit
                    </Link>
                    <button
                      onClick={() => toggleProductApproval(product._id, product.isApproved, product.name)}
                      className={`${
                        product.isApproved ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {product.isApproved ? 'Unapprove' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id, product.name)}
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
          <p className="text-gray-500">No products found matching your filters.</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;
