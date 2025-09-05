import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../config/api';

const AdminSidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [pendingSellerRequests, setPendingSellerRequests] = useState(0);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };
  
  useEffect(() => {
    const fetchSellerRequestsCount = async () => {
      try {
        const response = await api.get('/api/seller-requests');
        if (response.data && response.data.count) {
          setPendingSellerRequests(response.data.count);
        }
      } catch (err) {
        console.error('Error fetching seller requests count:', err);
      }
    };
    
    fetchSellerRequestsCount();
    
    // Refresh count every 5 minutes
    const interval = setInterval(fetchSellerRequestsCount, 300000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`bg-gray-800 text-white ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 flex flex-col`}>
      <div className="p-4 flex items-center justify-between">
        {!collapsed && <div className="font-bold text-xl">Admin Panel</div>}
        <button
          onClick={toggleSidebar}
          className="text-white focus:outline-none"
        >
          {collapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-2">
          <li>
            <Link
              to="/admin/products"
              className={`flex items-center p-2 rounded-lg ${
                isActive('/admin/products') ? 'bg-green-600' : 'hover:bg-gray-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {!collapsed && <span className="ml-3">Products</span>}
            </Link>
          </li>
          
          <li>
            <Link
              to="/admin/categories"
              className={`flex items-center p-2 rounded-lg ${
                isActive('/admin/categories') ? 'bg-green-600' : 'hover:bg-gray-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {!collapsed && <span className="ml-3">Categories</span>}
            </Link>
          </li>
          
          <li>
            <Link
              to="/admin/orders"
              className={`flex items-center p-2 rounded-lg ${
                isActive('/admin/orders') ? 'bg-green-600' : 'hover:bg-gray-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {!collapsed && <span className="ml-3">Orders</span>}
            </Link>
          </li>
          
          <li>
            <Link
              to="/admin/users"
              className={`flex items-center p-2 rounded-lg ${
                isActive('/admin/users') ? 'bg-green-600' : 'hover:bg-gray-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {!collapsed && <span className="ml-3">Users</span>}
            </Link>
          </li>
          
          <li>
            <Link
              to="/admin/sellers"
              className={`flex items-center p-2 rounded-lg ${
                isActive('/admin/sellers') ? 'bg-green-600' : 'hover:bg-gray-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {!collapsed && <span className="ml-3">Sellers</span>}
            </Link>
          </li>

          <li>
            <Link
              to="/admin/seller-requests"
              className={`flex items-center p-2 rounded-lg ${
                isActive('/admin/seller-requests') ? 'bg-green-600' : 'hover:bg-gray-700'
              }`}
            >
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {pendingSellerRequests > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingSellerRequests > 9 ? '9+' : pendingSellerRequests}
                  </span>
                )}
              </div>
              {!collapsed && (
                <div className="ml-3 flex items-center">
                  <span>Seller Requests</span>
                  {pendingSellerRequests > 0 && !collapsed && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {pendingSellerRequests}
                    </span>
                  )}
                </div>
              )}
            </Link>
          </li>
          
          <li>
            <Link
              to="/admin/profile"
              className={`flex items-center p-2 rounded-lg ${
                isActive('/admin/profile') ? 'bg-green-600' : 'hover:bg-gray-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {!collapsed && <span className="ml-3">Profile</span>}
            </Link>
          </li>
          
          <li className="pt-4 pb-2">
            {!collapsed && <div className="text-gray-400 text-xs uppercase px-2">Reports</div>}
          </li>
          
          <li>
            <Link
              to="/admin/reports/sales"
              className={`flex items-center p-2 rounded-lg ${
                isActive('/admin/reports/sales') ? 'bg-green-600' : 'hover:bg-gray-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {!collapsed && <span className="ml-3">Sales Report</span>}
            </Link>
          </li>
          
          <li>
            <Link
              to="/admin/reports/inventory"
              className={`flex items-center p-2 rounded-lg ${
                isActive('/admin/reports/inventory') ? 'bg-green-600' : 'hover:bg-gray-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              {!collapsed && <span className="ml-3">Inventory Report</span>}
            </Link>
          </li>
          
          <li>
            <Link
              to="/admin/reports/appointments"
              className={`flex items-center p-2 rounded-lg ${
                isActive('/admin/reports/appointments') ? 'bg-green-600' : 'hover:bg-gray-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {!collapsed && <span className="ml-3">Appointment Reports</span>}
            </Link>
          </li>
          
          <li>
            <Link
              to="/admin/reports/orders"
              className={`flex items-center p-2 rounded-lg ${
                isActive('/admin/reports/orders') ? 'bg-green-600' : 'hover:bg-gray-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {!collapsed && <span className="ml-3">Order Reports</span>}
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="p-4">
        <Link
          to="/logout"
          className="flex items-center p-2 rounded-lg hover:bg-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!collapsed && <span className="ml-3">Logout</span>}
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;
