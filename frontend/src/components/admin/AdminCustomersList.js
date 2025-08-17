import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';

const AdminCustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get('/api/admin/users?role=customer');
        setCustomers(response.data.data || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch customers');
        setLoading(false);
        console.error('Error fetching customers:', err);
      }
    };

    fetchCustomers();
  }, []);

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter customers based on search term and status
  const filteredCustomers = customers.filter(customer => {
    const matchesStatus = statusFilter === '' || 
                         (statusFilter === 'active' && customer.isActive) || 
                         (statusFilter === 'inactive' && !customer.isActive);
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (customer.phone && customer.phone.includes(searchTerm));
    return matchesStatus && matchesSearch;
  });

  const toggleCustomerStatus = async (customerId, currentStatus) => {
    try {
      // Call the API to update the customer's status
      await api.put(`/api/admin/users/${customerId}`, { isActive: !currentStatus });
      
      // Update the local state after successful API call
      setCustomers(customers.map(customer => 
        customer._id === customerId ? { ...customer, isActive: !currentStatus } : customer
      ));
    } catch (err) {
      console.error('Error updating customer status:', err);
      alert('Failed to update customer status');
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
        <h1 className="text-2xl font-bold text-gray-800">Customer Management</h1>
        <Link
          to="/admin/customers/add"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Add New Customer
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/4">
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
          <div className="w-full md:w-3/4">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by name, email, or phone"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map(customer => (
            <div key={customer._id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-gray-800">{customer.name}</h2>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {customer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm">
                    <svg className="h-4 w-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-600">{customer.email}</span>
                  </div>
                  
                  {customer.phone && (
                    <div className="flex items-center text-sm">
                      <svg className="h-4 w-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-600">{customer.phone}</span>
                    </div>
                  )}
                  
                  {customer.address && (
                    <div className="flex items-center text-sm">
                      <svg className="h-4 w-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-600">{customer.address}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 text-sm text-gray-500">
                  Member since {new Date(customer.createdAt).toLocaleDateString()}
                </div>
                
                {customer.lastOrderDate && (
                  <div className="mt-1 text-sm text-gray-500">
                    Last order: {new Date(customer.lastOrderDate).toLocaleDateString()}
                  </div>
                )}
                
                <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-200">
                  <Link to={`/admin/customers/${customer._id}`} className="text-blue-600 hover:text-blue-800 text-sm">
                    View Details
                  </Link>
                  
                  <div>
                    <button 
                      onClick={() => toggleCustomerStatus(customer._id, customer.isActive)}
                      className={`text-sm ${customer.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'} mr-4`}
                    >
                      {customer.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    
                    <Link to={`/admin/customers/edit/${customer._id}`} className="text-indigo-600 hover:text-indigo-800 text-sm">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter ? "Try changing your search criteria." : "Start by adding a new customer."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomersList;
