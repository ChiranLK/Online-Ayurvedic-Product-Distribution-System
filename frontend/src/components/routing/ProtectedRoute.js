import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';

/**
 * ProtectedRoute component that restricts access based on authentication and roles
 * @param {Object} props Component props
 * @param {Array|String} props.roles Array of allowed roles or single role string
 * @param {React.ReactNode} props.children Child components to render if access is granted
 * @returns {JSX.Element} Protected route component
 */
const ProtectedRoute = ({ roles, children }) => {
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  const { openModal } = useModal();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  // Use useCallback to memoize the function and prevent unnecessary re-renders
  const checkRoleAccess = useCallback(() => {
    if (!roles) return true; // No role restriction
    if (!currentUser || !currentUser.role) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(currentUser.role);
    }
    
    return currentUser.role === roles;
  }, [roles, currentUser]);

  useEffect(() => {
    // Check authentication and permissions
    if (!isAuthenticated) {
      openModal({
        title: 'Authentication Required',
        message: 'You need to log in to access this page.',
        confirmText: 'Log In',
        type: 'info',
        onConfirm: () => navigate('/login')
      });
      setIsReady(true);
    } else if (roles && !checkRoleAccess()) {
      openModal({
        title: 'Access Denied',
        message: 'You do not have permission to access this page.',
        confirmText: 'OK',
        type: 'warning'
      });
      setIsReady(true);
    } else {
      setIsReady(true);
    }
  }, [isAuthenticated, currentUser, roles, navigate, openModal, checkRoleAccess]);

  if (!isReady) {
    return null; // Wait until we've determined authentication state
  }

  // Render based on authentication state and permissions
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !checkRoleAccess()) {
    return <Navigate to="/" replace />;
  }

  // If authenticated and has required role, render children
  return children;
};

export default ProtectedRoute;
