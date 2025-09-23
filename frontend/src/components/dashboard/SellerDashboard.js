import React, { useContext, useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const SellerDashboard = () => {
  const context = useContext(AuthContext);
  const { currentUser } = context || { currentUser: null };
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const refreshIntervalRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch dashboard data
  const fetchDashboardData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      
      // Fetch seller stats
      try {
        console.log('Fetching seller dashboard stats with token:', localStorage.getItem('token') ? 'Token exists' : 'No token');
        
        const statsResponse = await fetch(`/api/seller/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        console.log('Stats response status:', statsResponse.status);
        
        if (statsResponse.ok) {
          const data = await statsResponse.json();
          console.log('Received stats data:', JSON.stringify(data));
          
          // Make sure we're using the right property names and converting to numbers
          const updatedStats = {
            totalProducts: parseInt(data.totalProducts) || 0,
            activeProducts: parseInt(data.activeProducts) || 0,
            totalOrders: parseInt(data.totalOrders) || 0,
            pendingOrders: parseInt(data.pendingOrders) || 0,
            processingOrders: parseInt(data.processingOrders) || 0,
            shippedOrders: parseInt(data.shippedOrders) || 0,
            deliveredOrders: parseInt(data.deliveredOrders) || 0,
            totalRevenue: parseFloat(data.totalRevenue) || 0
          };
          
          console.log('Updating stats state with:', JSON.stringify(updatedStats));
          setStats(updatedStats);
        } else {
          console.error('Failed to fetch stats:', statsResponse.status, statsResponse.statusText);
          // Try to read error response
          const errorText = await statsResponse.text();
          console.error('Error response:', errorText);
        }
      } catch (error) {
        console.error('Error fetching seller stats:', error);
      }

      // Fetch recent orders - real-time update
      try {
        const ordersResponse = await fetch(`/api/seller/dashboard/recent-orders`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (ordersResponse.ok) {
          const data = await ordersResponse.json();
          setRecentOrders(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching recent orders:', error);
      }

      // Fetch top selling products
      try {
        const productsResponse = await fetch(`/api/seller/dashboard/top-products`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (productsResponse.ok) {
          const data = await productsResponse.json();
          setTopProducts(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching top products:', error);
      }

      setLastUpdated(new Date());
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  // Set up polling for real-time data
  useEffect(() => {
    // Initial fetch
    if (currentUser) {
      fetchDashboardData();
    }
    
    // Set up the interval for polling
    if (autoRefresh && currentUser) {
      refreshIntervalRef.current = setInterval(() => {
        fetchDashboardData();
      }, 30000); // Check for updates every 30 seconds
    }
    
    // Clean up the interval on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [currentUser, autoRefresh]);

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Seller Dashboard</h1>
        <p className="text-gray-600">Welcome back, {currentUser?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Products</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
          <Link to="/seller/products" className="text-sm text-green-600 mt-2 inline-block">Manage</Link>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Active Products</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.activeProducts}</p>
          <Link to="/seller/products?status=active" className="text-sm text-green-600 mt-2 inline-block">View</Link>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Orders</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
          <Link to="/seller/orders" className="text-sm text-green-600 mt-2 inline-block">View All</Link>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Orders</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.pendingOrders}</p>
          <Link to="/seller/orders?status=pending" className="text-sm text-green-600 mt-2 inline-block">Process</Link>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-800">Rs.{stats.totalRevenue}</p>
          <Link to="/seller/reports/sales" className="text-sm text-green-600 mt-2 inline-block">Details</Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-800 mr-3">Recent Orders</h2>
            {refreshing && (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500 mr-2"></div>
            )}
            <div className="text-xs text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
          <div className="flex items-center">
            <button 
              onClick={() => fetchDashboardData(true)} 
              className="mr-4 text-sm bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded transition"
            >
              Refresh Now
            </button>
            <div className="flex items-center mr-4">
              <input 
                type="checkbox" 
                id="autoRefresh" 
                checked={autoRefresh} 
                onChange={(e) => setAutoRefresh(e.target.checked)} 
                className="mr-2"
              />
              <label htmlFor="autoRefresh" className="text-sm text-gray-600">Auto refresh</label>
            </div>
            <Link to="/seller/orders" className="text-sm text-green-600">View All</Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customerId?.name || 'Customer'}
                      {order.customerId?.email && <div className="text-xs text-gray-400">{order.customerId.email}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.sellerItems ? (
                        order.sellerItems.map((item, idx) => (
                          <div key={idx} className={idx > 0 ? "mt-1" : ""}>
                            {item.productId?.name || item.name} ({item.quantity})
                          </div>
                        ))
                      ) : (
                        'No product data'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                      <div className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      LKR {order.sellerTotal?.toFixed(2) || order.totalPrice?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status?.toLowerCase() === 'delivered' 
                          ? 'bg-green-100 text-green-800' 
                          : order.status?.toLowerCase() === 'shipped' 
                            ? 'bg-blue-100 text-blue-800'
                            : order.status?.toLowerCase() === 'processing'
                              ? 'bg-purple-100 text-purple-800'
                              : order.status?.toLowerCase() === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1).toLowerCase() || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/seller/orders/${order._id}`} className="text-green-600 hover:text-green-900">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No recent orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Top Selling Products</h2>
          <Link to="/seller/products" className="text-sm text-green-600">View All Products</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProducts.length > 0 ? (
                topProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.imageUrl && (
                          <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded-full mr-3 object-cover" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          {product._id && <div className="text-xs text-gray-500">ID: {product._id.slice(-6)}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.unitsSold || product.totalSold || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      LKR {product.revenue?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`${
                        (product.countInStock || product.stock) <= 5 
                          ? 'text-red-600 font-semibold' 
                          : (product.countInStock || product.stock) <= 15 
                            ? 'text-yellow-600' 
                            : 'text-green-600'
                      }`}>
                        {product.countInStock || product.stock || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/seller/products/${product._id}/edit`} className="text-green-600 hover:text-green-900 mr-4">Edit</Link>
                      <Link to={`/seller/products/${product._id}`} className="text-blue-600 hover:text-blue-900">View</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No product sales data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Account</h2>
          <ul className="space-y-2">
            <li>
              <Link to="/seller/profile" className="text-green-600 hover:underline">Edit Profile</Link>
            </li>
            <li>
              <Link to="/seller/profile/password" className="text-green-600 hover:underline">Change Password</Link>
            </li>
            <li>
              <Link to="/seller/business-details" className="text-green-600 hover:underline">Business Details</Link>
            </li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Product Management</h2>
          <ul className="space-y-2">
            <li>
              <Link to="/seller/products/add" className="text-green-600 hover:underline">Add New Product</Link>
            </li>
            <li>
              <Link to="/seller/products" className="text-green-600 hover:underline">Manage Products</Link>
            </li>
            <li>
              <Link to="/seller/inventory" className="text-green-600 hover:underline">Update Inventory</Link>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Management</h2>
          <ul className="space-y-2">
            <li>
              <Link to="/seller/orders?status=pending" className="text-green-600 hover:underline">Process Pending Orders</Link>
            </li>
            <li>
              <Link to="/seller/orders?status=shipped" className="text-green-600 hover:underline">Track Shipped Orders</Link>
            </li>
            <li>
              <Link to="/seller/reports/sales" className="text-green-600 hover:underline">View Sales Reports</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
