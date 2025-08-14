import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

// Component to protect routes based on authentication and role
const PrivateRoute = ({ allowedRoles }) => {
  const context = useContext(AuthContext);
  const { currentUser, token, loading } = context || { currentUser: null, token: null, loading: false };
  const location = useLocation();

  // If still loading auth state, don't render anything yet
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!token || !currentUser) {
    // Redirect to login page, but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified, check if user has required role
  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
    // Redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and has the required role, render the protected component
  return <Outlet />;
};

export default PrivateRoute;
