import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const SellerDashboard = () => {
  const context = useContext(AuthContext);
  const { currentUser } = context || { currentUser: null };
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch seller stats
        try {
          const statsResponse = await fetch(`/api/sellers/${currentUser?._id}/stats`);
          if (statsResponse.ok) {
            const data = await statsResponse.json();
            setStats(data);
          }
        } catch (error) {
          console.error('Error fetching seller stats:', error);
        }

        // Fetch recent orders
        try {
          const ordersResponse = await fetch(`/api/sellers/${currentUser?._id}/orders?limit=5`);
          if (ordersResponse.ok) {
            const data = await ordersResponse.json();
            setRecentOrders(data.orders || []);
          }
        } catch (error) {
          console.error('Error fetching recent orders:', error);
        }

        // Fetch top selling products
        try {
          const productsResponse = await fetch(`/api/sellers/${currentUser?._id}/products/top`);
          if (productsResponse.ok) {
            const data = await productsResponse.json();
            setTopProducts(data.products || []);
          }
        } catch (error) {
          console.error('Error fetching top products:', error);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    if (currentUser?._id) {
      fetchDashboardData();
    }
  }, [currentUser]);

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
          <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
          <Link to="/seller/orders" className="text-sm text-green-600">View All</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customerId.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.products.map(p => p.name).join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">LKR {order.totalPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'delivered' 
                        ? 'bg-green-100 text-green-800' 
                        : order.status === 'shipped' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link to={`/seller/orders/${order._id}`} className="text-green-600 hover:text-green-900">View</Link>
                  </td>
                </tr>
              ))}
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
              {topProducts.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.totalSold}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">LKR {product.revenue.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link to={`/seller/products/${product._id}/edit`} className="text-green-600 hover:text-green-900 mr-4">Edit</Link>
                    <Link to={`/seller/products/${product._id}`} className="text-blue-600 hover:text-blue-900">View</Link>
                  </td>
                </tr>
              ))}
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
