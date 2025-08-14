import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProfileRedirect = () => {
  const { currentUser, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Redirect based on user role
  switch (currentUser?.role) {
    case 'admin':
      return <Navigate to="/admin/profile" />;
    case 'seller':
      return <Navigate to="/seller/profile" />;
    case 'customer':
      return <Navigate to="/customer/profile" />;
    default:
      return <Navigate to="/dashboard" />;
  }
};

export default ProfileRedirect;
