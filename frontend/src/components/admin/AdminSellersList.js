import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../config/api';

const AdminSellersList = ({ approvalFilter: initialApprovalFilter }) => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [approvalFilter, setApprovalFilter] = useState(initialApprovalFilter || '');

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        // Construct API URL with status filter if provided
        const apiUrl = initialApprovalFilter 
          ? `/api/admin/sellers?status=${initialApprovalFilter}` 
          : '/api/admin/sellers';
          
        const response = await api.get(apiUrl);
        setSellers(response.data.data || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch sellers');
        setLoading(false);
        console.error('Error fetching sellers:', err);
      }
    };

    fetchSellers();
  }, [initialApprovalFilter]);

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleApprovalFilterChange = (e) => {
    setApprovalFilter(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Initialize sellers with default status if it's missing
  useEffect(() => {
    if (sellers && sellers.length > 0) {
      // Add default 'pending' status to any seller who doesn't have a status
      const hasMissingStatus = sellers.some(seller => !seller.status);
      
      if (hasMissingStatus) {
        const updatedSellers = sellers.map(seller => {
          return {
            ...seller,
            status: seller.status || 'pending'
          };
        });
        setSellers(updatedSellers);
      }
    }
  }, [sellers]);

  // Filter sellers based on search term, status, and approval status
  const filteredSellers = sellers.filter(seller => {
    const matchesStatus = statusFilter === '' || 
                          (statusFilter === 'active' && seller.isActive) || 
                          (statusFilter === 'inactive' && !seller.isActive);
    const matchesApproval = approvalFilter === '' || 
                            (approvalFilter === 'approved' && seller.status === 'approved') || 
                            (approvalFilter === 'pending' && (seller.status === 'pending' || !seller.status)) ||
                            (approvalFilter === 'rejected' && seller.status === 'rejected');
    const matchesSearch = seller.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          seller.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (seller.phone && seller.phone.includes(searchTerm)) ||
                          (seller.address && seller.address?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesApproval && matchesSearch;
  });

  const toggleSellerStatus = async (sellerId, currentStatus) => {
    try {
      // Call the API to update the seller's status
      await api.put(`/api/admin/sellers/${sellerId}`, { isActive: !currentStatus });
      
      // Update the local state after successful API call
      setSellers(sellers.map(seller => 
        seller._id === sellerId ? { ...seller, isActive: !currentStatus } : seller
      ));
    } catch (err) {
      console.error('Error updating seller status:', err);
      alert('Failed to update seller status');
    }
  };

  const updateSellerApproval = async (sellerId, newStatus) => {
    try {
      // Call the API to update the seller's approval status
      await api.put(`/api/admin/sellers/${sellerId}/approve`, { status: newStatus });
      
      // Update the local state after successful API call
      setSellers(sellers.map(seller => 
        seller._id === sellerId ? { ...seller, status: newStatus } : seller
      ));
    } catch (err) {
      console.error('Error updating seller approval status:', err);
      alert('Failed to update seller approval status');
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {approvalFilter === 'pending' ? 'Pending Seller Approvals' : 'Seller Management'}
        </h1>
        <Link
          to="/admin/sellers/add"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Add New Seller
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label htmlFor="approval-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Approval
            </label>
            <select
              id="approval-filter"
              value={approvalFilter}
              onChange={handleApprovalFilterChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by name, email, phone, or address"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Pending Approval Banner */}
      {sellers.some(seller => seller.status === 'pending' || !seller.status) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                There are {sellers.filter(seller => seller.status === 'pending' || !seller.status).length} seller{sellers.filter(seller => seller.status === 'pending' || !seller.status).length !== 1 ? 's' : ''} pending approval.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sellers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSellers.length > 0 ? (
          filteredSellers.map(seller => (
            <div key={seller._id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-gray-800">{seller.name}</h2>
                  <div className="flex flex-col items-end">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full mb-2 ${
                      seller.status === 'approved' ? 'bg-green-100 text-green-800' : 
                      seller.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {seller.status ? (seller.status.charAt(0).toUpperCase() + seller.status.slice(1)) : 'Pending'}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      seller.isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {seller.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm">
                    <svg className="h-4 w-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-600">{seller.email}</span>
                  </div>
                  
                  {seller.phone && (
                    <div className="flex items-center text-sm">
                      <svg className="h-4 w-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-600">{seller.phone}</span>
                    </div>
                  )}
                  
                  {seller.address && (
                    <div className="flex items-center text-sm">
                      <svg className="h-4 w-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-600">{seller.address}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <div className="text-sm text-gray-500">
                    Member since {new Date(seller.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Products: {seller.productsCount || 0}
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-200">
                  <Link to={`/admin/sellers/${seller._id}`} className="text-blue-600 hover:text-blue-800 text-sm">
                    View Details
                  </Link>
                  
                  <div className="flex">
                    {/* Approval actions */}
                    {(seller.status === 'pending' || !seller.status) && (
                      <>
                        <button 
                          onClick={() => updateSellerApproval(seller._id, 'approved')}
                          className="text-green-600 hover:text-green-800 text-sm mr-3"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => updateSellerApproval(seller._id, 'rejected')}
                          className="text-red-600 hover:text-red-800 text-sm mr-3"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    
                    {/* Active/Inactive toggle */}
                    <button 
                      onClick={() => toggleSellerStatus(seller._id, seller.isActive)}
                      className={`text-sm ${seller.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'} mr-3`}
                    >
                      {seller.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    
                    <Link to={`/admin/sellers/edit/${seller._id}`} className="text-indigo-600 hover:text-indigo-800 text-sm">
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-gray-50 p-6 text-center rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No sellers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter || approvalFilter ? "Try changing your search criteria." : "Start by adding a new seller."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSellersList;
