import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';

const SellersList = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        // Fetch from API
        const response = await api.get('/api/sellers');
        setSellers(response.data.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sellers:', error);
        setError('Failed to fetch sellers. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchSellers();
  }, []);

  // Filter sellers based on search term
  const filteredSellers = sellers.filter(seller => {
    const searchLower = searchTerm.toLowerCase();
    return (
      seller.name.toLowerCase().includes(searchLower) ||
      seller.email.toLowerCase().includes(searchLower) ||
      seller.phone.includes(searchTerm) ||
      seller.address.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-700 border-opacity-50 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading sellers...</p>
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">Sellers</h1>
        <Link
          to="/sellers/add"
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New Seller
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, phone or address..."
            className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 absolute right-3 top-2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Sellers Grid */}
      {filteredSellers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">No sellers found</h3>
          <p className="mt-1 text-gray-500">
            {searchTerm
              ? "Try changing your search criteria."
              : "Start by adding a new seller."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSellers.map((seller) => (
            <div key={seller._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-800">{seller.name}</h2>
                  <span className="bg-green-100 text-green-800 text-xs py-1 px-2 rounded-full">
                    {seller.productsSupplied.length} {seller.productsSupplied.length === 1 ? 'product' : 'products'}
                  </span>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-600">{seller.email}</span>
                  </div>
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-600">{seller.phone}</span>
                  </div>
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-600">{seller.address}</span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 mb-4">
                  Registered on {new Date(seller.createdAt).toLocaleDateString()}
                </div>
                
                <div className="flex justify-between border-t pt-4">
                  <Link 
                    to={`/sellers/${seller._id}`}
                    className="text-green-600 hover:text-green-800"
                  >
                    View Details
                  </Link>
                  <div>
                    <Link
                      to={`/sellers/edit/${seller._id}`}
                      className="text-blue-600 hover:text-blue-800 mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this seller?')) {
                          try {
                            // Delete seller via API
                            await api.delete(`/api/sellers/${seller._id}`);
                            // Then update state
                            setSellers(sellers.filter(s => s._id !== seller._id));
                          } catch (err) {
                            console.error('Error deleting seller:', err);
                            alert('Failed to delete seller. Please try again.');
                          }
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellersList;
