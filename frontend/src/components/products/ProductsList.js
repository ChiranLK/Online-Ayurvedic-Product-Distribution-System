import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../config/api';
import { AuthContext } from '../../context/AuthContext';
import ProductCard from './ProductCard';

const ProductsList = () => {
  const { currentUser } = useContext(AuthContext);
  const isAdmin = currentUser && currentUser.role === 'admin';
  const isSeller = currentUser && currentUser.role === 'seller';
  const location = useLocation();
  const queryParams = React.useMemo(() => {
    return new URLSearchParams(location.search);
  }, [location.search]);
  const categoryFromUrl = queryParams.get('category');
  const searchFromUrl = queryParams.get('search');
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(searchFromUrl || '');
  const [categoryFilter, setCategoryFilter] = useState(categoryFromUrl || '');
  const [priceSort, setPriceSort] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch from API
        const response = await api.get('/api/products');
        if (response.data && response.data.data) {
          setProducts(response.data.data);
        } else {
          setProducts([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to fetch products. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Update category filter and search term when URL changes
  useEffect(() => {
    const category = queryParams.get('category');
    const search = queryParams.get('search');
    setCategoryFilter(category || '');
    setSearchTerm(search || '');
  }, [location.search, queryParams]);

  // Fetch categories dynamically from the API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories');
        if (response.data && response.data.data) {
          // Extract category names from the response
          const categoryNames = response.data.data.map(category => category.name);
          setCategories(categoryNames);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-700 border-opacity-50 mx-auto"></div>
      </div>
    );
  }
  
  const filteredProducts = products.filter(product => {
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (categoryFilter === '' || 
       (product.category && 
        (typeof product.category === 'string' ? 
          product.categoryName === categoryFilter : 
          ((product.category && product.category.name === categoryFilter) ||
           product.categoryName === categoryFilter))))
    );
  }).sort((a, b) => {
    if (priceSort === 'low') {
      return a.price - b.price;
    } else if (priceSort === 'high') {
      return b.price - a.price;
    }
    return 0;
  });
  
  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">Products</h1>
        {isSeller && (
          <Link
            to="/products/add"
            className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Product
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price
            </label>
            <select
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Sort by Price</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-gray-500">Try changing your search or filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product._id} className="relative">
              <ProductCard product={product} />
              
              {(isAdmin || isSeller) && (
                <div className="p-4 pt-3 flex justify-between border-t mt-1 bg-white rounded-b-lg shadow-md">
                  <Link 
                    to={`/products/edit/${product._id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </Link>
                  <button 
                    className="text-red-600 hover:text-red-800"
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this product?')) {
                        try {
                          await api.delete(`/api/products/${product._id}`);
                          // Update state after successful deletion
                          setProducts(products.filter(p => p._id !== product._id));
                          // Show success notification if needed
                        } catch (err) {
                          console.error('Error deleting product:', err);
                          // Show error notification if needed
                          alert('Failed to delete product. Please try again.');
                        }
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsList;
