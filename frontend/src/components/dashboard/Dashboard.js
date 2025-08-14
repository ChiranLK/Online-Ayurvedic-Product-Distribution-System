import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import SellerDashboard from './SellerDashboard';
import CustomerDashboard from './CustomerDashboard';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const context = useContext(AuthContext);
  const { currentUser, token } = context || { currentUser: null, token: null };
  const navigate = useNavigate();
  
  // Determine if user is authenticated based on token
  const isAuthenticated = !!token;

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Show loading state while user data is being fetched
  if (isAuthenticated && !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        <div className="ml-3 text-lg">Loading user data...</div>
      </div>
    );
  }

  // Render appropriate dashboard based on user role with null safety
  if (currentUser?.role === 'admin') {
    return <AdminDashboard />;
  } else if (currentUser?.role === 'seller') {
    return <SellerDashboard />;
  } else if (currentUser?.role === 'customer') {
    return <CustomerDashboard />;
  } else {
    // Handle undefined/null role
    return <Navigate to="/unauthorized" />;
  }
};

export default Dashboard;
