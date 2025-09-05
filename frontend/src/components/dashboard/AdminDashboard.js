import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../config/api';

const AdminDashboard = () => {
  const context = useContext(AuthContext);
  const { currentUser } = context || { currentUser: null };
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalSellers: 0,
    pendingSellers: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    todayMorningAppointments: 0,
    todayAfternoonAppointments: 0,
    todayEveningAppointments: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get stats
        try {
          const statsResponse = await api.get('/api/admin/stats/');
          console.log('Admin Dashboard Stats Response:', statsResponse.data);
          setStats(statsResponse.data);
        } catch (error) {
          console.error('Error fetching stats:', error);
        }

        // Get recent orders
        try {
          const ordersResponse = await api.get('/api/orders?limit=5');
          setRecentOrders(ordersResponse.data.data || []);
        } catch (error) {
          console.error('Error fetching recent orders:', error);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {currentUser?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Products</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
          <Link to="/products" className="text-sm text-green-600 mt-2 inline-block">View All</Link>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Orders</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
          <Link to="/orders" className="text-sm text-green-600 mt-2 inline-block">View All</Link>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Customers</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.totalCustomers}</p>
          <Link to="/admin/customers" className="text-sm text-green-600 mt-2 inline-block">View All</Link>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Sellers</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.totalSellers}</p>
          <Link to="/admin/sellers" className="text-sm text-green-600 mt-2 inline-block">View All</Link>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Sellers</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.pendingSellers}</p>
          <Link to="/admin/sellers?approval=pending" className="text-sm text-green-600 mt-2 inline-block">View All</Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
          <Link to="/orders" className="text-sm text-green-600">View All</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
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
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">LKR {order.totalPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'delivered' 
                        ? 'bg-green-100 text-green-800' 
                        : order.status === 'shipped' 
                          ? 'bg-blue-100 text-blue-800' 
                          : order.status === 'processing' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link to={`/orders/${order._id}`} className="text-green-600 hover:text-green-900">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* New Appointment Stats Card */}
        <div className="bg-purple-50 p-6 rounded-lg shadow-md border border-purple-200">
          <h2 className="text-lg font-semibold text-purple-800 mb-4">Appointment Management</h2>
          <div className="flex justify-between mb-4">
            <div className="text-center px-4">
              <p className="text-2xl font-bold text-purple-700">
                {stats.pendingAppointments || 0}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="text-center px-4">
              <p className="text-2xl font-bold text-green-700">
                {stats.confirmedAppointments || 0}
              </p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
            <div className="text-center px-4">
              <p className="text-2xl font-bold text-blue-700">
                {stats.completedAppointments || 0}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link 
              to="/admin/appointments" 
              className="bg-purple-600 text-white text-center py-2 rounded-lg hover:bg-purple-700"
            >
              Manage Appointments
            </Link>
            <Link 
              to="/admin/appointments/today" 
              className="bg-green-600 text-white text-center py-2 rounded-lg hover:bg-green-700"
            >
              Today's Schedule
            </Link>
          </div>
        </div>
        
        {/* New Doctor's Schedule Card */}
        <div className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-800 mb-4">Doctor's Schedule</h2>
          <p className="text-gray-600 mb-4">Manage Ayurvedic doctor availability and appointment slots</p>
          <ul className="space-y-2 mb-4">
            <li className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span className="text-gray-700">Create and update doctor schedules</span>
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              <span className="text-gray-700">View upcoming appointments</span>
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
              <span className="text-gray-700">Set available time slots</span>
            </li>
          </ul>
          <Link 
            to="/admin/doctor-schedule" 
            className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700"
          >
            Manage Schedule
          </Link>
        </div>
        
        {/* New Today's Appointments Card */}
        <div className="bg-green-50 p-6 rounded-lg shadow-md border border-green-200">
          <h2 className="text-lg font-semibold text-green-800 mb-4">Today's Appointments</h2>
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Morning (9AM-12PM):</span>
              <span className="font-medium">{stats.todayMorningAppointments || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Afternoon (1PM-5PM):</span>
              <span className="font-medium">{stats.todayAfternoonAppointments || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Evening (6PM-9PM):</span>
              <span className="font-medium">{stats.todayEveningAppointments || 0}</span>
            </div>
          </div>
          <Link 
            to="/admin/appointments/today" 
            className="block w-full bg-green-600 text-white text-center py-2 rounded-lg hover:bg-green-700"
          >
            View Today's Schedule
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Admin Settings</h2>
          <ul className="space-y-2">
            <li>
              <Link to="/admin/profile" className="text-green-600 hover:underline">Edit Profile</Link>
            </li>
            <li>
              <Link to="/admin/profile/password" className="text-green-600 hover:underline">Change Password</Link>
            </li>
            <li>
              <Link to="/admin/settings" className="text-green-600 hover:underline">System Settings</Link>
            </li>
          </ul>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Products Management</h2>
          <ul className="space-y-2">
            <li>
              <Link to="/products" className="text-green-600 hover:underline">View All Products</Link>
            </li>
            <li>
              <Link to="/admin/categories" className="text-green-600 hover:underline">Manage Categories</Link>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">User Management</h2>
          <ul className="space-y-2">
            <li>
              <Link to="/admin/users" className="text-green-600 hover:underline">All Users</Link>
            </li>
            <li>
              <Link to="/admin/users?role=customer" className="text-green-600 hover:underline">Customers</Link>
            </li>
            <li>
              <Link to="/admin/users?role=seller" className="text-green-600 hover:underline">Sellers</Link>
            </li>
            <li>
              <Link to="/admin/users/add" className="text-green-600 hover:underline">Add New User</Link>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Content Management</h2>
          <ul className="space-y-2">
            <li>
              <Link to="/admin/faq" className="text-green-600 hover:underline">Manage FAQs</Link>
            </li>
            <li>
              <Link to="/admin/feedback" className="text-green-600 hover:underline">Customer Feedback</Link>
            </li>
            <li>
              <Link to="/admin/banner" className="text-green-600 hover:underline">Banner Management</Link>
            </li>
            <li>
              <Link to="/admin/appointments" className="text-green-600 hover:underline">Doctor Appointments</Link>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Orders & Reports</h2>
          <ul className="space-y-2">
            <li>
              <Link to="/admin/reports/sales" className="text-green-600 hover:underline">Sales Reports</Link>
            </li>
            <li>
              <Link to="/admin/reports/inventory" className="text-green-600 hover:underline">Inventory Reports</Link>
            </li>
            <li>
              <Link to="/admin/reports/appointments" className="text-green-600 hover:underline">Appointment Reports</Link>
            </li>
            <li>
              <Link to="/admin/reports/orders" className="text-green-600 hover:underline">Order Reports</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
