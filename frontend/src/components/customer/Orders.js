import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const Orders = () => {
  const context = useContext(AuthContext);
  const { currentUser } = context || { currentUser: null };
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser?._id) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.get(`/api/customers/${currentUser._id}/orders`);
        setOrders(response.data.orders || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch orders');
        setLoading(false);
        console.error('Error fetching orders:', err);
      }
    };
    
    fetchOrders();
  }, [currentUser]);

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
  };

  // Filter orders based on status and date
  const filteredOrders = orders.filter(order => {
    let matchesStatus = true;
    let matchesDate = true;

    if (statusFilter) {
      matchesStatus = order.status === statusFilter;
    }

    if (dateFilter !== 'all') {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      
      if (dateFilter === 'last7days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        matchesDate = orderDate >= sevenDaysAgo;
      } else if (dateFilter === 'last30days') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        matchesDate = orderDate >= thirtyDaysAgo;
      } else if (dateFilter === 'last3months') {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        matchesDate = orderDate >= threeMonthsAgo;
      }
    }

    return matchesStatus && matchesDate;
  });

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
        <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/2">
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
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="w-full md:w-1/2">
          <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Date
          </label>
          <select
            id="date-filter"
            value={dateFilter}
            onChange={handleDateFilterChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">All Time</option>
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="last3months">Last 3 Months</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.map((order) => (
          <div key={order._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Order #{order._id}</h2>
                <p className="text-sm text-gray-500">
                  Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div className="mt-2 md:mt-0">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  order.status === 'delivered' 
                    ? 'bg-green-100 text-green-800' 
                    : order.status === 'shipped' 
                      ? 'bg-blue-100 text-blue-800' 
                      : order.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Products */}
            <div className="border-t border-b border-gray-200 py-4 my-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Items</h3>
              <div className="space-y-3">
                {order.products.map((product, index) => (
                  <div key={index} className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{product.name}</p>
                      <p className="text-sm text-gray-500">Qty: {product.quantity} × Rs.{product.price}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-800">Rs.{product.total}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="mb-4">
              <div className="flex justify-between">
                <h3 className="text-sm font-medium text-gray-700">Total</h3>
                <p className="text-sm font-medium text-gray-800">Rs.{order.totalPrice}</p>
              </div>
              <div className="flex justify-between mt-1">
                <h3 className="text-sm font-medium text-gray-700">Payment Method</h3>
                <p className="text-sm font-medium text-gray-800">
                  {order.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'}
                </p>
              </div>
              <div className="flex justify-between mt-1">
                <h3 className="text-sm font-medium text-gray-700">Shipping Address</h3>
                <p className="text-sm text-right text-gray-800">
                  {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.zipCode}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Link
                to={`/customer/orders/${order._id}`}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                View Details
              </Link>

              {order.status === 'delivered' && (
                <Link
                  to={`/customer/orders/${order._id}/review`}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                >
                  Write Review
                </Link>
              )}

              {order.status === 'processing' && (
                <button
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any orders matching your filters.
            </p>
            <div className="mt-6">
              <Link
                to="/products"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Browse Products
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
