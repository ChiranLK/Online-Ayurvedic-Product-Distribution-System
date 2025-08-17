import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path) => {
    return currentPath === path ? "bg-green-700 text-white" : "text-green-800 hover:bg-green-50";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-1">
      <nav className="flex flex-wrap">
        <Link 
          to="/admin" 
          className={`px-4 py-2 rounded-md mr-2 mb-2 ${isActive('/admin')}`}
        >
          Dashboard
        </Link>
        <Link 
          to="/admin/products" 
          className={`px-4 py-2 rounded-md mr-2 mb-2 ${isActive('/admin/products')}`}
        >
          Products
        </Link>
        <Link 
          to="/admin/customers" 
          className={`px-4 py-2 rounded-md mr-2 mb-2 ${isActive('/admin/customers')}`}
        >
          Customers
        </Link>
        <Link 
          to="/admin/sellers" 
          className={`px-4 py-2 rounded-md mr-2 mb-2 ${isActive('/admin/sellers')}`}
        >
          Sellers
        </Link>
        <Link 
          to="/admin/orders" 
          className={`px-4 py-2 rounded-md mr-2 mb-2 ${isActive('/admin/orders')}`}
        >
          Orders
        </Link>
        <Link 
          to="/admin/faq" 
          className={`px-4 py-2 rounded-md mr-2 mb-2 ${isActive('/admin/faq')}`}
        >
          FAQ Management
        </Link>
        <Link 
          to="/admin/feedback" 
          className={`px-4 py-2 rounded-md mr-2 mb-2 ${isActive('/admin/feedback')}`}
        >
          Feedback
        </Link>
        <Link 
          to="/admin/profile" 
          className={`px-4 py-2 rounded-md mr-2 mb-2 ${isActive('/admin/profile')}`}
        >
          My Profile
        </Link>
      </nav>
    </div>
  );
};

export default AdminNavigation;
