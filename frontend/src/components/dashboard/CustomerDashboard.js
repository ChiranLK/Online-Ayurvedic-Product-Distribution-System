import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const CustomerDashboard = () => {
  const context = useContext(AuthContext);
  const { currentUser } = context || { currentUser: null };
  const [orders, setOrders] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    wishlistItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch customer dashboard stats
        try {
          const statsResponse = await fetch(`/api/customers/${currentUser?._id}/stats`);
          if (statsResponse.ok) {
            const data = await statsResponse.json();
            setStats(data);
          }
        } catch (error) {
          console.error('Error fetching customer stats:', error);
        }

        // Fetch customer orders
        try {
          const ordersResponse = await fetch(`/api/customers/${currentUser?._id}/orders?limit=3`);
          if (ordersResponse.ok) {
            const data = await ordersResponse.json();
            setOrders(data.orders || []);
          }
        } catch (error) {
          console.error('Error fetching customer orders:', error);
        }

        // Fetch recently viewed products
        try {
          const productsResponse = await fetch(`/api/customers/${currentUser?._id}/recently-viewed`);
          if (productsResponse.ok) {
            const data = await productsResponse.json();
            setRecentProducts(data.products || []);
          }
        } catch (error) {
          console.error('Error fetching recently viewed products:', error);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser?._id]);

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
        <h1 className="text-2xl font-bold text-gray-800">Customer Dashboard</h1>
        <p className="text-gray-600">Welcome back, {currentUser?.name}</p>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Orders</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
          <Link to="/customer/orders" className="text-sm text-green-600 mt-2 inline-block">View All</Link>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Pending</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.pendingOrders}</p>
          <Link to="/customer/orders?status=pending" className="text-sm text-green-600 mt-2 inline-block">View</Link>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Shipped</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.shippedOrders}</p>
          <Link to="/customer/orders?status=shipped" className="text-sm text-green-600 mt-2 inline-block">Track</Link>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Delivered</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.deliveredOrders}</p>
          <Link to="/customer/orders?status=delivered" className="text-sm text-green-600 mt-2 inline-block">View</Link>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Wishlist</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.wishlistItems}</p>
          <Link to="/customer/wishlist" className="text-sm text-green-600 mt-2 inline-block">View List</Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Your Recent Orders</h2>
          <Link to="/customer/orders" className="text-sm text-green-600">View All Orders</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.products.map((product, index) => (
                      <span key={index}>
                        {index > 0 && ', '}
                        {product.name} ({product.quantity})
                      </span>
                    ))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs.{order.totalPrice.toFixed(2)}</td>
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
                    <Link to={`/customer/orders/${order._id}`} className="text-green-600 hover:text-green-900">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recently Viewed Products */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recently Viewed Products</h2>
          <Link to="/products" className="text-sm text-green-600">Browse All Products</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                <p className="text-green-600 font-semibold">Rs.{product.price}</p>
                <div className="mt-3 flex justify-between">
                  <Link to={`/products/${product._id}`} className="text-green-600 text-sm hover:underline">View Details</Link>
                  <button className="text-sm bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600">Add to Cart</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Account</h2>
          <ul className="space-y-2">
            <li>
              <Link to="/customer/profile" className="text-green-600 hover:underline">Edit Profile</Link>
            </li>
            <li>
              <Link to="/customer/addresses" className="text-green-600 hover:underline">Manage Addresses</Link>
            </li>
            <li>
              <Link to="/customer/profile/password" className="text-green-600 hover:underline">Change Password</Link>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Shopping</h2>
          <ul className="space-y-2">
            <li>
              <Link to="/customer/cart" className="text-green-600 hover:underline">View Cart</Link>
            </li>
            <li>
              <Link to="/customer/wishlist" className="text-green-600 hover:underline">My Wishlist</Link>
            </li>
            <li>
              <Link to="/products" className="text-green-600 hover:underline">Browse Products</Link>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Support</h2>
          <ul className="space-y-2">
            <li>
              <Link to="/customer/support" className="text-green-600 hover:underline">Contact Support</Link>
            </li>
            <li>
              <Link to="/faqs" className="text-green-600 hover:underline">FAQs</Link>
            </li>
            <li>
              <Link to="/return-policy" className="text-green-600 hover:underline">Return Policy</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
