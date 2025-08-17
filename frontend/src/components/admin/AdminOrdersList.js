import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';

const AdminOrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sellerFilter, setSellerFilter] = useState('');
  const [sellers, setSellers] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/api/orders');
        setOrders(response.data.data || []);
        
        // Extract unique sellers from orders
        const uniqueSellers = [...new Set(
          response.data.data
            .filter(order => order.sellerId && order.sellerId.name)
            .map(order => JSON.stringify({ 
              _id: order.sellerId._id, 
              name: order.sellerId.name 
            }))
        )].map(seller => JSON.parse(seller));
        
        setSellers(uniqueSellers);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch orders');
        setLoading(false);
        console.error('Error fetching orders:', err);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSellerFilterChange = (e) => {
    setSellerFilter(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter orders based on search term, status, and seller
  const filteredOrders = orders.filter(order => {
    const orderIdString = order._id.toString();
    const customerName = order.customerId?.name?.toLowerCase() || '';
    const matchesStatus = statusFilter === '' || order.status === statusFilter;
    const matchesSeller = sellerFilter === '' || 
                           (order.sellerId && order.sellerId._id === sellerFilter);
    const matchesSearch = orderIdString.includes(searchTerm.toLowerCase()) || 
                           customerName.includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSeller && matchesSearch;
  });

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Call the API to update the order's status
      await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
      
      // Update the local state after successful API call
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
    }
  };

  // Function to calculate order total
  const calculateOrderTotal = (order) => {
    return order.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  // Function to get appropriate status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
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
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
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
              {sellers.map(seller => (
                <option key={seller._id} value={seller._id}>{seller.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by order ID or customer name"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seller
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order._id.substring(order._id.length - 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.customerId?.name || 'Unknown Customer'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.sellerId?.name || 'Unknown Seller'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Rs. {calculateOrderTotal(order).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/admin/orders/${order._id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                        View
                      </Link>
                      <div className="inline-block relative">
                        <select 
                          className="text-indigo-600 hover:text-indigo-900 bg-transparent border-none cursor-pointer"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              updateOrderStatus(order._id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                        >
                          <option value="">Update Status</option>
                          <option value="pending">Set as Pending</option>
                          <option value="processing">Set as Processing</option>
                          <option value="shipped">Set as Shipped</option>
                          <option value="delivered">Set as Delivered</option>
                          <option value="cancelled">Set as Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersList;
