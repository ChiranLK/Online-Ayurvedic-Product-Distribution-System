import React from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ title, children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
              <Link to="/admin/dashboard" className="text-green-600 hover:text-green-800">
                Back to Dashboard
              </Link>
            </div>
            <div className="h-0.5 bg-gray-200 mt-4"></div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
