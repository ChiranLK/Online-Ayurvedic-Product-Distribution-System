import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';

const CartIcon = () => {
  const [cartCount, setCartCount] = useState(0);
  const { isAuthenticated, isCustomer } = useContext(AuthContext);
  const { openModal } = useModal();
  const navigate = useNavigate();

  useEffect(() => {
    // Update cart count when component mounts
    updateCartCount();

    // Set up event listener for storage events
    window.addEventListener('storage', updateCartCount);
    
    // Custom event listener for cart updates from same window
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('ayurvedicCart')) || [];
    console.log('CartIcon - Cart from localStorage:', cart);
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    console.log('CartIcon - Cart count:', count);
    setCartCount(count);
  };
  
  const handleCartClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      
      // Use custom modal instead of default browser confirm
      openModal({
        title: 'Login Required',
        message: 'You need to log in to view your cart. Would you like to log in now?',
        confirmText: 'Log In',
        cancelText: 'Cancel',
        onConfirm: () => navigate('/login', { state: { from: '/cart' } }),
        type: 'info'
      });
    } else if (!isCustomer()) {
      e.preventDefault();
      
      // Use custom modal instead of default browser alert
      openModal({
        title: 'Access Denied',
        message: 'Only customers can access the shopping cart.',
        confirmText: 'OK',
        type: 'warning'
      });
    }
  };

  return (
    <Link to="/cart" className="relative inline-block" onClick={handleCartClick}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      {isAuthenticated && isCustomer() && cartCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
          {cartCount}
        </span>
      )}
    </Link>
  );
};

export default CartIcon;
