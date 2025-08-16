import React, { useContext, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';

// Component to protect routes based on authentication and role
const PrivateRoute = ({ allowedRoles }) => {
  const context = useContext(AuthContext);
  const { currentUser, token, loading } = context || { currentUser: null, token: null, loading: false };
  const location = useLocation();
  const navigate = useNavigate();
  const { openModal } = useModal();
  const [showModal, setShowModal] = useState(false);

  // Show modal for authentication issues
  useEffect(() => {
    // Don't show modals during loading
    if (loading) return;
    
    // Handle different scenarios
    if (!token || !currentUser) {
      // Only show modal once
      if (!showModal) {
        setShowModal(true);
        openModal({
          title: 'Authentication Required',
          message: 'You need to log in to access this page.',
          confirmText: 'Log In',
          type: 'info',
          onConfirm: () => navigate('/login', { state: { from: location } })
        });
      }
    } else if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
      // Only show modal once
      if (!showModal) {
        setShowModal(true);
        openModal({
          title: 'Access Denied',
          message: 'You do not have permission to access this page.',
          confirmText: 'OK',
          type: 'warning',
          onConfirm: () => navigate('/unauthorized')
        });
      }
    }
  }, [token, currentUser, allowedRoles, location, navigate, openModal, showModal, loading]);

  // Loading indicator
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Handle authentication checks
  if (!token || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle role checks
  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // All checks passed, render the protected content
  return <Outlet />;
};

export default PrivateRoute;
