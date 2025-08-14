import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import CartIcon from '../cart/CartIcon';

const Navbar = () => {
  const context = useContext(AuthContext);
  const { currentUser, token, logout } = context || { currentUser: null, token: null, logout: () => {} };
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  // Determine if user is authenticated based on token
  const isAuthenticated = !!token;

  // Get dashboard link based on user role
  const getDashboardLink = () => {
    if (!currentUser) return '/login';
    
    switch (currentUser?.role) {
      case 'admin':
        return '/admin';
      case 'seller':
        return '/seller';
      case 'customer':
        return '/customer';
      default:
        return '/dashboard';
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-green-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-xl font-bold flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM2.5 10a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z" clipRule="evenodd" />
              <path d="M10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6z" />
              <path d="M10 14a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            <span>Ayurvedic Products</span>
          </Link>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/" className="hover:text-green-300 transition">Home</Link>
            <Link to="/products" className="hover:text-green-300 transition">Products</Link>
            
            {isAuthenticated ? (
              <>
                {/* Admin Links */}
                {currentUser?.role === 'admin' && (
                  <>
                    <Link to="/admin/users" className="hover:text-green-300 transition">Users</Link>
                    <Link to="/admin/products" className="hover:text-green-300 transition">Products</Link>
                    <Link to="/admin/orders" className="hover:text-green-300 transition">Orders</Link>
                  </>
                )}
                
                {/* Seller Links */}
                {currentUser?.role === 'seller' && (
                  <>
                    <Link to="/seller/products" className="hover:text-green-300 transition">My Products</Link>
                    <Link to="/seller/orders" className="hover:text-green-300 transition">Orders</Link>
                  </>
                )}
                
                {/* Customer Links */}
                {currentUser?.role === 'customer' && (
                  <>
                    <Link to="/customer/orders" className="hover:text-green-300 transition">My Orders</Link>
                  </>
                )}
                
                {/* Profile Dropdown */}
                <div className="relative ml-3">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center hover:text-green-300 transition"
                  >
                    <span className="mr-1">{currentUser?.name || 'User'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-10">
                      <Link 
                        to={getDashboardLink()} 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link 
                        to={currentUser?.role ? `/${currentUser.role}/profile` : '/profile'} 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Cart Icon (only for customers) */}
                {(currentUser?.role === 'customer' || !currentUser?.role) && (
                  <CartIcon />
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-green-300 transition">Login</Link>
                <Link to="/register" className="hover:text-green-300 transition">Register</Link>
                <CartIcon />
              </>
            )}
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 bg-green-700">
            <Link to="/" className="block py-2 px-4 hover:bg-green-600">Home</Link>
            <Link to="/products" className="block py-2 px-4 hover:bg-green-600">Products</Link>
            
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="block py-2 px-4 hover:bg-green-600">Dashboard</Link>
                
                {/* Role-specific mobile menu items */}
                {currentUser?.role === 'admin' && (
                  <>
                    <Link to="/admin/users" className="block py-2 px-4 hover:bg-green-600">Users</Link>
                    <Link to="/admin/products" className="block py-2 px-4 hover:bg-green-600">Products</Link>
                    <Link to="/admin/orders" className="block py-2 px-4 hover:bg-green-600">Orders</Link>
                  </>
                )}
                
                {currentUser?.role === 'seller' && (
                  <>
                    <Link to="/seller/products" className="block py-2 px-4 hover:bg-green-600">My Products</Link>
                    <Link to="/seller/orders" className="block py-2 px-4 hover:bg-green-600">Orders</Link>
                  </>
                )}
                
                {currentUser?.role === 'customer' && (
                  <>
                    <Link to="/customer/orders" className="block py-2 px-4 hover:bg-green-600">My Orders</Link>
                    <Link to="/customer/cart" className="flex items-center py-2 px-4 hover:bg-green-600">
                      <span className="mr-2">Cart</span>
                      <CartIcon />
                    </Link>
                  </>
                )}
                
                <Link to={currentUser?.role ? `/${currentUser.role}/profile` : '/profile'} className="block py-2 px-4 hover:bg-green-600">Profile</Link>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left py-2 px-4 hover:bg-green-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 px-4 hover:bg-green-600">Login</Link>
                <Link to="/register" className="block py-2 px-4 hover:bg-green-600">Register</Link>
                <Link to="/cart" className="flex items-center py-2 px-4 hover:bg-green-600">
                  <span className="mr-2">Cart</span>
                  <CartIcon />
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
